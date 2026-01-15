import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold mb-4 text-newspaper-text">
          AI Feed
        </h1>
        <p className="text-xl text-newspaper-muted mb-8">
          Tell me what you care about, and I&apos;ll curate the latest news and insights just for you.
        </p>
        <Link
          href="/chat"
          className="inline-block bg-newspaper-accent text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Start a Conversation
        </Link>
      </div>
    </main>
  );
}
