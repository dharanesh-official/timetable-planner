'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { login } from './actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useFormStatus } from "react-dom"
import { useSearchParams } from 'next/navigation'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" isLoading={pending} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-600/20 transition-all text-base rounded-xl mt-6">
      {pending ? 'Signing In...' : 'Sign In'}
    </Button>
  )
}

const Typewriter = ({ text, speed = 40, loop = false }: { text: string, speed?: number, loop?: boolean }) => {
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    let i = 0
    let timer: NodeJS.Timeout
    let isMounted = true

    const startTyping = () => {
      setDisplayed('')
      i = 0
      timer = setInterval(() => {
        if (i < text.length) {
          if (isMounted) setDisplayed(text.substring(0, i + 1))
          i++
        } else {
          clearInterval(timer)
          if (loop && isMounted) {
            setTimeout(() => {
               if (isMounted) startTyping()
            }, 3000) // Pause for 3 seconds before looping
          }
        }
      }, speed)
    }

    startTyping()
    return () => {
      isMounted = false
      clearInterval(timer)
    }
  }, [text, speed, loop])

  return <>{displayed}</>
}

function WelcomeSection() {
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    // Trigger smooth fade in slide up animation after a short delay
    const t = setTimeout(() => setShowWelcome(true), 200)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="flex flex-col items-center text-center z-10 max-w-lg mx-auto w-full">
      {/* Logo - Fixed Position */}
      <div className="flex items-center gap-3 mb-10 h-14">
        <div className="w-12 h-12 bg-blue-900 rounded-xl flex items-center justify-center font-bold text-2xl text-white shadow-sm">
          T
        </div>
        <span className="font-extrabold text-3xl tracking-tight text-slate-900">
          Timetable<span className="text-blue-600">Pro</span>
        </span>
      </div>

      {/* Welcome Back - Smooth one-time animation */}
      <div className="h-16 flex items-center justify-center mb-6 overflow-hidden">
        <h1 className={`text-5xl font-extrabold text-slate-900 tracking-tight leading-tight transition-all duration-1000 ease-out transform ${showWelcome ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          Welcome Back
        </h1>
      </div>

      {/* Description - Continuous Looping Animation */}
      <div className="h-32 mt-2">
        <p className="text-lg text-slate-600 leading-relaxed font-medium">
          <Typewriter 
            text="Log in to manage your institution's academic structure, automate conflict-free timetables, and empower your faculty with our intelligent platform." 
            speed={30} 
            loop={true}
          />
          <span className="animate-pulse text-blue-600 ml-1">|</span>
        </p>
      </div>
    </div>
  )
}

function LoginForm() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <form action={login}>
      <div className="flex flex-col gap-6">
        {error && (
          <div className="p-4 bg-red-50/80 border border-red-100 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-red-950">Sign In Failed</span>
              <span className="text-xs text-red-700 leading-relaxed font-medium">
                {error === 'fetch failed' 
                  ? 'Could not connect to the authentication server. Please check your network connection or ensure the database is active.' 
                  : error}
              </span>
            </div>
          </div>
        )}
        <div className="flex flex-col space-y-2">
          <Label htmlFor="email" className="text-slate-700 font-semibold">Email address</Label>
          <Input 
            id="email" 
            name="email" 
            type="email" 
            placeholder="name@example.com" 
            required 
            className="h-12 border-slate-200 focus-visible:ring-blue-600 focus-visible:border-blue-600 bg-slate-50/50 rounded-xl text-base transition-all" 
          />
        </div>
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-slate-700 font-semibold">Password</Label>
            <Link href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">Forgot password?</Link>
          </div>
          <Input 
            id="password" 
            name="password" 
            type="password" 
            placeholder="••••••••" 
            required 
            className="h-12 border-slate-200 focus-visible:ring-blue-600 focus-visible:border-blue-600 bg-slate-50/50 rounded-xl text-base transition-all" 
          />
        </div>
        <SubmitButton />
      </div>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex font-sans">
      {/* Left Side - Welcome Section */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-blue-50 to-white relative overflow-hidden p-12">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-200/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-sky-200/30 rounded-full blur-[120px]" />

        <WelcomeSection />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-6 relative">
        <Card className="w-full max-w-[440px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-3xl">
          <CardHeader className="text-left pb-8 pt-10 px-8 lg:px-10">
            {/* Mobile Logo (visible only on small screens) */}
            <div className="w-10 h-10 bg-blue-900 rounded-xl flex lg:hidden items-center justify-center font-bold text-xl text-white mb-6 shadow-sm">
              T
            </div>
            <CardTitle className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Sign In</CardTitle>
            <CardDescription className="text-slate-500 text-base">Enter your email and password to access your account.</CardDescription>
          </CardHeader>
          <CardContent className="px-8 lg:px-10 pb-12">
            <Suspense fallback={<div className="h-48 flex items-center justify-center text-slate-400 font-medium">Loading form...</div>}>
              <LoginForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
