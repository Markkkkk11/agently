import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Agently",
    template: "%s | Agently",
  },
  description:
    "Agently — виртуальная команда AI-агентов для вашего бизнеса. Сайт, дизайн, CRM, маркетинг — всё через один интерфейс.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
