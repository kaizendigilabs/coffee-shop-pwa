"use server";

import { createClient } from "@/lib/supabase/server";
import { LoginCredentials } from "@/lib/store/auth.store";

// Authentication Actions

export async function loginWithEmailAndPassword(credentials: LoginCredentials) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });
  return { data, error };
}

export async function signUpWithEmailAndPassword(
  credentials: LoginCredentials,
) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: credentials.email,
    password: credentials.password,
  });
  return { data, error };
}

export async function logout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
}

export async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
  return data;
}

export async function getStores() {
  const supabase = await createClient();
  // This query assumes RLS is in place as described in architecture.md
  // It fetches all stores the user has access to.
  const { data, error } = await supabase.from("stores").select("*");

  if (error) {
    console.error("Error fetching stores:", error);
    return [];
  }
  return data;
}

export async function sendPasswordResetEmail(email: string) {
  const supabase = await createClient();
  // The redirectTo URL should be configured in your Supabase project's authentication settings
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/update-password`,
  });
  return { data, error };
}

export async function updateUserPassword(password: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.updateUser({ password });
  return { data, error };
}
