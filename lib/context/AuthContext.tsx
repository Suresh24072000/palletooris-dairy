"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CustomerUser, Address } from "@/types/dairy";
import { DairyStore } from "@/lib/db/store";

interface AuthContextType {
  user: CustomerUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sendOtp: (phone: string) => Promise<{ success: boolean; message: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (data: Partial<CustomerUser>) => void;
  addAddress: (address: Omit<Address, "id">) => Address;
  deleteAddress: (id: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load existing user from store
    const currentUser = DairyStore.getUser();
    if (currentUser && currentUser.phone) {
      setUser(currentUser);
    }
    setIsLoading(false);
  }, []);

  const sendOtp = async (phone: string): Promise<{ success: boolean; message: string }> => {
    if (!phone || phone.trim().length < 10) {
      return { success: false, message: "Please enter a valid 10-digit mobile number." };
    }
    // Simulate OTP sending or call Supabase SMS auth
    return {
      success: true,
      message: `OTP sent to +91 ${phone.slice(-10)}. (Development test code: 123456)`,
    };
  };

  const verifyOtp = async (
    phone: string,
    otp: string
  ): Promise<{ success: boolean; message: string }> => {
    if (otp !== "123456" && otp.length !== 6) {
      return { success: false, message: "Invalid OTP. Use test OTP: 123456" };
    }

    const cleanPhone = phone.trim().slice(-10);
    const existing = DairyStore.getUser();
    let updatedUser: CustomerUser;

    if (existing && existing.phone === cleanPhone) {
      updatedUser = existing;
    } else {
      updatedUser = {
        id: `usr-${Date.now()}`,
        phone: cleanPhone,
        fullName: existing?.fullName || "Farm Customer",
        email: existing?.email || "",
        addresses: existing?.addresses || [],
        role: "customer",
        createdAt: new Date().toISOString(),
      };
      DairyStore.saveUser(updatedUser);
    }

    setUser(updatedUser);
    return { success: true, message: "Login successful!" };
  };

  const updateProfile = (data: Partial<CustomerUser>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    DairyStore.saveUser(updated);
  };

  const addAddress = (addressData: Omit<Address, "id">): Address => {
    const newAddress: Address = {
      ...addressData,
      id: `addr-${Date.now()}`,
    };
    DairyStore.addAddress(newAddress);
    if (user) {
      setUser({
        ...user,
        addresses: [...user.addresses, newAddress],
      });
    }
    return newAddress;
  };

  const deleteAddress = (id: string) => {
    DairyStore.deleteAddress(id);
    if (user) {
      setUser({
        ...user,
        addresses: user.addresses.filter((a) => a.id !== id),
      });
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("palletoori_user");
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        sendOtp,
        verifyOtp,
        updateProfile,
        addAddress,
        deleteAddress,
        logout,
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
