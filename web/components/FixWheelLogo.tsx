import Image from "next/image";

interface FixWheelLogoProps {
  size?: number;
  className?: string;
}

export function FixWheelLogo({ size = 110, className = "" }: FixWheelLogoProps) {
  return (
    <Image
      src="/images/fix-wheel.png"
      alt="FixWheel"
      width={size}
      height={size}
      className={`object-contain ${className}`.trim()}
      priority
    />
  );
}
