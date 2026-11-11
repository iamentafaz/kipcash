"use client"

import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { getLoggedInUser, setAuthSession, userLogOut } from "@/store/slices/userSlice";
import { useAppDispatch } from "@/store/types";
import { ShellLayout } from "@/components/ShellLayout";
import { createClient } from "@/utils/supabase/client";

const queryClient = new QueryClient();

function AppProviders({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  const handleLogin = (email: string) => {
    void email;
    void dispatch(getLoggedInUser());
  };

  const handleLogout = () => {
    dispatch(userLogOut());
  };

  useEffect(() => {
    dispatch(getLoggedInUser());

    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch(setAuthSession(session));
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ShellLayout onLogin={handleLogin} onLogout={handleLogout}>
          {children}
        </ShellLayout>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AppProviders>{children}</AppProviders>
    </Provider>
  );
}

