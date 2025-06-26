import { ChatSection } from "@/components/chat";
import { getChatDetails } from "@/lib/rag/queries";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SpecificChatPage({ params }: PageProps) {
  const { id } = await params;
  const chatDetails = await getChatDetails(id);

  if (!chatDetails) {
    return notFound();
  }

  return (
    <div className="@container/main flex flex-1 flex-col">
      <ChatSection initialMessages={chatDetails.messages} />
    </div>
  );
}
