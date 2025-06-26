import { Skeleton } from "@/components/ui/skeleton";
import { Suspense, lazy } from "react";

export const ReactMarkdown = lazy(() => import("react-markdown"));

export const MarkdownSkeleton = () => {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-3/4 rounded" />
      <Skeleton className="h-4 w-full rounded" />
      <Skeleton className="h-4 w-5/6 rounded" />
      <Skeleton className="h-4 w-2/3 rounded" />
      <div className="py-1" />
      <Skeleton className="h-4 w-full rounded" />
      <Skeleton className="h-4 w-4/5 rounded" />
    </div>
  );
};

export const ChatContentRenderer = ({ content }: { content: string }) => {
  return (
    <Suspense fallback={<MarkdownSkeleton />}>
      <ReactMarkdown
        components={{
          a: ({ href, ...props }) => (
            <a
              target="_blank"
              href={href}
              rel="noreferrer"
              className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
              {...props}
            />
          ),
          p: ({ ...props }) => <p className="mb-2" {...props} />,
          h1: ({ ...props }) => (
            <h1 className="text-2xl font-bold mb-3" {...props} />
          ),
          h2: ({ ...props }) => (
            <h2 className="text-xl font-bold mb-2" {...props} />
          ),
          h3: ({ ...props }) => (
            <h3 className="text-lg font-bold mb-1" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </Suspense>
  );
};
