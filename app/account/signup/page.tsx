import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <main className="min-h-screen flex flex-col justify-center px-6 py-16">
      <h1 className="font-display text-3xl mb-1 text-center">Create your account</h1>
      <p className="text-sm text-muted text-center mb-8">Shop faster, save favorites, track orders</p>
      <Suspense fallback={null}>
        <AuthForm mode="signup" />
      </Suspense>
    </main>
  );
}
