"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Target, Mail, Lock, User, Chrome, ArrowRight, Sparkles } from "lucide-react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { ShaderBackground } from "@/components/custom/shader-background";
import { ScrollProgress } from "@/components/custom/scroll-progress";
import NumberTicker from "@/components/ui/number-ticker";

export default function SignUpPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { signUp, signInWithGoogle } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            await signUp(email, password, name);
            router.push("/dashboard");
        } catch {
            setError("Failed to create account. Email may already be in use.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError("");
        setLoading(true);
        try {
            await signInWithGoogle();
            router.push("/dashboard");
        } catch {
            setError("Google sign-in failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuroraBackground>
            <ScrollProgress />
            <ShaderBackground className="z-[1] opacity-70" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/8 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/8 rounded-full blur-3xl animate-float" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md z-10"
            >
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", duration: 0.8 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 mb-4 shadow-lg shadow-indigo-500/25"
                    >
                        <Target className="w-8 h-8 text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Join Placement<span className="text-indigo-400">OS</span>
                    </h1>
                    <div className="mt-2 flex items-center justify-center gap-1 text-slate-400">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <TypewriterEffectSmooth
                            words={[
                                { text: "Start" },
                                { text: "your" },
                                { text: "preparation", className: "text-indigo-300" },
                                { text: "journey", className: "text-cyan-300" },
                            ]}
                            className="my-0 text-sm"
                            cursorClassName="h-4 bg-indigo-400"
                        />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2 uppercase tracking-widest">
                        One account, two prep modes
                    </p>
                </div>

                <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl shadow-2xl ring-1 ring-white/5">
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-2xl text-white">Create account</CardTitle>
                        <CardDescription className="text-slate-400">
                            Set up your placement command center
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-slate-300">Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="Your name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-300">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-300">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Min. 6 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-slate-300">Confirm Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="Re-enter password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20"
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/25 transition-all duration-200"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Create Account <ArrowRight className="ml-2 w-4 h-4" />
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-700" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-slate-900 px-2 text-slate-500">Or continue with</span>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="w-full border-slate-700 bg-slate-800/50 text-white hover:bg-slate-700/50 hover:text-white transition-all duration-200"
                        >
                            <Chrome className="mr-2 w-4 h-4" />
                            Google
                        </Button>

                        <div className="mt-6 grid grid-cols-3 gap-2">
                            {[
                                { label: "Syllabus", value: 128 },
                                { label: "Daily Users", value: 4200 },
                                { label: "Modes", value: 2 },
                            ].map((item) => (
                                <div key={item.label} className="rounded-lg border border-slate-800 bg-slate-900/60 px-2 py-2 text-center">
                                    <p className="text-xs font-semibold text-white">
                                        <NumberTicker value={item.value} className="text-white text-sm" />
                                    </p>
                                    <p className="text-[10px] uppercase tracking-wide text-slate-500 mt-1">{item.label}</p>
                                </div>
                            ))}
                        </div>

                        <p className="text-center text-sm text-slate-500 mt-6">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </motion.div>
        </AuroraBackground>
    );
}
