"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Address, CustomerUser } from "@/types/dairy";
import { DairyStore } from "@/lib/db/store";

export interface UserProfile {
  id: string;
  phone: string;
  full_name: string;
  email?: string;
  role: "customer" | "admin" | "super_admin" | "farm_manager" | "operations" | "delivery_manager" | "inventory_manager" | "support";
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface AuthContextType {
  user: CustomerUser | null;
  supabaseUser: User | null;
  profile: UserProfile | null;
  session: Session | null;
  addresses: Address[];
  isAuthenticated: boolean;
  isLoading: boolean;
  sendOtp: (phone: string) => Promise<{ success: boolean; message: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (data: { fullName?: string; full_name?: string; email?: string; avatar_url?: string }) => Promise<{ success: boolean; message: string }>;
  addAddress: (address: Omit<Address, "id">) => Promise<{ success: boolean; message: string }>;
  deleteAddress: (id: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshAddresses: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<CustomerUser | null>(() => {
    if (typeof window !== "undefined" && !isSupabaseConfigured()) {
      return DairyStore.getUser();
    }
    return null;
  });
  const [addresses, setAddresses] = useState<Address[]>(() => {
    if (typeof window !== "undefined" && !isSupabaseConfigured()) {
      return DairyStore.getUser().addresses || [];
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(() => isSupabaseConfigured());

  // Fetch addresses from Supabase or fallback
  const fetchAddresses = useCallback(async (userId: string): Promise<Address[]> => {
    if (!isSupabaseConfigured()) {
      return DairyStore.getUser().addresses;
    }
    try {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", userId)
        .order("is_default", { ascending: false });

      if (error || !data || data.length === 0) {
        return DairyStore.getUser().addresses;
      }

      return data.map((d: {
        id: string;
        full_name: string;
        phone: string;
        house_flat: string;
        street: string;
        area: string;
        city: string;
        state: string;
        pincode: string;
        landmark?: string;
        instructions?: string;
        is_default?: boolean;
      }) => ({
        id: d.id,
        fullName: d.full_name || "",
        phone: d.phone || "",
        houseFlat: d.house_flat || "",
        street: d.street || "",
        area: d.area || "",
        city: d.city || "Hyderabad",
        state: d.state || "Telangana",
        pincode: d.pincode || "",
        landmark: d.landmark || undefined,
        instructions: d.instructions || undefined,
        isDefault: !!d.is_default,
      }));
    } catch {
      return DairyStore.getUser().addresses;
    }
  }, []);

  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        return null;
      }
      return data as UserProfile;
    } catch {
      return null;
    }
  }, []);

  // Sync composite CustomerUser object
  const syncCustomerUser = useCallback(
    (sbUser: User | null, prof: UserProfile | null, addrs: Address[]) => {
      if (!sbUser && !prof) {
        // Fallback to local user if previously saved
        const localUser = DairyStore.getUser();
        setUser(localUser);
        setAddresses(localUser.addresses || []);
        return;
      }

      const phone = prof?.phone || sbUser?.phone?.replace("+91", "") || "9876543210";
      const fullName = prof?.full_name || (sbUser?.user_metadata?.full_name as string) || "Dairy Customer";
      const email = prof?.email || sbUser?.email || undefined;
      const role = (prof?.role as CustomerUser["role"]) || "customer";

      const customerObj: CustomerUser = {
        id: prof?.id || sbUser?.id || "usr-current",
        phone,
        fullName,
        email,
        addresses: addrs,
        role,
        createdAt: prof?.created_at || sbUser?.created_at || new Date().toISOString(),
      };

      setUser(customerObj);
      setAddresses(addrs);
      DairyStore.saveUser(customerObj);
    },
    []
  );

  const refreshAddresses = useCallback(async () => {
    const activeUserId = profile?.id || supabaseUser?.id;
    if (activeUserId) {
      const addrs = await fetchAddresses(activeUserId);
      setAddresses(addrs);
      if (user) {
        const updated = { ...user, addresses: addrs };
        setUser(updated);
        DairyStore.saveUser(updated);
      }
    }
  }, [profile, supabaseUser, fetchAddresses, user]);

  const refreshProfile = useCallback(async () => {
    const activeUserId = profile?.id || supabaseUser?.id;
    if (activeUserId) {
      const p = await fetchProfile(activeUserId);
      setProfile(p);
      const addrs = await fetchAddresses(activeUserId);
      syncCustomerUser(supabaseUser, p, addrs);
    }
  }, [profile, supabaseUser, fetchProfile, fetchAddresses, syncCustomerUser]);

  useEffect(() => {
    // Initial session load
    if (isSupabaseConfigured()) {
      supabase.auth.getSession().then(async ({ data: { session: s } }) => {
        setSession(s);
        setSupabaseUser(s?.user ?? null);
        if (s?.user) {
          const p = await fetchProfile(s.user.id);
          setProfile(p);
          const addrs = await fetchAddresses(s.user.id);
          syncCustomerUser(s.user, p, addrs);
        } else {
          syncCustomerUser(null, null, []);
        }
        setIsLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, s) => {
          setSession(s);
          setSupabaseUser(s?.user ?? null);
          if (s?.user) {
            const p = await fetchProfile(s.user.id);
            setProfile(p);
            const addrs = await fetchAddresses(s.user.id);
            syncCustomerUser(s.user, p, addrs);
          } else {
            setProfile(null);
            syncCustomerUser(null, null, []);
          }
          setIsLoading(false);
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }
    // Offline / fallback dev mode: state already initialized via lazy useState
  }, [fetchProfile, fetchAddresses, syncCustomerUser]);

  const sendOtp = async (phone: string): Promise<{ success: boolean; message: string }> => {
    const cleanPhone = phone.trim().replace(/\D/g, "").slice(-10);

    if (!cleanPhone || cleanPhone.length !== 10) {
      return { success: false, message: "Please enter a valid 10-digit mobile number." };
    }

    if (!isSupabaseConfigured()) {
      if (process.env.NODE_ENV === "production") {
        return {
          success: false,
          message: "Authentication service is not configured. Please contact store support.",
        };
      }
      return {
        success: true,
        message: `OTP sent to +91 ${cleanPhone}. (Dev fallback: enter 123456)`,
      };
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: `+91${cleanPhone}`,
      });

      if (error) {
        if (error.message.toLowerCase().includes("sms provider") || error.message.toLowerCase().includes("not configured")) {
          return {
            success: false,
            message: "SMS service is not yet enabled in the backend (Twilio/MessageBird provider required in Supabase Auth Settings).",
          };
        }
        if (error.message.includes("rate limit") || error.message.includes("too many")) {
          return { success: false, message: "Too many attempts. Please wait a few minutes before trying again." };
        }
        return { success: false, message: error.message || "Failed to send OTP. Please try again." };
      }

      return {
        success: true,
        message: `OTP sent to +91 ${cleanPhone}. Valid for 10 minutes.`,
      };
    } catch {
      return { success: false, message: "Network error. Please check your connection and try again." };
    }
  };

  const verifyOtp = async (
    phone: string,
    otp: string
  ): Promise<{ success: boolean; message: string }> => {
    const cleanPhone = phone.trim().replace(/\D/g, "").slice(-10);

    if (!otp || otp.trim().length !== 6) {
      return { success: false, message: "Please enter the 6-digit verification code." };
    }

    if (!isSupabaseConfigured()) {
      if (process.env.NODE_ENV === "production") {
        return { success: false, message: "Authentication service is not configured." };
      }
      if (otp.trim() === "123456") {
        const localUser = DairyStore.getUser();
        localUser.phone = cleanPhone;
        DairyStore.saveUser(localUser);
        setUser(localUser);
        return { success: true, message: "Login successful!" };
      }
      return { success: false, message: "Invalid OTP. Use 123456 in dev mode." };
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: `+91${cleanPhone}`,
        token: otp.trim(),
        type: "sms",
      });

      if (error) {
        if (error.message.includes("expired") || error.message.includes("invalid")) {
          return { success: false, message: "Invalid or expired OTP. Please request a new code." };
        }
        return { success: false, message: error.message || "OTP verification failed." };
      }

      if (!data.user) {
        return { success: false, message: "Verification failed. Please try again." };
      }

      // Ensure profile exists without overwriting existing role
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("role, full_name, email")
        .eq("id", data.user.id)
        .maybeSingle();

      if (!existingProfile) {
        await supabase.from("profiles").insert({
          id: data.user.id,
          phone: cleanPhone,
          full_name: data.user.user_metadata?.full_name || "Farm Customer",
          email: data.user.email || null,
          role: "customer",
          updated_at: new Date().toISOString(),
        });
      } else {
        // Update last active timestamp
        await supabase
          .from("profiles")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", data.user.id);
      }

      await refreshProfile();
      return { success: true, message: "Login successful! Welcome to Palletoori's Dairy Farm." };
    } catch {
      return { success: false, message: "Network error. Please check your connection and try again." };
    }
  };

