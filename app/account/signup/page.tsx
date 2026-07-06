import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";
import AuthBackground from "@/components/AuthBackground";

export const dynamic = "force-dynamic";

export default function SignupPage() {
  return (
    <AuthBackground>
      <h1 className="font-display text-3xl mb-1 text-center">Create your account</h1>
      <p className="text-sm text-muted text-center mb-8">Shop faster, save favorites, track orders</p>
      <Suspense fallback={null}>
        <AuthForm mode="signup" />
      </Suspense>
    </AuthBackground>
  );
}
