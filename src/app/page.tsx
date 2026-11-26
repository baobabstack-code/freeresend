"use client";

import { useAuth } from "@/contexts/AuthContext";
import LandingPage from "@/components/LandingPage";
import Dashboard from "@/components/Dashboard";
import FullPageSpinner from "@/components/ui/FullPageSpinner";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return <FullPageSpinner />;
  }

  // Show dashboard if user is authenticated
  if (user) {
    return <Dashboard />;
  }

  // Show landing page for unauthenticated users
  return <LandingPage />;
}
