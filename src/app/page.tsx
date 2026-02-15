"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0c0a]">
        <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#0a0c0a]">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[20s] scale-110"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=2560')`,
          filter: 'brightness(0.4) contrast(1.1) saturate(0.8)'
        }}
      />

      {/* Misty haze overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
      <div className="absolute inset-0 bg-[#0a0c0a]/20 backdrop-blur-[2px]" />

      {/* Main Content Container */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="relative z-10 flex items-center justify-center w-full px-4"
      >
        {/* The "Shade" - Central Circular Overlay */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 1.2, delay: 0.2 }}
          className="relative w-[340px] h-[340px] sm:w-[500px] sm:h-[500px] md:w-[600px] md:h-[600px] rounded-full flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-white/10 shadow-2xl group"
        >
          {/* Glassmorphism Background */}
          <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-[12px] group-hover:bg-white/[0.05] transition-colors duration-500 rounded-full" />

          {/* Internal Glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-transparent to-white/5 pointer-events-none rounded-full" />

          {/* Minimal Content */}
          <div className="relative z-20 space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-4xl sm:text-5xl md:text-6xl font-extralight tracking-[0.15em] text-white/95 uppercase"
            >
              Placement<span className="font-semibold text-white">OS</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-white/60 text-sm sm:text-base md:text-lg tracking-[0.3em] font-light uppercase max-w-[280px] sm:max-w-md mx-auto"
            >
              Master the technical interview.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 sm:pt-12"
            >
              <Link href="/signup">
                <Button
                  variant="link"
                  className="text-white/90 hover:text-white group text-sm sm:text-base tracking-[0.2em] uppercase font-light p-0 h-auto"
                >
                  Join Now <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              <div className="w-1 h-1 rounded-full bg-white/20 hidden sm:block" />

              <Link href="/login">
                <Button
                  variant="link"
                  className="text-white/50 hover:text-white text-sm sm:text-base tracking-[0.2em] uppercase font-light p-0 h-auto"
                >
                  Sign In
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Subtle particles for atmosphere */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full opacity-30">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                animate={{
                  y: [-20, 400],
                  x: Math.random() * 500,
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: Math.random() * 5 + 5,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                  ease: "linear",
                }}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-5%',
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Aesthetic Footer Detail */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-40 hover:opacity-100 transition-opacity cursor-default"
      >
        <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-white/50 to-transparent" />
        <span className="text-[10px] tracking-[0.5em] uppercase font-light text-white/50">Scroll to Explore</span>
      </motion.div>
    </div>
  );
}
