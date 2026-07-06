import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";
import AuthBackground from "@/components/AuthBackground";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <AuthBackground>
      <h1 className="font-display text-3xl mb-1 text-center">Welcome back</h1>
      <p className="text-sm text-muted text-center mb-8">Sign in to continue</p>
      <Suspense fallback={null}>
        <AuthForm mode="login" />
      </Suspense>
    </AuthBackground>
  );
}
