"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
    auth,
    googleProvider,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    firebaseSignOut,
    updateProfile,
    type User,
} from "@/lib/firebase";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    dbUser: DbUser | null;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, name: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    refreshDbUser: () => Promise<void>;
}

interface DbUser {
    _id: string;
    firebaseUid: string;
    email: string;
    name: string;
    image?: string;
    preferences: {
        theme: string;
        dailyTarget: number;
        focusMode: boolean;
        notifications: boolean;
        placementMode: boolean;
    };
    placementDeadline?: string;
    targetCompanies: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [dbUser, setDbUser] = useState<DbUser | null>(null);
    const [loading, setLoading] = useState(true);

    const syncUserToDb = useCallback(async (firebaseUser: User) => {
        try {
            const token = await firebaseUser.getIdToken();
            const res = await fetch("/api/auth/sync", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    firebaseUid: firebaseUser.uid,
                    email: firebaseUser.email,
                    name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
                    image: firebaseUser.photoURL,
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setDbUser(data.user);
            }
        } catch (error) {
            console.error("Failed to sync user to DB:", error);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                await syncUserToDb(firebaseUser);
            } else {
                setDbUser(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [syncUserToDb]);

    const signIn = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const signUp = async (email: string, password: string, name: string) => {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
    };

    const signInWithGoogle = async () => {
        await signInWithPopup(auth, googleProvider);
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
        setDbUser(null);
    };

    const refreshDbUser = async () => {
        if (user) {
            await syncUserToDb(user);
        }
    };

    return (
        <AuthContext.Provider
            value={{ user, loading, dbUser, signIn, signUp, signInWithGoogle, signOut, refreshDbUser }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
