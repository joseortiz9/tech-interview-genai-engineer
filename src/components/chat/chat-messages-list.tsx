import { ChatContentRenderer } from "@/components/chat/chat-content-renderer";
import { Avatar } from "@/components/ui/avatar";
import { useLoadingDots } from "@/hooks/use-loading-dots";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { AnimatePresence, motion } from "motion/react";
import { type HTMLAttributes, memo, useEffect, useRef } from "react";

dayjs.extend(relativeTime);

const formatTimestamp = (timestamp: string) =>
  dayjs(timestamp).fromNow();

const AvatarFallback = ({
  variant = "primary",
  ...props
}: HTMLAttributes<HTMLDivElement> & { variant?: "primary" | "secondary" }) => (
  <div
    className={cn(
      "flex h-full w-full items-center justify-center text-xs",
      variant === "secondary"
        ? "bg-secondary text-secondary-foreground"
        : "bg-primary text-primary-foreground ",
    )}
    {...props}
  />
);

const SystemMessage = memo(({ message }: { message: ChatMessage }) => {
  if (!message.content) {
    return null;
  }

  return (
    <div className="flex justify-start gap-3">
      <Avatar className="h-8 w-8">
        <AvatarFallback>AI</AvatarFallback>
      </Avatar>
      <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted">
        <ChatContentRenderer content={message.content} />
        <div className="mt-1 text-xs opacity-70">
          {formatTimestamp(message.created_at)}
        </div>
      </div>
    </div>
  );
});

const UserMessage = memo(({ message }: { message: ChatMessage }) => {
  return (
    <div className="flex justify-end gap-3">
      <div className="max-w-[80%] rounded-lg px-4 py-2 bg-primary text-primary-foreground">
        <p className="mb-2">{message.content}</p>
        <div className="mt-1 text-xs opacity-70">
          {formatTimestamp(message.created_at)}
        </div>
      </div>
      <Avatar className="h-8 w-8">
        <AvatarFallback variant="secondary">You</AvatarFallback>
      </Avatar>
    </div>
  );
});

const msgAnimationProps = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.5 },
};

interface ChatMessagesListProps {
  isLoading: boolean;
  messages: ChatMessage[];
}

export const ChatMessagesList = ({
  isLoading,
  messages,
}: ChatMessagesListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const loadingDotsStr = useLoadingDots(isLoading);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="flex flex-col gap-4">
      <AnimatePresence initial={false}>
        {messages.map((message) => (
          <motion.div key={message.id} {...msgAnimationProps}>
            {message.role === "user" ? (
              <UserMessage message={message} />
            ) : (
              <SystemMessage message={message} />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
      <div ref={messagesEndRef} />
      {isLoading && (
        <span className="text-sm text-muted-foreground">
          Loading response{loadingDotsStr}
        </span>
      )}
    </div>
  );
};
