import ImageCompressor from "@/components/ImageCompressor";

export default function Home() {
  return (
    <main className="min-h-screen p-4">
      <div className="container mx-auto">
        {/* @ts-expect-error Async Server Component */}
        <ImageCompressor />
      </div>
    </main>
  );
}
