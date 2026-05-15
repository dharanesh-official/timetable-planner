'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function SubjectsClient({
  regulations,
  batches,
  semesters,
  initialSubjects
}: any) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [subjects, setSubjects] = useState(initialSubjects)
  const [selectedReg, setSelectedReg] = useState<string | null>(null)
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null)
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null)

  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [credits, setCredits] = useState('')
  const [subjectType, setSubjectType] = useState('Theory')

  const filteredBatches = batches.filter((b: any) => b.regulation_id === selectedReg)
  const filteredSemesters = semesters.filter((s: any) => s.batch_id === selectedBatch)
  const filteredSubjects = subjects.filter((s: any) => s.semester_id === selectedSemester)

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSemester || !code || !name || !credits) return

    const { data, error } = await supabase
      .from('subjects')
      .insert({
        semester_id: selectedSemester,
        code,
        name,
        type: subjectType,
        credits: parseFloat(credits)
      })
      .select('*')
      .single()

    if (error) {
      alert('Error adding subject: ' + error.message)
    } else if (data) {
      setSubjects([data, ...subjects])
      setCode('')
      setName('')
      setCredits('')
      setSubjectType('Theory')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subject?')) return
    const { error } = await supabase.from('subjects').delete().eq('id', id)
    if (!error) {
      setSubjects(subjects.filter((s: any) => s.id !== id))
    }
  }

  // Get names for breadcrumbs
  const currentRegName = regulations.find((r: any) => r.id === selectedReg)?.name
  const currentBatchName = batches.find((b: any) => b.id === selectedBatch)?.name
  const currentSemName = semesters.find((s: any) => s.id === selectedSemester)?.name

  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Curriculum Subjects</h1>
          <p className="text-slate-500 mt-1">Navigate through the curriculum structure to manage subjects.</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50">Back to Dashboard</Button>
        </Link>
      </div>

      {/* Breadcrumbs / Back Navigation */}
      <div className="flex items-center gap-2 mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <Button 
          variant="ghost" 
          className={`font-semibold ${!selectedReg ? 'text-blue-600' : 'text-slate-500'}`}
          onClick={() => { setSelectedReg(null); setSelectedBatch(null); setSelectedSemester(null); }}
        >
          Regulations
        </Button>
        
        {selectedReg && (
          <>
            <span className="text-slate-400">/</span>
            <Button 
              variant="ghost" 
              className={`font-semibold ${!selectedBatch ? 'text-blue-600' : 'text-slate-500'}`}
              onClick={() => { setSelectedBatch(null); setSelectedSemester(null); }}
            >
              {currentRegName}
            </Button>
          </>
        )}

        {selectedBatch && (
          <>
            <span className="text-slate-400">/</span>
            <Button 
              variant="ghost" 
              className={`font-semibold ${!selectedSemester ? 'text-blue-600' : 'text-slate-500'}`}
              onClick={() => { setSelectedSemester(null); }}
            >
              {currentBatchName}
            </Button>
          </>
        )}

        {selectedSemester && (
          <>
            <span className="text-slate-400">/</span>
            <Button variant="ghost" className="font-semibold text-blue-600">
              {currentSemName}
            </Button>
          </>
        )}
      </div>

      <div className="relative min-h-[400px]">
        {/* Step 1: Regulations */}
        {!selectedReg && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-300">
            <h2 className="text-2xl font-bold mb-6 text-slate-900">Choose Regulation</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {regulations.map((r: any) => (
                <div 
                  key={r.id} 
                  onClick={() => setSelectedReg(r.id)}
                  className="cursor-pointer group flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 bg-white shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                    <span className="text-2xl">📚</span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-700 text-center">{r.name}</h3>
                </div>
              ))}
              {regulations.length === 0 && (
                <p className="text-slate-500 italic">No regulations created yet. Go to Regulations to create one.</p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Batches */}
        {selectedReg && !selectedBatch && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-300">
            <h2 className="text-2xl font-bold mb-6 text-slate-900">Choose Batch</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredBatches.map((b: any) => (
                <div 
                  key={b.id} 
                  onClick={() => setSelectedBatch(b.id)}
                  className="cursor-pointer group flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 bg-white shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                    <span className="text-2xl">🎓</span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-700 text-center">{b.name}</h3>
                </div>
              ))}
              {filteredBatches.length === 0 && (
                <p className="text-slate-500 italic col-span-full">No batches found for this regulation.</p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Semesters */}
        {selectedBatch && !selectedSemester && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-300">
            <h2 className="text-2xl font-bold mb-6 text-slate-900">Choose Semester</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredSemesters.map((s: any) => (
                <div 
                  key={s.id} 
                  onClick={() => setSelectedSemester(s.id)}
                  className="cursor-pointer group flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 bg-white shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                    <span className="text-2xl">📅</span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-700 text-center">{s.name}</h3>
                </div>
              ))}
              {filteredSemesters.length === 0 && (
                <p className="text-slate-500 italic col-span-full">No semesters found for this batch.</p>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Subjects Management */}
        {selectedSemester && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Add Subject to {currentSemName}</h2>
              <form onSubmit={handleAddSubject} className="flex gap-4 items-end flex-wrap">
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-sm font-medium mb-1">Code</label>
                  <Input value={code} onChange={e => setCode(e.target.value)} placeholder="CS101" required className="bg-white border-slate-200 focus-visible:ring-blue-600 shadow-sm rounded-lg" />
                </div>
                <div className="flex-[2] min-w-[200px]">
                  <label className="block text-sm font-medium mb-1">Subject Name</label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Programming" required className="bg-white border-slate-200 focus-visible:ring-blue-600 shadow-sm rounded-lg" />
                </div>
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select 
                    value={subjectType} 
                    onChange={e => setSubjectType(e.target.value)} 
                    className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 shadow-sm"
                  >
                    <option value="Theory">Theory</option>
                    <option value="Lab">Lab</option>
                  </select>
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium mb-1">Credits</label>
                  <Input value={credits} onChange={e => setCredits(e.target.value)} type="number" step="0.1" placeholder="3.0" required className="bg-white border-slate-200 focus-visible:ring-blue-600 shadow-sm rounded-lg" />
                </div>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm rounded-lg w-24">Add</Button>
              </form>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 border-b border-slate-200">
                  <TableHead className="font-semibold text-slate-700">Code</TableHead>
                  <TableHead className="font-semibold text-slate-700">Subject Name</TableHead>
                  <TableHead className="font-semibold text-slate-700">Type</TableHead>
                  <TableHead className="font-semibold text-slate-700">Credits</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubjects.map((sub: any) => (
                  <TableRow key={sub.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-bold text-blue-700">{sub.code}</TableCell>
                    <TableCell className="font-semibold">{sub.name}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-md text-xs font-semibold ${sub.type === 'Lab' ? 'bg-cyan-50 text-cyan-700 border border-cyan-100' : 'bg-orange-50 text-orange-700 border border-orange-100'}`}>
                        {sub.type || 'Theory'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-slate-100 rounded-md text-xs font-semibold">
                        {sub.credits} CR
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(sub.id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredSubjects.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-slate-500">
                      No subjects added to this semester yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
