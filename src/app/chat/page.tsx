import Link from "next/link";
import { ChatContainer } from "@/components/chat/ChatContainer";

export default function ChatPage() {
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-newspaper-border bg-white px-6 py-4">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <Link href="/" className="text-2xl font-bold text-newspaper-text font-serif">
            AI Feed
          </Link>
          <Link
            href="/feed"
            className="text-newspaper-accent hover:underline font-medium"
          >
            View Feed →
          </Link>
        </div>
      </header>

      {/* Chat */}
      <main className="flex-1 overflow-hidden">
        <ChatContainer />
      </main>
    </div>
  );
}
