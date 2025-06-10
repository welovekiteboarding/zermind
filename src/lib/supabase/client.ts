import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Disable realtime if you're not using it to avoid webpack warnings
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
      // You can completely disable realtime by uncommenting the line below
      // realtime: false,
    }
  );
}