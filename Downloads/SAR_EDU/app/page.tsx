import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-yellow-50 to-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b-4 border-[#E31E24] shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-lg ring-2 ring-[#FFD100]">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sarlogo-xxAG87QJUVXBfV9KkmRbyQ4NK6e1Dm.jpg"
                alt="SAR Educational Complex Logo"
                width={56}
                height={56}
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="font-bold text-xl text-[#E31E24]">SAR Educational Complex</h1>
              <p className="text-xs text-gray-600 font-medium">Nurturing Minds And Hearts</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/auth/login">
              <Button className="bg-[#E31E24] hover:bg-[#C41A20] text-white font-semibold shadow-lg hover:shadow-xl transition-all">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with SAR Colors */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#E31E24]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FFD100]/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10">
          <div className="mb-8 flex justify-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#E31E24] to-[#FFD100] opacity-30 blur-2xl rounded-full group-hover:opacity-40 transition-all"></div>
              <div className="relative bg-white p-4 rounded-3xl shadow-2xl ring-4 ring-[#FFD100] group-hover:ring-[#E31E24] transition-all">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sarlogo-xxAG87QJUVXBfV9KkmRbyQ4NK6e1Dm.jpg"
                  alt="SAR Educational Complex Logo"
                  width={160}
                  height={160}
                  className="rounded-2xl transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-[#E31E24] mb-4 tracking-tight">
            SAR Educational Complex
          </h2>
          <p className="text-3xl font-bold mb-6 tracking-wide bg-gradient-to-r from-[#E31E24] to-[#FFD100] bg-clip-text text-transparent">
            Nurturing Minds And Hearts
          </p>
          <p className="text-lg text-gray-700 mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
            Professional School Management System for Ghana basic schools. Designed for administrators, teachers,
            students, and parents.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/auth/login">
              <Button size="lg" className="bg-[#E31E24] hover:bg-[#C41A20] text-white font-bold px-10 py-6 text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all">
                Get Started →
              </Button>
            </Link>
            <Link href="#roles">
              <Button size="lg" className="bg-[#FFD100] hover:bg-[#E6BC00] text-[#E31E24] font-bold px-10 py-6 text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all">
                Explore Roles
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* User Type Cards Section */}
      <section id="roles" className="max-w-7xl mx-auto px-6 py-20 bg-white rounded-3xl shadow-2xl mx-6 border-4 border-[#FFD100]">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-bold text-[#E31E24] mb-3">Choose Your Role</h3>
          <p className="text-gray-600 text-lg">Select your role to access personalized features</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Admin Card */}
          <UserTypeCard
            icon="👨‍💼"
            title="School Administrator"
            role="admin"
            features={[
              "Manage students & teachers",
              "View financial reports",
              "Analyze performance data",
              "Configure school settings",
              "Create announcements",
            ]}
            color="from-[#E31E24] to-[#C41A20]"
          />

          {/* Teacher Card */}
          <UserTypeCard
            icon="👨‍🏫"
            title="Teacher"
            role="teacher"
            features={[
              "Mark student attendance",
              "Enter & manage grades",
              "View class performance",
              "Set homework & assignments",
              "Communicate with parents",
            ]}
            color="from-[#E31E24] to-[#FF6B6B]"
          />

          {/* Student Card */}
          <UserTypeCard
            icon="👨‍🎓"
            title="Student"
            role="student"
            features={[
              "View your grades",
              "Track attendance",
              "Access assignments",
              "View timetable",
              "School announcements",
            ]}
            color="from-[#FFD100] to-[#FFA500]"
          />

          {/* Parent Card */}
          <UserTypeCard
            icon="👨‍👩‍👧"
            title="Parent"
            role="parent"
            features={[
              "Track child's grades",
              "Monitor attendance",
              "View performance reports",
              "Check fees status",
              "School updates",
            ]}
            color="from-[#FFD100] to-[#E6BC00]"
          />
        </div>
      </section>



      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-br from-[#E31E24] via-[#FF6B6B] to-[#FFD100] rounded-3xl p-12 text-white shadow-2xl relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FFD100]/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <h3 className="text-4xl font-bold mb-4 drop-shadow-lg">Ready to Get Started?</h3>
            <p className="text-white/95 mb-8 max-w-2xl mx-auto text-lg font-medium">
              Join SAR Educational Complex and experience modern school management
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/auth/login">
                <Button size="lg" className="bg-white text-[#E31E24] hover:bg-gray-100 font-bold px-12 py-6 text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all">
                  Login Now →
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="border-3 border-white text-white hover:bg-white/20 bg-white/10 backdrop-blur font-bold px-12 py-6 text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                >
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#E31E24] text-white py-12 border-t-4 border-[#FFD100] mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg overflow-hidden ring-2 ring-[#FFD100]">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sarlogo-xxAG87QJUVXBfV9KkmRbyQ4NK6e1Dm.jpg"
                    alt="SAR Logo"
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>
                SAR Educational Complex
              </h4>
              <p className="text-sm text-white/90 font-medium">Nurturing Minds And Hearts</p>
            </div>
            <div>
              <h4 className="font-bold text-[#FFD100] mb-4">Location</h4>
              <p className="text-sm text-white/90">📍 Box 130, Sepe Sote</p>
              <p className="text-sm text-white/90">Hospital Junction, Kumasi</p>
              <p className="text-sm text-white/90">Ghana 🇬🇭</p>
            </div>
            <div>
              <h4 className="font-bold text-[#FFD100] mb-4">System</h4>
              <p className="text-sm text-white/90">Professional School Management</p>
              <p className="text-sm text-white/90">For Ghana Basic Schools</p>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 text-center text-sm">
            <p className="text-white/90">© 2025 SAR Educational Complex. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function UserTypeCard({
  icon,
  title,
  role,
  features,
  color,
}: {
  icon: string
  title: string
  role: string
  features: string[]
  color: string
}) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-2xl shadow-xl p-6 text-white hover:shadow-2xl transition-all transform hover:scale-105 group border-2 border-white/20`}>
      <div className="text-6xl mb-4 group-hover:scale-110 transition-transform drop-shadow-lg">{icon}</div>
      <h4 className="text-xl font-bold mb-4 drop-shadow-md">{title}</h4>
      <ul className="space-y-2.5 mb-6 text-sm">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="text-[#FFD100] font-bold text-lg drop-shadow-md">✓</span>
            <span className="leading-relaxed">{feature}</span>
          </li>
        ))}
      </ul>
      <Link href="/auth/login" className="block">
        <Button className="w-full bg-white text-[#E31E24] hover:bg-gray-100 font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
          Enter as {title.split(" ")[0]} →
        </Button>
      </Link>
    </div>
  )
}



function DemoCard({
  label,
  email,
  password,
}: {
  label: string
  email: string
  password: string
}) {
  return (
    <div className="bg-white/10 backdrop-blur p-6 rounded-lg border border-white/20">
      <p className="font-semibold text-white mb-3">{label}</p>
      <p className="text-xs text-gray-200 mb-1">Email</p>
      <p className="text-white font-mono text-xs mb-4">{email}</p>
      <p className="text-xs text-gray-200 mb-1">Password</p>
      <p className="text-white font-mono text-xs">{password}</p>
    </div>
  )
}
