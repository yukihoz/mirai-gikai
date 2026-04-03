"use client";

import { createBrowserClient } from "@mirai-gikai/supabase";
import { useEffect, useState } from "react";

// Create a singleton Supabase client with persistent session
const supabase = createBrowserClient();

/**
 * Hook to ensure an anonymous Supabase user exists and return the user ID
 * This will automatically create an anonymous user if none exists
 */
export function useAnonymousSupabaseUser() {
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const ensureAnonUser = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        // Check if user already exists
        const {
          data: { user },
          error: getUserError,
        } = await supabase.auth.getUser();

        if (getUserError) {
          console.error("Error getting user:", getUserError);
        }

        if (user) {
          setUserId(user.id);
          setIsLoading(false);
          return;
        }

        // No valid session -> sign in anonymously
        const { data, error: signInError } =
          await supabase.auth.signInAnonymously();

        if (signInError) {
          console.error("Error creating anonymous user:", signInError);
          setIsError(true);
          setIsLoading(false);
          return;
        }

        if (data.user) {
          setUserId(data.user.id);
        }
      } catch (err) {
        console.error("Error ensuring anonymous user:", err);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    ensureAnonUser();
  }, []);

  return { userId, isLoading, isError };
}
