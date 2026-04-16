interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({
  children,
  className = "",
  hover = false,
  onClick,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-card border border-border bg-white p-5 shadow-card transition-all duration-150 ${
        hover
          ? "cursor-pointer hover:border-accent/40 hover:shadow-card-hover hover:scale-[1.01]"
          : ""
      } ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
