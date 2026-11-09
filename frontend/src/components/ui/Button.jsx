import React from "react";
import { Loader2 } from "lucide-react";

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon: Icon,
  iconRight: IconRight,
  className = "",
  type = "button",
  onClick,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium whitespace-nowrap transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/80 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none rounded-[5px] tracking-tight cursor-pointer";

  const sizeStyles = {
    xs: "h-6 px-2 text-[11px] gap-1",
    sm: "h-7 px-2.5 text-xs gap-1.5",
    md: "h-8 px-3 text-xs gap-2",
    lg: "h-10 px-4 text-sm gap-2",
  };

  const variantStyles = {
    primary:
      "bg-accent hover:bg-accent-hover text-accent-contrast shadow-xs border border-accent/20 active:brightness-95",
    secondary:
      "bg-surface hover:bg-surface-hover text-content-primary border border-border shadow-xs active:bg-surface-subtle",
    outline:
      "bg-transparent hover:bg-surface-hover text-content-primary border border-border-strong active:bg-surface-subtle",
    subtle:
      "bg-transparent hover:bg-surface-hover text-content-secondary hover:text-content-primary active:bg-surface-subtle border border-transparent",
    danger:
      "bg-semantic-error-bg hover:bg-semantic-error-border/40 text-semantic-error-text border border-semantic-error-border active:brightness-95",
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
        <Loader2 className="w-3.5 h-3.5 animate-spin text-current shrink-0" />
      ) : Icon ? (
        <Icon className="w-3.5 h-3.5 shrink-0" />
      ) : null}
      {children && <span className="truncate">{children}</span>}
      {!loading && IconRight && <IconRight className="w-3.5 h-3.5 shrink-0" />}
    </button>
  );
}

export function IconButton({
  icon: Icon,
  label,
  size = "md",
  variant = "subtle",
  disabled = false,
  loading = false,
  className = "",
  onClick,
  ...props
}) {
  const sizeStyles = {
    xs: "w-6 h-6 p-1",
    sm: "w-7 h-7 p-1.5",
    md: "w-8 h-8 p-2",
    lg: "w-10 h-10 p-2.5",
  };

  const variantStyles = {
    subtle:
      "bg-transparent hover:bg-surface-hover text-content-secondary hover:text-content-primary active:bg-surface-subtle border border-transparent",
    secondary:
      "bg-surface hover:bg-surface-hover text-content-primary border border-border shadow-xs",
    primary:
      "bg-accent hover:bg-accent-hover text-accent-contrast shadow-xs border border-accent/20",
  };

  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center rounded-[5px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/80 focus-visible:ring-offset-1 disabled:opacity-40 disabled:pointer-events-none cursor-pointer ${
        sizeStyles[size] || sizeStyles.md
      } ${variantStyles[variant] || variantStyles.subtle} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
    </button>
  );
}
