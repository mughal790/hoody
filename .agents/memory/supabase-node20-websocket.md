---
name: Supabase JS in Node 20 backend
description: supabase-js throws a native WebSocket error on server-side Node 20 unless a ws transport is explicitly provided.
---

Calling `createClient()` from `@supabase/supabase-js` in a **server-side** (Node, not browser) context on Node.js 20 throws: `Error: Node.js 20 detected without native WebSocket support`, because the realtime module expects a global `WebSocket` that Node 20 doesn't provide (Node 22+ does).

**Why:** `@supabase/realtime-js` initializes a `RealtimeClient` on every `createClient()` call, even if realtime subscriptions are never used, and it requires a WebSocket constructor.

**How to apply:** Install the `ws` package and pass it explicitly:
```ts
import { createClient } from '@supabase/supabase-js'
import ws from 'ws'

export const supabase = createClient(url, key, {
  realtime: { transport: ws as any },
})
```
A plain `as unknown as typeof WebSocket` cast fails typecheck (incompatible `onerror` event types between Node's `ws` and DOM `WebSocket`) — use `as any` for the transport field instead. Apply this any time Supabase JS is used in a Node backend (Express, etc.), not just when Node < 22.
