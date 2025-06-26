"use server"

import {createClient} from "@/lib/supabase/server";
import {redirect} from "next/navigation";

export async function login(_prevState: any, formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.toString(),
      password: password.toString(),
    });

    if (error) {
      return { error: error.message };
    }

    redirect("/chat");
  } catch (e) {
    console.error("Login error:", e);
    return { error: "An unexpected error occurred. Please try again." };
  }
}
