"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoginForm from "@/components/LoginForm";
import FullPageSpinner from "@/components/ui/FullPageSpinner";

export default function LoginPageClient() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard if user is already logged in
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  if (loading) {
    return <FullPageSpinner />;
  }

  // Don't show login form if user is authenticated (they'll be redirected)
  if (user) {
    return null;
  }

  return <LoginForm />;
}