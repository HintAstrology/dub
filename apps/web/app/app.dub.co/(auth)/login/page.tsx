import LoginForm from "@/ui/auth/login/login-form";
import { AuthLayout } from "@/ui/layout/auth-layout";
import { APP_DOMAIN, constructMetadata } from "@dub/utils";
import Link from "next/link";

export const metadata = constructMetadata({
  title: `Sign in to ${process.env.NEXT_PUBLIC_APP_NAME}`,
  canonicalUrl: `${APP_DOMAIN}/login`,
});

export default function LoginPage() {
  return (
    <AuthLayout>
      <div className="border-border-500 w-full max-w-md overflow-hidden border-y sm:rounded-2xl sm:border sm:shadow-sm">
        <div className="border-border-500 border-b bg-white pb-6 pt-8 text-center">
          <h3 className="text-lg font-semibold">
            Sign in to your GetQR account
          </h3>
        </div>
        <div className="bg-neutral-50 px-4 py-8 sm:px-16">
          <LoginForm />
        </div>
      </div>
      <p className="mt-4 text-center text-sm text-neutral-500">
        Don't have an account?&nbsp;
        <Link
          href="register"
          className="hover:text-neutral font-semibold text-neutral-500 underline underline-offset-2 transition-colors"
        >
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}
