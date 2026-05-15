import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Clean Light-Themed Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 transition-all duration-300">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center font-bold text-xl text-white shadow-sm">
              T
            </div>
            <span className="font-bold text-2xl tracking-tight text-slate-900">
              Timetable<span className="text-blue-600">Pro</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-6 shadow-sm transition-all hover:shadow">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 bg-gradient-to-b from-blue-50/50 to-slate-50 overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto text-center z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/50 border border-blue-200 text-sm text-blue-800 mb-8 font-medium">
            <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
            Smart Academic Scheduling
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 text-slate-900 leading-[1.15]">
            The intelligent way to <br className="hidden lg:block" />
            <span className="text-blue-600">
              orchestrate your institution
            </span>
          </h1>
          
          <p className="text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Automate scheduling, resolve conflicts instantly, and empower your faculty with a unified platform designed for modern curriculum management.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-8 h-14 text-lg w-full sm:w-auto shadow-sm transition-all hover:shadow-md">
                Access Portal
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg px-8 h-14 text-lg w-full sm:w-auto transition-all shadow-sm">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Crafted for Excellence</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">Everything you need to manage your academic structure efficiently and reliably.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 group">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Curriculum Design</h3>
              <p className="text-slate-600 leading-relaxed">Manage regulations, batches, and subjects with unparalleled ease. Centralize your academic structure in one intuitive place.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 group">
              <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-6 text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-colors duration-200">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Smart Planning</h3>
              <p className="text-slate-600 leading-relaxed">Generate conflict-free timetables automatically while respecting faculty availability and complex constraints instantly.</p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 group">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Faculty Portal</h3>
              <p className="text-slate-600 leading-relaxed">Give faculty members direct access to their schedules and let them manage their availability dynamically on the go.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
