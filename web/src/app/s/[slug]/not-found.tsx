import Link from "next/link";

export default function StoryNotFound() {
  return (
    <div className="mx-auto max-w-[900px] px-6 py-24 text-center">
      <h1 className="text-2xl font-black text-on-surface">Story not found</h1>
      <p className="mt-2 text-on-surface-variant">
        That brief is not available for the selected date or filename.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block font-semibold text-primary underline-offset-4 hover:underline"
      >
        Back to feed
      </Link>
    </div>
  );
}
