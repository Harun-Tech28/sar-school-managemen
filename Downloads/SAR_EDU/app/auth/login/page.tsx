"use client"

import Image from "next/image"
import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E31E24] via-[#FFD100] to-[#FF6B6B] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* SAR Logo and Branding */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-white/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sarlogo-xxAG87QJUVXBfV9KkmRbyQ4NK6e1Dm.jpg"
                alt="SAR Educational Complex Logo"
                width={100}
                height={100}
                className="rounded-2xl shadow-2xl relative transform group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">SAR Educational Complex</h1>
          <p className="text-white/90 text-lg font-medium">Nurturing Minds And Hearts</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 transform hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-[#E31E24] to-[#FFD100] rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🔐</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome Back!</h2>
              <p className="text-gray-600 text-sm">Sign in to continue</p>
            </div>
          </div>

          <LoginForm />

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-[#E31E24] font-bold hover:text-[#C41A20] hover:underline transition-all">
                Create one now →
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link href="/" className="text-gray-500 text-xs hover:text-gray-700 transition-all inline-flex items-center gap-1">
              ← Back to Home
            </Link>
          </div>
        </div>

        {/* Quick Access Roles */}
        <div className="mt-6 grid grid-cols-4 gap-3">
          <div className="bg-white/20 backdrop-blur-md rounded-xl p-3 text-center hover:bg-white/30 transition-all cursor-pointer">
            <span className="text-2xl block mb-1">👨‍💼</span>
            <span className="text-white text-xs font-semibold">Admin</span>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-xl p-3 text-center hover:bg-white/30 transition-all cursor-pointer">
            <span className="text-2xl block mb-1">👨‍🏫</span>
            <span className="text-white text-xs font-semibold">Teacher</span>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-xl p-3 text-center hover:bg-white/30 transition-all cursor-pointer">
            <span className="text-2xl block mb-1">👨‍🎓</span>
            <span className="text-white text-xs font-semibold">Student</span>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-xl p-3 text-center hover:bg-white/30 transition-all cursor-pointer">
            <span className="text-2xl block mb-1">👨‍👩‍👧</span>
            <span className="text-white text-xs font-semibold">Parent</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-white/80 text-xs">
          <p className="font-medium">📍 Box 130, Sepe Sote, Hospital Junction, Kumasi</p>
          <p className="mt-2">© 2025 SAR Educational Complex. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
