// Response helpers shared by the Edge Functions.

// The checkout is called from the browser. '*' is fine: the endpoint is public
// anyway (shoppers aren't logged in) and no cookies are involved.
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

export const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...headers },
  })

// Thrown for anything the customer can fix; becomes { error, ...extra }.
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public extra: Record<string, unknown> = {},
  ) {
    super(message)
  }
}

export function env(name: string): string {
  const value = Deno.env.get(name)
  if (!value) throw new Error(`Missing env var ${name}`)
  return value
}
