import React from 'react';
import { cn } from '../lib/utils';
import { Loader2 } from 'lucide-react';

// ── Button ──────────────────────────────────────────────────────
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

export function Button({
  variant = 'secondary', size = 'md', loading = false,
  className, children, disabled, ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant; size?: ButtonSize; loading?: boolean;
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:opacity-50 disabled:pointer-events-none';
  const variants = {
    primary: 'bg-accent hover:bg-accent-hover text-white shadow-sm',
    secondary: 'bg-surface border border-border hover:bg-zinc-50 text-text-primary shadow-xs',
    ghost: 'hover:bg-zinc-100 text-text-secondary hover:text-text-primary',
    destructive: 'bg-red-50 border border-red-200 text-accent hover:bg-accent hover:text-white',
  };
  const sizes = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-9 px-4 text-sm',
    lg: 'h-10 px-5 text-base',
  };
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {children}
    </button>
  );
}

// ── Badge ──────────────────────────────────────────────────────
type BadgeVariant = 'default' | 'accent' | 'success' | 'warning' | 'outline';

export function Badge({ variant = 'default', className, children }: {
  variant?: BadgeVariant; className?: string; children: React.ReactNode;
}) {
  const variants = {
    default: 'bg-zinc-100 text-text-secondary',
    accent: 'bg-accent-muted border border-accent-border text-accent',
    success: 'bg-green-50 border border-green-200 text-green-700',
    warning: 'bg-yellow-50 border border-yellow-200 text-yellow-700',
    outline: 'border border-border text-text-secondary',
  };
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-2xs font-semibold uppercase tracking-wider', variants[variant], className)}>
      {children}
    </span>
  );
}

// ── Card ──────────────────────────────────────────────────────
export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('bg-surface rounded-xl border border-border shadow-xs', className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('px-5 py-4 border-b border-border', className)}>{children}</div>;
}

export function CardContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('px-5 py-4', className)}>{children}</div>;
}

// ── Input ──────────────────────────────────────────────────────
export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn('w-full h-9 px-3 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/50 transition-all', className)}
      {...props}
    />
  );
}

// ── Select ──────────────────────────────────────────────────────
export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn('w-full h-9 px-3 bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/50 transition-all appearance-none', className)}
      {...props}
    />
  );
}

// ── Label ──────────────────────────────────────────────────────
export function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <label className={cn('block text-xs font-medium text-text-secondary mb-1.5', className)}>
      {children}
    </label>
  );
}

// ── Divider ──────────────────────────────────────────────────────
export function Divider({ className }: { className?: string }) {
  return <hr className={cn('border-border', className)} />;
}

// ── Section Header ──────────────────────────────────────────────────────
export function SectionHeader({ step, title, description }: {
  step?: number; title: string; description?: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-4">
      {step && (
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-zinc-900 text-white text-xs font-bold flex items-center justify-center mt-0.5">
          {step}
        </div>
      )}
      <div>
        <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
        {description && <p className="text-xs text-text-tertiary mt-0.5">{description}</p>}
      </div>
    </div>
  );
}

// ── Empty State ──────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description }: {
  icon: React.ComponentType<any>; title: string; description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-text-tertiary" />
      </div>
      <p className="text-sm font-medium text-text-secondary">{title}</p>
      {description && <p className="text-xs text-text-tertiary mt-1 max-w-[200px]">{description}</p>}
    </div>
  );
}
