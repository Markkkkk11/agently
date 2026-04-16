import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <span className="mb-4 text-6xl">🔍</span>
      <h1 className="mb-2 text-2xl font-bold text-foreground">
        Страница не найдена
      </h1>
      <p className="mb-6 text-foreground/50">
        Запрашиваемая страница не существует или была удалена
      </p>
      <Link
        href="/"
        className="rounded-btn bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
      >
        На главную
      </Link>
    </main>
  );
}
