import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import API from "../api/api";

// ============================================================
// Stage 1 – Enhanced Animated Nexus Logo with bold colors & particles
// ============================================================
function NexusLogoStage({ onComplete }) {
  const [visible, setVisible] = useState(true);
  const [animatingOut, setAnimatingOut] = useState(false);

  const handleLogoClick = () => {
    setAnimatingOut(true);
    setTimeout(() => {
      setVisible(false);
      if (onComplete) onComplete();
    }, 450);
  };

  if (!visible) return null;

  return (
    <div className={`fixed inset-0 bg-white flex items-center justify-center z-50 transition-opacity duration-500 ${animatingOut ? 'opacity-0' : 'opacity-100'}`}>
      {/* Hanging internet particles (small dots, plus signs, network nodes) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating tech particles */}
        {[...Array(40)].map((_, i) => {
          const size = Math.random() * 6 + 2;
          const isDot = Math.random() > 0.7;
          const isPlus = !isDot && Math.random() > 0.5;
          return (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${Math.random() * 10 + 6}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            >
              {isDot ? (
                <div
                  className="rounded-full bg-blue-400/30"
                  style={{ width: size, height: size }}
                />
              ) : isPlus ? (
                <div className="text-blue-300/40 text-sm font-mono">+</div>
              ) : (
                <div className="text-blue-300/30 text-xs font-mono">●</div>
              )}
            </div>
          );
        })}
        {/* Hanging "data stream" lines */}
        {[...Array(15)].map((_, i) => (
          <div
            key={`line-${i}`}
            className="absolute h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 360}deg)`,
              animation: `pulseLine ${Math.random() * 4 + 2}s infinite`,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.3; }
          100% { transform: translateY(-100vh) translateX(${Math.random() * 100 - 50}px) scale(0.5); opacity: 0; }
        }
        @keyframes pulseLine {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.5; }
        }
        @keyframes spin3d {
          0% { transform: rotateX(0deg) rotateY(0deg); }
          100% { transform: rotateX(360deg) rotateY(360deg); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.6; box-shadow: 0 0 15px #3b82f6; }
          50% { opacity: 1; box-shadow: 0 0 35px #2563eb; }
        }
        @keyframes orbit {
          0% { transform: rotate(0deg) translateX(260px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(260px) rotate(-360deg); }
        }
        .rotor {
          position: relative;
          width: 500px;
          height: 500px;
          display: flex;
          align-items: center;
          justify-content: center;
          transform-style: preserve-3d;
          animation: spin3d 12s linear infinite;
        }
        .ring {
          position: absolute;
          border-radius: 50%;
          border: 3px solid rgba(37,99,235,0.7);
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          box-shadow: 0 0 12px rgba(37,99,235,0.5);
        }
        .ring1 {
          transform: rotateY(0deg) rotateX(0deg);
          border-color: #2563eb;
          animation: glowPulse 2.5s ease-in-out infinite;
        }
        .ring2 {
          width: 82%; height: 82%; top: 9%; left: 9%;
          transform: rotateY(55deg) rotateX(35deg);
          border-color: #3b82f6;
          animation: glowPulse 2.5s ease-in-out 0.3s infinite;
        }
        .ring3 {
          width: 64%; height: 64%; top: 18%; left: 18%;
          transform: rotateY(-55deg) rotateX(45deg);
          border-color: #60a5fa;
          animation: glowPulse 2.5s ease-in-out 0.6s infinite;
        }
        .core {
          position: absolute;
          width: 90px;
          height: 90px;
          background: radial-gradient(circle, #3b82f6, #1e3a8a);
          border-radius: 50%;
          box-shadow: 0 0 45px #2563eb, inset 0 0 15px rgba(255,255,255,0.6);
          z-index: 2;
          animation: glowPulse 1.5s ease-in-out infinite;
        }
        .orb {
          position: absolute;
          width: 14px;
          height: 14px;
          background: radial-gradient(circle, #ffffff, #3b82f6);
          border-radius: 50%;
          top: 50%; left: 50%;
          transform-origin: 0 0;
          animation: orbit 6s linear infinite;
          box-shadow: 0 0 12px #3b82f6;
        }
        .orb2 { width: 11px; height: 11px; background: #60a5fa; animation-duration: 8s; }
        .orb3 { width: 9px; height: 9px; background: #93c5fd; animation-duration: 10s; }
        .orb4 { width: 16px; height: 16px; background: #1e3a8a; animation-duration: 14s; }
      `}</style>

      <div className="text-center relative z-10">
        <div className="rotor relative mx-auto mb-8">
          <div className="ring ring1"></div>
          <div className="ring ring2"></div>
          <div className="ring ring3"></div>
          <div className="core"></div>
          <div className="orb"></div>
          <div className="orb orb2"></div>
          <div className="orb orb3"></div>
          <div className="orb orb4"></div>
        </div>
        <div className="cursor-pointer inline-block" onClick={handleLogoClick}>
          <div className="text-center">
            <p className="text-sm font-semibold text-blue-600 tracking-wider mb-1 bg-blue-50 inline-block px-3 py-1 rounded-full">
              ENTERPRISE WORKFORCE PLATFORM
            </p>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-700 bg-clip-text text-transparent mt-3">
              Nexus HRMS
            </h1>
            <div className="mt-5 text-blue-500 animate-bounce text-sm font-medium">✦ Click logo to sign in ✦</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Stage 2 – Split‑screen Login/Register (unchanged logic)
// ============================================================
function LoginRegisterForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("firstTime")) {
      setError("Please sign up with email and password first before using Google login.");
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password };

      const { data } = await API.post(endpoint, payload);

      localStorage.clear();
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("user", JSON.stringify(data));
      window.dispatchEvent(new Event("authChange"));

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
    window.location.href = `${BASE}/api/auth/google`;
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side – Blue panel (same as before) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-700 to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full border border-white/10"></div>
        <div className="absolute bottom-0 left-10 w-80 h-80 rounded-full border border-white/5"></div>
        <div className="absolute top-1/3 right-0 w-64 h-64 rounded-full border border-white/10"></div>

        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold tracking-wider uppercase">Enterprise Edition</span>
          </div>

          <div className="space-y-8">
            <h1 className="text-4xl font-bold leading-tight">
              Manage your<br />people,<br />
              <span className="text-blue-200">brilliantly.</span>
            </h1>
            <p className="text-blue-100 max-w-sm">
              A unified command centre to hire, engage, pay, and grow your entire workforce — built for scale.
            </p>

            <div className="flex gap-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4 w-fit">
              <div><div className="text-2xl font-bold">12K+</div><div className="text-xs text-blue-200">Employees Managed</div></div>
              <div className="border-l border-white/20"></div>
              <div><div className="text-2xl font-bold">98%</div><div className="text-xs text-blue-200">Uptime SLA</div></div>
              <div className="border-l border-white/20"></div>
              <div><div className="text-2xl font-bold">SOC2</div><div className="text-xs text-blue-200">Certified</div></div>
            </div>

            <div className="flex flex-wrap gap-2">
              {["Real-time Payroll", "Smart Reports", "Team Hub", "AI Insights", "Compliance"].map(tag => (
                <span key={tag} className="bg-white/10 rounded-full px-3 py-1 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="text-xs text-blue-200">© 2025 Nexus HRMS – All rights reserved</div>
        </div>
      </div>

      {/* Right side – Form (unchanged) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3 py-1 text-xs text-green-700 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            All systems operational
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Welcome back 👋</h2>
            <p className="text-gray-500 text-sm">{isLogin ? "Sign in to your HRMS workspace" : "Create a candidate account"}</p>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Full Name</label>
                <input type="text" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email Address</label>
              <input type="email" name="email" placeholder="you@company.com" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex justify-between items-center text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" /><span className="text-gray-600">Keep me signed in</span></label>
                <a href="#" className="text-blue-600 hover:underline">Forgot password?</a>
              </div>
            )}

            {!isLogin && (
              <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded-lg">
                Public registration creates a <strong>Candidate</strong> account for applying to jobs.
                Employee and HR accounts are created by your administrator.
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50">
              {loading ? "Please wait..." : (isLogin ? "Sign In →" : "Register →")}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-3 bg-white text-gray-400">or continue with</span></div>
          </div>

          <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 border border-gray-200 hover:bg-gray-50 py-3 rounded-xl transition">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            <span className="text-gray-700 font-medium">Continue with Google Workspace</span>
          </button>

          <div className="mt-6 text-center text-sm text-gray-500">
            {isLogin ? (
              <>New job applicant? <button onClick={() => { setIsLogin(false); setError(""); }} className="text-blue-600 font-semibold hover:underline">Register here</button></>
            ) : (
              <>Already have an account? <button onClick={() => { setIsLogin(true); setError(""); }} className="text-blue-600 font-semibold hover:underline">Login here</button></>
            )}
          </div>

          <div className="mt-2 text-center text-xs text-gray-400">
            Setting up the system for the first time? <Link to="/setup" className="text-blue-500 hover:underline font-medium">Create Admin Account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Main AuthForms – manages stage (logo animation → form)
// ============================================================
export default function AuthForms() {
  const [showForm, setShowForm] = useState(false);

  if (!showForm) {
    return <NexusLogoStage onComplete={() => setShowForm(true)} />;
  }

  return <LoginRegisterForm />;
}