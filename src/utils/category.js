// Category names come from Supabase in English; show the translation for the
// slug (src/locales/*.json, "categories.<slug>"), falling back to the DB name
// for categories added later without a translation.
export const categoryName = (t, category) => t(`categories.${category.slug}`, { defaultValue: category.name })
