import {redirect} from "next/navigation";

import {createClient} from "@/lib/supabase/server";

export default async function ChatPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/");
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="w-full px-4 lg:px-6">
          HERE
        </div>
      </div>
    </div>
  );
}
