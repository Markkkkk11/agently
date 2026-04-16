"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <span className="mb-4 text-6xl">⚠️</span>
      <h1 className="mb-2 text-2xl font-bold text-foreground">
        Что-то пошло не так
      </h1>
      <p className="mb-6 text-foreground/50">
        Произошла непредвиденная ошибка. Попробуйте обновить страницу.
      </p>
      <button
        onClick={reset}
        className="rounded-btn bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
      >
        Попробовать снова
      </button>
    </main>
  );
}
