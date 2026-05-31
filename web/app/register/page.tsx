"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FixWheelLogo } from "@/components/FixWheelLogo";
import { RoleChoiceButton } from "@/components/RoleChoiceButton";

export default function RegisterMainPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f5f5] p-5">
      <div className="mb-10 flex w-full max-w-md flex-col items-center">
        <FixWheelLogo size={100} />
        <h1 className="mt-4 text-[32px] font-bold text-[#003366]">FixWheel</h1>
        <p className="mt-2.5 text-base text-[#666666]">Choose Your Role</p>
      </div>

      <div className="w-full max-w-md">
        <RoleChoiceButton
          emoji="👤"
          label="CUSTOMER"
          onClick={() => router.push("/register/customer")}
        />

        <div className="my-5 h-px bg-[#cccccc]" />

        <RoleChoiceButton
          emoji="🔧"
          label="MECHANIC"
          onClick={() => router.push("/register/mechanic")}
        />

        <p className="mt-10 text-center text-xs text-[#999999]">
          Select your role to get started with FixWheel
        </p>

        <p className="mt-6 text-center text-sm">
          <Link
            href="/login"
            className="cursor-pointer font-medium text-[#003D82] hover:underline"
          >
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
