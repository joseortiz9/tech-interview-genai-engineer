import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pause } from "lucide-react";
import { Send } from "lucide-react";
import { type FormEvent, useCallback } from "react";

type ChatQueryFormProps = {
  isLoading: boolean;
  onSubmit: (query: string) => void;
  onCancel: () => void;
};

export const ChatQueryForm = ({
  isLoading,
  onSubmit,
  onCancel,
}: ChatQueryFormProps) => {
  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const query = formData.get("query");
      if (typeof query !== "string" || query.trim() === "") {
        return;
      }
      onSubmit(query.trim());
      event.currentTarget.reset();
    },
    [onSubmit],
  );

  return (
    <form className="flex w-full gap-2" onSubmit={handleSubmit}>
      <div className="relative w-full">
        <Textarea
          autoFocus
          required
          name="query"
          placeholder="Type your query here..."
          className="p-4 text-lg pr-12 resize-none overflow-hidden"
        />
        <div className="absolute top-1/2 right-2 -translate-y-1/2">
          {isLoading ? (
            <Button
              size="icon"
              variant="ghost"
              onClick={onCancel}
            >
              <Pause className="h-6 w-6" />
              <span className="sr-only">Cancel</span>
            </Button>
            ) : (
            <Button
              type="submit"
              size="icon"
              variant="ghost"
            >
              <Send className="h-6 w-6" />
              <span className="sr-only">Send</span>
            </Button>
          )}
        </div>
      </div>
    </form>
  );
};
