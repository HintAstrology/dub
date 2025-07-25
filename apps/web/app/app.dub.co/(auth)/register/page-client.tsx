"use client";

import {
  RegisterProvider,
  useRegisterContext,
} from "@/ui/auth/register/context";
import { SignUpForm } from "@/ui/auth/register/signup-form";
import { VerifyEmailForm } from "@/ui/auth/register/verify-email-form";
import { truncate } from "@dub/utils";
import Link from "next/link";

export default function RegisterPageClient() {
  return (
    <RegisterProvider>
      <RegisterFlow />
    </RegisterProvider>
  );
}

function SignUp() {
  return (
    <>
      <div className="border-border-500 w-full max-w-md overflow-hidden border-y sm:rounded-2xl sm:border sm:shadow-sm">
        <div className="border-border-500 border-b bg-white pb-6 pt-8 text-center">
          <h3 className="text-lg font-semibold">Get started with GetQR</h3>
        </div>
        <div className="bg-neutral-50 px-4 py-8 sm:px-16">
          <SignUpForm />
        </div>
      </div>
      <p className="mt-4 text-center text-sm text-neutral-500">
        Already have an account?&nbsp;
        <Link
          href="/login"
          className="hover:text-neutral font-semibold text-neutral-500 underline underline-offset-2 transition-colors"
        >
          Log in
        </Link>
      </p>
    </>
  );
}

function Verify() {
  const { email } = useRegisterContext();

  return (
    <>
      <div className="border-border-500 w-full max-w-md overflow-hidden border-y sm:rounded-2xl sm:border sm:shadow-sm">
        <div className="border-border-500 flex flex-col items-center justify-center gap-3 border-b bg-white px-4 pb-6 pt-8 text-center sm:px-16">
          <h3 className="text-xl font-semibold">Verify your email address</h3>
          <p className="text-sm text-neutral-500">
            Enter the six digit verification code sent to{" "}
            <strong className="font-medium text-neutral-600" title={email}>
              {truncate(email, 30)}
            </strong>
          </p>
        </div>
        <div className="bg-neutral-50 px-4 py-8 sm:px-16">
          <VerifyEmailForm />
        </div>
      </div>
      <p className="mt-4 text-center text-sm text-neutral-500">
        Already have an account?&nbsp;
        <Link
          href="/login"
          className="hover:text-neutral font-semibold text-neutral-500 underline underline-offset-2 transition-colors"
        >
          Log in
        </Link>
      </p>
    </>
  );
}

const RegisterFlow = () => {
  const { step } = useRegisterContext();

  if (step === "signup") return <SignUp />;
  if (step === "verify") return <Verify />;
};
