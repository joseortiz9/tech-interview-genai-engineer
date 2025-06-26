"use server";

import { createClient } from "@/lib/supabase/server";
import type { ChatQuery } from "@/types";

export async function getAllChatsForSession(): Promise<ChatQuery[]> {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();

  if (!user?.user?.id) {
    console.error("User not authenticated");
    return [];
  }

  const { data: chats, error } = await supabase
    .from("chats")
    .select("*")
    .eq("user_id", user.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching chats:", error.message);
    return [];
  }

  return chats as ChatQuery[];
}

export async function getChatDetails(
  chatId: string,
): Promise<ChatQuery | null> {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();

  if (!user?.user?.id) {
    console.error("User not authenticated");
    return null;
  }

  const { data: chat, error: chatError } = await supabase
    .from("chats")
    .select("*")
    .eq("id", chatId)
    .eq("user_id", user.user.id)
    .single();

  if (chatError) {
    console.error("Error fetching chat:", chatError.message);
    return null;
  }

  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (messagesError) {
    console.error("Error fetching messages:", messagesError.message);
    return null;
  }

  return { ...chat, messages };
}
