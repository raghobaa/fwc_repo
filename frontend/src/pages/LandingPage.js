import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Zap, ArrowRight, Menu, X, ChevronRight, Users, Briefcase, DollarSign, Shield, Target, MessageSquare } from 'lucide-react';

/* ─── Main Landing Page ───────────────────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const suggestions = [
    "How many employees are on leave today?",
    "Show pending payroll approvals",
    "List all active job openings",
    "Generate attendance report",
  ];

  const features = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Employee Management",
      description: "Manage employee profiles, roles, departments, and track the entire workforce lifecycle.",
      badge: "Core",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: <Briefcase className="h-6 w-6" />,
      title: "Attendance & Leave",
      description: "Track attendance, manage leave requests, and view real-time presence analytics.",
      badge: "HR",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: <DollarSign className="h-6 w-6" />,
      title: "Payroll Management",
      description: "Process salaries, manage deductions, and generate payroll reports with ease.",
      badge: "Finance",
      color: "from-green-500 to-green-600",
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "AI-Powered Insights",
      description: "Leverage AI for resume screening, talent heatmaps, skill gap analysis, and more.",
      badge: "AI",
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Role-Based Access",
      description: "Granular permissions for Admin, HR, Employee, and Candidate roles with full audit trails.",
      badge: "Security",
      color: "from-red-500 to-red-600",
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "AI Chat Assistant",
      description: "Get instant answers about employees, policies, and HR data through a conversational AI interface.",
      badge: "AI",
      color: "from-indigo-500 to-indigo-600",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ─── Navbar ──────────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-blue-600 rounded-lg w-8 h-8 flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">Prashasana</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-600 hover:text-blue-600 transition">Features</a>
              <a href="#demo" className="text-sm text-gray-600 hover:text-blue-600 transition">How it Works</a>
              <a href="#demo" className="text-sm text-gray-600 hover:text-blue-600 transition">AI Capabilities</a>
              <button
                onClick={() => navigate("/login")}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-xl transition shadow-md hover:shadow-lg"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 border-t border-gray-100 pt-4 space-y-3">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-gray-600 hover:text-blue-600 transition">Features</a>
              <a href="#demo" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-gray-600 hover:text-blue-600 transition">How it Works</a>
              <a href="#demo" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-gray-600 hover:text-blue-600 transition">AI Capabilities</a>
              <button
                onClick={() => { setMobileMenuOpen(false); navigate("/login"); }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-100/60 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight mb-6">
            Manage your people,{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">brilliantly.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            A unified command centre to hire, engage, pay, and grow your entire workforce — 
            powered by AI and built for scale.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <button
              onClick={() => navigate("/login")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-xl transition shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href="#demo"
              className="border border-gray-300 hover:border-blue-300 text-gray-700 hover:text-blue-600 font-semibold px-8 py-3.5 rounded-xl transition flex items-center gap-2"
            >
              See How it Works
            </a>
          </div>

          {/* Suggestion Chips */}
          <div className="flex flex-wrap justify-center gap-2">
            <span className="text-xs text-gray-400 mr-1 self-center">Try asking:</span>
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => navigate("/login")}
                className="text-xs bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-600 border border-gray-200 hover:border-blue-200 rounded-full px-4 py-1.5 transition"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Section ─────────────────────────────────────────────── */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 text-xs text-blue-700 font-medium mb-4">
              Platform Capabilities
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to manage your workforce
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Prashasana combines employee management, payroll, AI insights, and accessibility 
              into one intelligent platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 p-6 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`bg-gradient-to-r ${feature.color} w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded-full group-hover:bg-blue-50 group-hover:text-blue-600 transition">
                    {feature.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to transform your workforce management?
          </h2>
          <p className="text-blue-100 max-w-2xl mx-auto mb-8">
            Join enterprises that use Prashasana to streamline HR operations, empower employees, 
            and make data-driven decisions.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-8 py-3.5 rounded-xl transition shadow-lg hover:shadow-xl"
          >
            Get Started Free →
          </button>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-blue-600 rounded-lg w-8 h-8 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">Prashasana</span>
              </div>
              <p className="text-sm leading-relaxed">
                AI-powered workforce management platform — making HR operations smarter, 
                faster, and more accessible for everyone.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Platform</h4>
              <div className="space-y-2">
                <a href="#features" className="block text-sm hover:text-white transition">Features</a>
                <a href="#demo" className="block text-sm hover:text-white transition">How it Works</a>
                <a href="#demo" className="block text-sm hover:text-white transition">AI Capabilities</a>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Get Started</h4>
              <div className="space-y-2">
                <button onClick={() => navigate("/login")} className="block text-sm hover:text-white transition">Sign In</button>
                <button onClick={() => navigate("/setup")} className="block text-sm hover:text-white transition">Setup Admin</button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-xs">
            © 2026 Prashasana. AI-powered workforce management — not a substitute for professional HR advice.
          </div>
        </div>
      </footer>
    </div>
  );
}