  const updateProfile = async (
    data: { fullName?: string; full_name?: string; email?: string; avatar_url?: string }
  ): Promise<{ success: boolean; message: string }> => {
    const resolvedName = data.fullName || data.full_name;

    // Update in local store
    if (user) {
      const updatedUser = {
        ...user,
        fullName: resolvedName || user.fullName,
        email: data.email !== undefined ? data.email : user.email,
      };
      setUser(updatedUser);
      DairyStore.saveUser(updatedUser);
    }

    if (isSupabaseConfigured() && supabaseUser) {
      try {
        const { error } = await supabase
          .from("profiles")
          .update({
            full_name: resolvedName,
            email: data.email,
            avatar_url: data.avatar_url,
            updated_at: new Date().toISOString(),
          })
          .eq("id", supabaseUser.id);

        if (error) {
          return { success: false, message: error.message || "Failed to update profile." };
        }

        await refreshProfile();
      } catch {
        return { success: false, message: "Failed to update profile in database." };
      }
    }

    return { success: true, message: "Profile updated successfully." };
  };

  const addAddress = async (
    addressData: Omit<Address, "id">
  ): Promise<{ success: boolean; message: string }> => {
    const newId = `addr-${Date.now()}`;
    const newAddress: Address = {
      ...addressData,
      id: newId,
    };

    DairyStore.addAddress(newAddress);
    const updatedAddrs = [...addresses, newAddress];
    setAddresses(updatedAddrs);
    if (user) {
      const updatedUser = { ...user, addresses: updatedAddrs };
      setUser(updatedUser);
      DairyStore.saveUser(updatedUser);
    }

    if (isSupabaseConfigured() && supabaseUser) {
      try {
        const { error } = await supabase.from("addresses").insert({
          user_id: supabaseUser.id,
          full_name: addressData.fullName,
          phone: addressData.phone,
          house_flat: addressData.houseFlat,
          street: addressData.street,
          area: addressData.area,
          city: addressData.city,
          state: addressData.state,
          pincode: addressData.pincode,
          landmark: addressData.landmark || null,
          instructions: addressData.instructions || null,
          is_default: !!addressData.isDefault,
        });

        if (error) {
          console.warn("Could not save address to Supabase:", error);
        }
      } catch (err) {
        console.warn("Address save error:", err);
      }
    }

    return { success: true, message: "Address added successfully." };
  };

  const deleteAddress = async (id: string): Promise<{ success: boolean; message: string }> => {
    DairyStore.deleteAddress(id);
    const updatedAddrs = addresses.filter((a) => a.id !== id);
    setAddresses(updatedAddrs);
    if (user) {
      const updatedUser = { ...user, addresses: updatedAddrs };
      setUser(updatedUser);
      DairyStore.saveUser(updatedUser);
    }

    if (isSupabaseConfigured() && supabaseUser) {
      try {
        await supabase.from("addresses").delete().eq("id", id).eq("user_id", supabaseUser.id);
      } catch (err) {
        console.warn("Delete address DB error:", err);
      }
    }

    return { success: true, message: "Address deleted successfully." };
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Ignore
      }
    }
    setSupabaseUser(null);
    setProfile(null);
    setSession(null);
    setUser(null);
    setAddresses([]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        profile,
        session,
        addresses,
        isAuthenticated: !!user || !!supabaseUser,
        isLoading,
        sendOtp,
        verifyOtp,
        updateProfile,
        addAddress,
        deleteAddress,
        logout,
        refreshProfile,
        refreshAddresses,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
