import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center space-y-4 animate-in fade-in duration-500">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-slate-600 font-medium tracking-tight">Loading content...</p>
      </div>
    </div>
  )
}
