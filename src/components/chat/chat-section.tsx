"use client";

import { ChatMessagesList } from "@/components/chat/chat-messages-list";
import { ChatQueryForm } from "@/components/chat/chat-query-form";
import { useChat } from "@/hooks/use-chat";
import {ChatMessage} from "@/types";

type ChatSectionProps = {
  initialMessages?: ChatMessage[]
};

export const ChatSection = ({ initialMessages }: ChatSectionProps) => {
  const { messages, isLoading, handleSubmit, handleCancel } = useChat(initialMessages);

  return (
    <>
      <div className="p-4 flex flex-col flex-1">
        <ChatMessagesList isLoading={isLoading} messages={messages} />
      </div>
      <div className="border-t p-4 sticky bottom-0 bg-background flex flex-col gap-2">
        <ChatQueryForm
          isLoading={isLoading}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
        <span className="text-sm text-muted-foreground w-full text-center">
          The answers can have mistakes, so double-check it
        </span>
      </div>
    </>
  );
};
