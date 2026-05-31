"use client";

interface RoleChoiceButtonProps {
  emoji: string;
  label: string;
  onClick: () => void;
}

export function RoleChoiceButton({ emoji, label, onClick }: RoleChoiceButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group mb-5 h-20 w-full cursor-pointer rounded-[10px] bg-[#003366] text-lg font-bold text-white shadow-md transition-all duration-200 ease-out hover:scale-[1.03] hover:bg-[#004080] hover:shadow-lg active:scale-[0.98] last:mb-0"
    >
      <span className="inline-block transition-transform duration-200 group-hover:scale-110">
        {emoji} {label}
      </span>
    </button>
  );
}
