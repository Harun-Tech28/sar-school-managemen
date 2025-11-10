"use client"

import Image from "next/image"
import Link from "next/link"
import { RegisterForm } from "@/components/auth/register-form"

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFD100] via-[#FFA500] to-[#E31E24] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
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

        {/* Signup Card */}
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 transform hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FFD100] to-[#E31E24] rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">✨</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Join Us Today!</h2>
              <p className="text-gray-600 text-sm">Create your account</p>
            </div>
          </div>

          <RegisterForm />

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-[#E31E24] font-bold hover:text-[#C41A20] hover:underline transition-all">
                Sign in here →
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

        {/* Role Selection Guide */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 hover:bg-white/30 transition-all">
            <span className="text-3xl block mb-2">👨‍🎓</span>
            <p className="text-white text-xs font-bold mb-1">Student</p>
            <p className="text-white/80 text-xs">View grades & homework</p>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 hover:bg-white/30 transition-all">
            <span className="text-3xl block mb-2">👨‍👩‍👧</span>
            <p className="text-white text-xs font-bold mb-1">Parent</p>
            <p className="text-white/80 text-xs">Track child's progress</p>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 hover:bg-white/30 transition-all">
            <span className="text-3xl block mb-2">👨‍🏫</span>
            <p className="text-white text-xs font-bold mb-1">Teacher</p>
            <p className="text-white/80 text-xs">Manage classes & grades</p>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 hover:bg-white/30 transition-all">
            <span className="text-3xl block mb-2">👨‍💼</span>
            <p className="text-white text-xs font-bold mb-1">Admin</p>
            <p className="text-white/80 text-xs">Manage entire school</p>
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
