import React from "react";
import { Loader2 } from "lucide-react";

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon: Icon,
  className = "",
  type = "button",
  onClick,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none rounded-md";

  const sizeStyles = {
    sm: "h-7 px-2.5 text-xs gap-1.5",
    md: "h-9 px-3.5 text-xs gap-2",
    lg: "h-11 px-5 text-sm gap-2.5",
  };

  const variantStyles = {
    primary:
      "bg-accent hover:bg-accent-hover text-white shadow-sm border border-transparent active:brightness-95",
    secondary:
      "bg-surface hover:bg-surface-hover text-content-primary border border-border shadow-sm active:bg-surface-subtle",
    subtle:
      "bg-transparent hover:bg-surface-hover text-content-secondary hover:text-content-primary active:bg-surface-subtle",
    destructive:
      "bg-semantic-error-bg hover:opacity-90 text-semantic-error-text border border-semantic-error-border active:brightness-95",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${
        variantStyles[variant] || variantStyles.primary
      } ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}

