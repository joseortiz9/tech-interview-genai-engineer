import { submitQuery } from "@/lib/rag/actions";
import type { ChatMessage } from "@/types";
import { readStreamableValue } from "ai/rsc";
import { useCallback, useRef, useState } from "react";

const defaultSystemMessage: ChatMessage = {
  id: "id",
  content:
    "Hello! I'm your AI-powered economic research chatbot for AlbertaPerspectives.ca. I'm here to help you explore and understand economic data and business insights relevant to Alberta.\n" +
    "\n" +
    "Feel free to ask me any questions about the existing research reports. I'll do my best to provide you with accurate information directly from our data.\n" +
    "\n" +
    "What economic insights are you looking for today?",
  role: "system",
  created_at: new Date(),
};

export const useChat = (initialMessages: ChatMessage[] = []) => {
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessages.length > 0 ? initialMessages : [defaultSystemMessage],
  );
  const [isLoading, setIsLoading] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSubmit = useCallback(async (query: string) => {
    // If a request is already in flight, cancel it
    abortControllerRef.current?.abort();

    const newController = new AbortController();
    abortControllerRef.current = newController;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      content: query,
      role: "user",
      created_at: new Date(),
    };

    const systemMessagePlaceholder: ChatMessage = {
      id: crypto.randomUUID(),
      content: "",
      role: "system",
      created_at: new Date(),
    };

    setIsLoading(true);

    // Optimistically update the UI
    setMessages((prev) => [...prev, userMessage, systemMessagePlaceholder]);

    try {
      const { stream } = await submitQuery(query);

      let fullResponse = "";
      for await (const delta of readStreamableValue(stream)) {
        if (newController.signal.aborted) {
          fullResponse = "The request was cancelled.";
          break;
        }

        fullResponse += delta;
        // Update the system message placeholder with the streaming content
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === systemMessagePlaceholder.id
              ? { ...msg, content: fullResponse }
              : msg,
          ),
        );
      }
    } catch (e) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === systemMessagePlaceholder.id
            ? { ...msg, content: "Sorry, an error occurred." }
            : msg,
        ),
      );
    } finally {
      setIsLoading(false);
      if (abortControllerRef.current === newController) {
        abortControllerRef.current = null;
      }
    }
  }, []);

  const handleCancel = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  return {
    isLoading,
    messages,
    handleSubmit,
    handleCancel,
  };
};
