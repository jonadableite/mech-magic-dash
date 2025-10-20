"use client";

import { AuthProvider } from "@/contexts/auth-context";
import { LoginForm } from "@/components/auth/login-form";

export default function SigninPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}