type BadgeVariant = "active" | "draft" | "frozen" | "paused" | "default";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  active: "bg-green-50 text-green-700",
  draft: "bg-gray-100 text-gray-600",
  frozen: "bg-blue-50 text-blue-700",
  paused: "bg-yellow-50 text-yellow-700",
  default: "bg-gray-100 text-gray-600",
};

export default function Badge({
  variant = "default",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
