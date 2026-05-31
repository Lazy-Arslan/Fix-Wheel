"use client";

interface RoleChoiceButtonProps {
  emoji: string;
  label: string;
  subtitle?: string;
  onClick: () => void;
}

export function RoleChoiceButton({ emoji, label, subtitle, onClick }: RoleChoiceButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full cursor-pointer items-center gap-4 rounded-xl border-2 border-[var(--fw-border)] bg-white p-5 text-left transition-all duration-200 hover:border-[var(--fw-blue)] hover:shadow-lg active:scale-[0.99]"
    >
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--fw-navy)] to-[var(--fw-blue)] text-2xl transition-transform group-hover:scale-105">
        {emoji}
      </span>
      <div>
        <span className="block text-lg font-extrabold text-[var(--fw-navy)]">{label}</span>
        {subtitle && (
          <span className="mt-0.5 block text-sm text-slate-500">{subtitle}</span>
        )}
      </div>
      <span className="ml-auto text-[var(--fw-orange)] opacity-0 transition-opacity group-hover:opacity-100">
        →
      </span>
    </button>
  );
}
