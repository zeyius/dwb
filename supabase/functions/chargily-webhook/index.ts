// Entry point. The logic is in handler.ts so tests can import it without
// starting a server.
import { handler } from './handler.ts'

Deno.serve(handler)
