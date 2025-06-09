import { createClient } from "@/lib/supabase/server";

export default async function ProtectedPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  return (
    <div className="flex h-full items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-8">Welcome to Zermind</h1>
        <p className="text-muted-foreground">
          Hello <span className="font-semibold">{data?.user?.email}</span>
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Create a new chat to get started or select an existing one from the
          sidebar.
        </p>
      </div>
    </div>
  );
}
