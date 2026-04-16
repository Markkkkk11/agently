"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "0",
    tokens: "10 000",
    images: "3",
    projects: "5",
    current: false,
  },
  {
    id: "basic",
    name: "Basic",
    price: "990",
    tokens: "50 000",
    images: "10",
    projects: "15",
    current: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "2 490",
    tokens: "200 000",
    images: "50",
    projects: "50",
    current: false,
  },
  {
    id: "ultra",
    name: "Ultra",
    price: "4 990",
    tokens: "500 000",
    images: "200",
    projects: "200",
    current: false,
  },
];

export default function BillingPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, fetchMe } = useAuthStore();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const currentPlan = user?.plan ?? "free";

  return (
    <div className="p-8">
      <div className="mx-auto max-w-4xl">
        <button
          onClick={() => router.push("/settings")}
          className="mb-4 text-sm text-foreground/50 hover:text-foreground transition-colors"
        >
          ← Настройки
        </button>

        <h1 className="mb-2 text-2xl font-bold text-foreground">
          Тариф и оплата
        </h1>
        <p className="mb-8 text-foreground/50">
          Управление подпиской и лимитами
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => {
            const isCurrent = plan.id === currentPlan;
            return (
              <Card
                key={plan.id}
                className={`flex flex-col ${isCurrent ? "border-accent ring-1 ring-accent" : ""}`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-foreground">
                    {plan.name}
                  </h3>
                  {isCurrent && <Badge variant="active">Текущий</Badge>}
                </div>

                <div className="mb-4">
                  <span className="text-3xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  {plan.price !== "0" && (
                    <span className="text-sm text-foreground/50"> руб/мес</span>
                  )}
                  {plan.price === "0" && (
                    <span className="text-sm text-foreground/50"> бесплатно</span>
                  )}
                </div>

                <ul className="mb-6 flex-1 space-y-2 text-sm text-foreground/70">
                  <li>{plan.tokens} токенов/день</li>
                  <li>{plan.images} изображений/день</li>
                  <li>{plan.projects} проектов</li>
                </ul>

                {isCurrent ? (
                  <Button variant="secondary" disabled className="w-full">
                    Текущий тариф
                  </Button>
                ) : (
                  <Button
                    variant={plan.id === "pro" ? "primary" : "secondary"}
                    className="w-full"
                    onClick={() =>
                      alert("Оплата будет доступна в следующей версии")
                    }
                  >
                    {plan.price === "0" ? "Перейти" : "Подключить"}
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
