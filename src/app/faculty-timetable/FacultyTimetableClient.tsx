'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function FacultyTimetableClient({ role, facultyMembers, workingDays, timeSlots, slots, selectedFacultyId }: any) {
  const router = useRouter()
  const [selectedFaculty, setSelectedFaculty] = useState(selectedFacultyId || '')

  const handleFacultySelect = (val: string) => {
    setSelectedFaculty(val)
    router.push(`/faculty-timetable?faculty_id=${val}`)
  }

  // Create a 2D lookup grid for easy rendering: grid[day_of_week][period_number]
  const grid: Record<number, Record<number, any>> = {}
  
  const days = workingDays || []
  const periods = timeSlots || []

  days.forEach((d: any) => {
    grid[d.day_of_week] = {}
    periods.forEach((p: any) => {
      grid[d.day_of_week][p.period_number] = null
    })
  })

  // Group slots by day and period.
  slots?.forEach((slot: any) => {
    if(grid[slot.day_of_week]) {
       grid[slot.day_of_week][slot.period_number] = slot
    }
  })

  const facultyName = facultyMembers.find((f: any) => f.id === selectedFaculty)?.full_name || 'My Timetable'

  return (
    <div className="max-w-[1400px] mx-auto py-10 px-6 print:p-0 print:m-0 print:max-w-full">
      <div className="mb-8 print:hidden">
        <h1 className="text-3xl font-bold text-slate-900">{role === 'faculty' ? 'My Timetable' : 'Faculty Timetable'}</h1>
        <p className="text-slate-600 mt-1">View the conflict-free personal schedule for faculty members.</p>
      </div>

      {role === 'timetable_planner' && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-8 print:hidden">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Select Faculty Member</h2>
          <div className="max-w-md">
            <div className="flex flex-col space-y-2">
              <Label className="text-slate-700 font-semibold">Faculty</Label>
              <select 
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 shadow-sm"
                value={selectedFaculty} 
                onChange={(e) => handleFacultySelect(e.target.value)}
              >
                <option value="" disabled>Select Faculty Member</option>
                {facultyMembers.map((f: any) => <option key={f.id} value={f.id}>{f.full_name}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {selectedFacultyId && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 print:shadow-none print:border-none print:m-0 print:p-0">
          <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center print:hidden">
            <h2 className="text-xl font-bold text-slate-900">
              {role === 'faculty' ? 'My Weekly Schedule' : `${facultyName}'s Schedule`}
            </h2>
            <div className="flex gap-4">
              <Button variant="default" className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-all rounded-lg" onClick={() => window.print()}>
                Download PDF
              </Button>
              <Button variant="outline" className="border-slate-200 shadow-sm" onClick={() => window.print()}>
                Print Timetable
              </Button>
            </div>
          </div>
          
          <div className="hidden print:block mb-6 text-center">
            <h1 className="text-2xl font-bold text-slate-900">Personal Timetable</h1>
            <p className="text-slate-600 mt-1">
              {role === 'faculty' ? 'Faculty Schedule' : facultyName}
            </p>
          </div>

          <div className="overflow-x-auto p-6 print:p-0">
            {slots.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-4xl mb-4">📭</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No Classes Scheduled</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  There are currently no classes assigned to this faculty member in the generated timetables.
                </p>
              </div>
            ) : (
              <table className="w-full border-collapse min-w-[1200px] print:min-w-full print:text-sm">
                <thead>
                  <tr>
                    <th className="border border-slate-200 bg-slate-100 p-4 print:p-2 text-center font-bold text-slate-700 w-32 print:w-24">Day / Time</th>
                    {periods.map((p: any) => (
                      <th key={p.id} className="border border-slate-200 bg-slate-100 p-3 print:p-1.5 text-center w-40 print:w-auto">
                        <div className="font-bold text-slate-800">{p.type === 'Class' ? `Period ${p.period_number}` : p.type}</div>
                        <div className="text-xs text-slate-500 font-semibold mt-1">{p.start_time.substring(0, 5)} - {p.end_time.substring(0, 5)}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {days.map((day: any) => (
                    <tr key={day.id}>
                      <td className="border border-slate-200 bg-slate-50 p-4 print:p-2 text-center font-bold text-slate-800">
                        {day.name}
                      </td>
                      {periods.map((period: any) => {
                        if (period.type === 'Break' || period.type === 'Lunch') {
                          return (
                            <td key={period.id} className="border border-slate-200 bg-slate-50/50 p-2 print:p-1 text-center align-middle relative overflow-hidden">
                               <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.02)_10px,rgba(0,0,0,0.02)_20px)]" />
                               <span className="relative z-10 text-slate-400 font-bold tracking-widest uppercase text-xs rotate-[-90deg] inline-block mt-4 print:mt-1">{period.type}</span>
                            </td>
                          )
                        }

                        const slot = grid[day.day_of_week]?.[period.period_number]
                        
                        if (!slot) {
                          return (
                            <td key={period.id} className="border border-slate-200 p-2 print:p-1 text-center bg-white">
                              <span className="text-slate-300 font-medium text-xl">-</span>
                            </td>
                          )
                        }

                        const isLab = slot.subjects?.type === 'Lab'
                        const batchName = slot.timetables?.semesters?.batches?.name || ''
                        const semesterName = slot.timetables?.semesters?.name || ''
                        
                        return (
                          <td key={period.id} className={`border border-slate-200 p-3 print:p-1 text-center align-middle ${isLab ? 'bg-cyan-50/70 border-cyan-100' : 'bg-blue-50/50 border-blue-100'}`}>
                            <div className="flex flex-col items-center justify-center gap-1.5 print:gap-1">
                              <span className="text-[15px] print:text-xs font-extrabold text-slate-900 tracking-tight leading-none bg-white/60 px-2 print:px-1 py-1 print:py-0.5 rounded-md shadow-sm border border-white/80">
                                {batchName}
                              </span>
                              <span className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2" title={slot.subjects?.name}>
                                {slot.subjects?.name}
                              </span>
                              {(semesterName || slot.labs?.name) && (
                                <div className="flex flex-col items-center gap-0.5 mt-0.5">
                                  {semesterName && <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{semesterName}</span>}
                                  {slot.labs?.name && <span className="text-[11px] text-cyan-800 font-bold bg-cyan-100/80 px-1.5 py-0.5 rounded mt-0.5">{slot.labs.name}</span>}
                                </div>
                              )}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
