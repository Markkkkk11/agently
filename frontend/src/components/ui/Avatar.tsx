interface AvatarProps {
  icon: string;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const AGENT_COLORS: Record<string, string> = {
  code: "bg-blue-100",
  palette: "bg-pink-100",
  users: "bg-purple-100",
  headphones: "bg-teal-100",
  megaphone: "bg-orange-100",
  search: "bg-green-100",
  "bar-chart": "bg-indigo-100",
};

const AGENT_ICONS: Record<string, string> = {
  code: "\uD83D\uDCBB",
  palette: "\uD83C\uDFA8",
  users: "\uD83D\uDC65",
  headphones: "\uD83C\uDFA7",
  megaphone: "\uD83D\uDCE2",
  search: "\uD83D\uDD0D",
  "bar-chart": "\uD83D\uDCCA",
};

const sizeStyles = {
  sm: "h-8 w-8 text-base",
  md: "h-10 w-10 text-xl",
  lg: "h-14 w-14 text-3xl",
};

export default function Avatar({
  icon,
  name,
  size = "md",
  className = "",
}: AvatarProps) {
  const bg = AGENT_COLORS[icon] ?? "bg-gray-100";
  const emoji = AGENT_ICONS[icon] ?? "\uD83E\uDD16";

  return (
    <div
      className={`flex items-center justify-center rounded-full ${bg} ${sizeStyles[size]} ${className}`}
      title={name}
    >
      {emoji}
    </div>
  );
}
