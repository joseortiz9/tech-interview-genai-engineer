export interface ChatEntity {
  id: string;
  title: string;
  user_id: string;
  created_at: string;
}

export interface ChatQuery extends ChatEntity {
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "system";
  created_at: string;
}


