import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = "", ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={`w-full rounded-btn border bg-white px-4 py-2.5 text-sm text-foreground outline-none transition-all duration-150 placeholder:text-foreground/30 focus:border-accent focus:ring-1 focus:ring-accent ${
            icon ? "pl-10" : ""
          } ${error ? "border-red-400" : "border-border"} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
);

Input.displayName = "Input";
export default Input;
