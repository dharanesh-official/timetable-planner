'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Users, BookOpen, Calendar, Settings, Menu, LogOut, LayoutDashboard, Layers, School, CalendarDays } from 'lucide-react'

export function Sidebar({ role }: { role?: string }) {
  const [isHovered, setIsHovered] = useState(false)

  if (!role) return null

  return (
    <div 
      className={`print:hidden fixed left-0 top-0 h-full bg-white text-slate-900 transition-all duration-300 z-50 flex flex-col shadow-sm border-r border-slate-200 ${isHovered ? 'w-64' : 'w-20'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center h-20 px-5 border-b border-slate-200 shrink-0 bg-white">
        <div className="w-10 h-10 rounded-xl bg-blue-900 flex items-center justify-center shrink-0 text-white shadow-sm">
          <span className="font-bold text-lg">T</span>
        </div>
        <span className={`ml-4 font-bold text-xl text-slate-900 whitespace-nowrap transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          Planner
        </span>
      </div>

      <nav className="flex-1 py-6 flex flex-col gap-2 px-3 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        <Link href="/dashboard" className="flex items-center px-3 py-3.5 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-blue-600 rounded-r-full transition-all duration-300 group-hover:h-1/2 opacity-0 group-hover:opacity-100"></div>
          <LayoutDashboard className="w-6 h-6 shrink-0 text-slate-900 group-hover:text-blue-600 transition-colors" />
          <span className={`ml-4 font-medium whitespace-nowrap transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>Dashboard</span>
        </Link>
        
        {(role === 'super_admin' || role === 'timetable_planner') && (
          <Link href="/manage-users" className="flex items-center px-3 py-3.5 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-blue-600 rounded-r-full transition-all duration-300 group-hover:h-1/2 opacity-0 group-hover:opacity-100"></div>
            <Users className="w-6 h-6 shrink-0 text-slate-900 group-hover:text-blue-600 transition-colors" />
            <span className={`ml-4 font-medium whitespace-nowrap transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>Manage Users</span>
          </Link>
        )}

        {role === 'curriculum_designer' && (
          <>
            <div className={`mt-4 mb-2 px-4 text-xs font-bold text-slate-900 uppercase tracking-wider transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              Curriculum
            </div>
            <Link href="/regulations" className="flex items-center px-3 py-3.5 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-blue-600 rounded-r-full transition-all duration-300 group-hover:h-1/2 opacity-0 group-hover:opacity-100"></div>
              <BookOpen className="w-6 h-6 shrink-0 text-slate-900 group-hover:text-blue-600 transition-colors" />
              <span className={`ml-4 font-medium whitespace-nowrap transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>Regulations</span>
            </Link>
            <Link href="/batches" className="flex items-center px-3 py-3.5 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-blue-600 rounded-r-full transition-all duration-300 group-hover:h-1/2 opacity-0 group-hover:opacity-100"></div>
              <Layers className="w-6 h-6 shrink-0 text-slate-900 group-hover:text-blue-600 transition-colors" />
              <span className={`ml-4 font-medium whitespace-nowrap transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>Batches</span>
            </Link>
            <Link href="/semesters" className="flex items-center px-3 py-3.5 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-blue-600 rounded-r-full transition-all duration-300 group-hover:h-1/2 opacity-0 group-hover:opacity-100"></div>
              <CalendarDays className="w-6 h-6 shrink-0 text-slate-900 group-hover:text-blue-600 transition-colors" />
              <span className={`ml-4 font-medium whitespace-nowrap transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>Semesters</span>
            </Link>
            <Link href="/subjects" className="flex items-center px-3 py-3.5 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-blue-600 rounded-r-full transition-all duration-300 group-hover:h-1/2 opacity-0 group-hover:opacity-100"></div>
              <School className="w-6 h-6 shrink-0 text-slate-900 group-hover:text-blue-600 transition-colors" />
              <span className={`ml-4 font-medium whitespace-nowrap transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>Subjects</span>
            </Link>
          </>
        )}

        {role === 'timetable_planner' && (
          <>
            <div className={`mt-4 mb-2 px-4 text-xs font-bold text-slate-900 uppercase tracking-wider transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              Scheduling
            </div>
            <Link href="/schedule-settings" className="flex items-center px-3 py-3.5 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-blue-600 rounded-r-full transition-all duration-300 group-hover:h-1/2 opacity-0 group-hover:opacity-100"></div>
              <Settings className="w-6 h-6 shrink-0 text-slate-900 group-hover:text-blue-600 transition-colors" />
              <span className={`ml-4 font-medium whitespace-nowrap transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>Schedule Settings</span>
            </Link>
            <Link href="/labs" className="flex items-center px-3 py-3.5 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-blue-600 rounded-r-full transition-all duration-300 group-hover:h-1/2 opacity-0 group-hover:opacity-100"></div>
              <School className="w-6 h-6 shrink-0 text-slate-900 group-hover:text-blue-600 transition-colors" />
              <span className={`ml-4 font-medium whitespace-nowrap transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>Manage Labs</span>
            </Link>
            <Link href="/design-tt" className="flex items-center px-3 py-3.5 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-blue-600 rounded-r-full transition-all duration-300 group-hover:h-1/2 opacity-0 group-hover:opacity-100"></div>
              <BookOpen className="w-6 h-6 shrink-0 text-slate-900 group-hover:text-blue-600 transition-colors" />
              <span className={`ml-4 font-medium whitespace-nowrap transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>Design TT</span>
            </Link>
            <Link href="/timetable" className="flex items-center px-3 py-3.5 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-blue-600 rounded-r-full transition-all duration-300 group-hover:h-1/2 opacity-0 group-hover:opacity-100"></div>
              <Calendar className="w-6 h-6 shrink-0 text-slate-900 group-hover:text-blue-600 transition-colors" />
              <span className={`ml-4 font-medium whitespace-nowrap transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>Timetable</span>
            </Link>
            <Link href="/faculty-timetable" className="flex items-center px-3 py-3.5 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-blue-600 rounded-r-full transition-all duration-300 group-hover:h-1/2 opacity-0 group-hover:opacity-100"></div>
              <Users className="w-6 h-6 shrink-0 text-slate-900 group-hover:text-blue-600 transition-colors" />
              <span className={`ml-4 font-medium whitespace-nowrap transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>Faculty TT</span>
            </Link>
          </>
        )}

        {(role === 'faculty' || role === 'curriculum_designer') && (
          <>
            <div className={`mt-4 mb-2 px-4 text-xs font-bold text-slate-900 uppercase tracking-wider transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              My Portal
            </div>
            <Link href="/faculty-timetable" className="flex items-center px-3 py-3.5 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-blue-600 rounded-r-full transition-all duration-300 group-hover:h-1/2 opacity-0 group-hover:opacity-100"></div>
              <CalendarDays className="w-6 h-6 shrink-0 text-slate-900 group-hover:text-blue-600 transition-colors" />
              <span className={`ml-4 font-medium whitespace-nowrap transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>My Timetable</span>
            </Link>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-slate-200 shrink-0">
        <form action="/auth/signout" method="post">
          <button type="submit" className="flex items-center px-3 py-3.5 w-full rounded-xl hover:bg-red-50 transition-colors text-slate-900 hover:text-red-600 group">
            <LogOut className="w-6 h-6 shrink-0 group-hover:scale-110 transition-transform" />
            <span className={`ml-4 font-medium whitespace-nowrap transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>Sign out</span>
          </button>
        </form>
      </div>
    </div>
  )
}
