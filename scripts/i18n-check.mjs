// npm run i18n:check
// Compares src/locales/{ar,fr}.json against en.json (the reference) and lists
// missing and extra keys per language. Plural keys (key_one, key_other...) are
// expected in the forms each language actually uses (CLDR, via
// Intl.PluralRules): en one/other, fr one/many/other, ar zero/one/two/few/many/other.
// i18next shows the raw key when a needed form is missing, so those count as
// missing. Exits 1 if anything is missing or extra.
import { readFileSync } from 'node:fs'

const DIR = new URL('../src/locales/', import.meta.url)
const REFERENCE = 'en'
const LANGUAGES = ['ar', 'fr']
const PLURAL = /_(zero|one|two|few|many|other)$/

const load = (lang) => JSON.parse(readFileSync(new URL(`${lang}.json`, DIR), 'utf8'))
const flatten = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) => (v && typeof v === 'object' ? flatten(v, `${prefix}${k}.`) : [`${prefix}${k}`]))

// Expected keys for a language: every reference key, with plural keys
// expanded to that language's plural forms.
function expectedKeys(referenceKeys, lang) {
  const forms = new Intl.PluralRules(lang).resolvedOptions().pluralCategories
  const plurals = new Set(referenceKeys.filter((k) => PLURAL.test(k)).map((k) => k.replace(PLURAL, '')))
  const plain = referenceKeys.filter((k) => !PLURAL.test(k))
  return new Set([...plain, ...[...plurals].flatMap((base) => forms.map((f) => `${base}_${f}`))])
}

const referenceKeys = flatten(load(REFERENCE))
let problems = 0
for (const lang of [REFERENCE, ...LANGUAGES]) {
  const expected = expectedKeys(referenceKeys, lang)
  const actual = new Set(flatten(load(lang)))
  const missing = [...expected].filter((k) => !actual.has(k))
  const extra = [...actual].filter((k) => !expected.has(k))
  problems += missing.length + extra.length
  const status = missing.length || extra.length ? '✗' : '✓'
  console.log(`${status} ${lang}.json: ${actual.size} keys, ${missing.length} missing, ${extra.length} extra`)
  for (const k of missing) console.log(`    missing  ${k}`)
  for (const k of extra) console.log(`    extra    ${k}`)
}
process.exit(problems ? 1 : 0)
