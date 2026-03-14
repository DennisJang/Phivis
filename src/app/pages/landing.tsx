import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Logo } from "../components/logo";
import { FileText, Send, Building, GraduationCap } from "lucide-react";

export function Landing() {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    // Show login form after animation
    const timer = setTimeout(() => {
      setShowLogin(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple demo login - just navigate to home
    navigate("/home");
  };

  const features = [
    { 
      icon: FileText, 
      color: "#007AFF", 
      label: "Visa",
      position: { initial: { x: -100, y: -100 }, animate: { x: 0, y: 0 } }
    },
    { 
      icon: Send, 
      color: "#34C759", 
      label: "Remit",
      position: { initial: { x: 100, y: -100 }, animate: { x: 0, y: 0 } }
    },
    { 
      icon: Building, 
      color: "#007AFF", 
      label: "Housing",
      position: { initial: { x: -100, y: 100 }, animate: { x: 0, y: 0 } }
    },
    { 
      icon: GraduationCap, 
      color: "#34C759", 
      label: "Education",
      position: { initial: { x: 100, y: 100 }, animate: { x: 0, y: 0 } }
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F5F5F7] flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Animated Feature Icons */}
      <div className="relative w-full max-w-md h-96 mb-8">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={index}
              className="absolute inset-0 flex items-center justify-center"
              initial={feature.position.initial}
              animate={{
                x: [
                  feature.position.initial.x,
                  feature.position.initial.x * 0.5,
                  0,
                ],
                y: [
                  feature.position.initial.y,
                  feature.position.initial.y * 0.5,
                  0,
                ],
                scale: [0, 1.2, 1, 0.3, 0],
                opacity: [0, 1, 1, 0.5, 0],
              }}
              transition={{
                duration: 2.5,
                times: [0, 0.3, 0.6, 0.85, 1],
                ease: [0.34, 1.56, 0.64, 1], // Bouncy ease
                delay: index * 0.15,
              }}
            >
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: feature.color }}
              >
                <Icon size={40} className="text-white" strokeWidth={2} />
              </div>
            </motion.div>
          );
        })}

        {/* Logo appears after icons animate */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 2,
            duration: 0.8,
            ease: [0.34, 1.56, 0.64, 1],
          }}
        >
          <Logo size="large" />
          <motion.div
            className="text-center mt-6 space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 2.5,
              duration: 0.6,
            }}
          >
            <h1 className="text-4xl tracking-tight" style={{ fontWeight: 600 }}>
              Settle
            </h1>
            <p className="text-lg text-[#86868B] max-w-xs">
              Your trusted companion for life in Korea
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Login Form */}
      {showLogin && (
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            ease: "easeOut",
          }}
        >
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="bg-white rounded-3xl p-6 shadow-lg space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ fontWeight: 600 }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full bg-[#F5F5F7] rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#007AFF] transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ fontWeight: 600 }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#F5F5F7] rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#007AFF] transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-br from-[#007AFF] to-[#0051D5] text-white rounded-3xl py-4 shadow-lg active:scale-98 transition-transform"
              style={{ fontWeight: 600 }}
            >
              Sign in
            </button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                className="text-[#007AFF]"
                style={{ fontWeight: 600 }}
              >
                Forgot password?
              </button>
              <button
                type="button"
                className="text-[#007AFF]"
                style={{ fontWeight: 600 }}
              >
                Create account
              </button>
            </div>

            <div className="text-center">
              <p className="text-xs text-[#86868B]">
                By signing in, you agree to our Terms & Privacy Policy
              </p>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
}
