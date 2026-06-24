'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Edit2, Check, X, Loader2 } from 'lucide-react'
import { updateFacultyProfile } from './actions'

interface FacultyMember {
  id: string
  full_name: string
  email: string
  department: string | null
  weekly_hour_limit: number | null
  created_at: string
}

export default function FacultyListClient({ initialFacultyMembers }: { initialFacultyMembers: FacultyMember[] }) {
  const [facultyMembers, setFacultyMembers] = useState<FacultyMember[]>(initialFacultyMembers)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLimit, setEditLimit] = useState<number>(20)
  const [editDept, setEditDept] = useState<string>('')
  const [saving, setSaving] = useState(false)

  const startEditing = (faculty: FacultyMember) => {
    setEditingId(faculty.id)
    setEditLimit(faculty.weekly_hour_limit ?? 20)
    setEditDept(faculty.department ?? '')
  }

  const cancelEditing = () => {
    setEditingId(null)
  }

  const handleSave = async (id: string) => {
    if (editLimit < 1) {
      alert('Weekly Hour Limit must be at least 1 hour.')
      return
    }

    setSaving(true)
    try {
      const res = await updateFacultyProfile(id, {
        weekly_hour_limit: editLimit,
        department: editDept.trim() || undefined
      })

      if (res?.error) {
        throw new Error(res.error)
      }

      setFacultyMembers(prev => prev.map(f => {
        if (f.id === id) {
          return {
            ...f,
            weekly_hour_limit: editLimit,
            department: editDept.trim() || null
          }
        }
        return f
      }))
      setEditingId(null)
    } catch (err: any) {
      alert('Failed to update faculty: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/50 border-b border-slate-200">
            <TableHead className="font-semibold text-slate-700">Name</TableHead>
            <TableHead className="font-semibold text-slate-700">Email</TableHead>
            <TableHead className="font-semibold text-slate-700">Department</TableHead>
            <TableHead className="font-semibold text-slate-700">Weekly Hour Limit</TableHead>
            <TableHead className="font-semibold text-slate-700">Joined At</TableHead>
            <TableHead className="text-right font-semibold text-slate-700 w-[140px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {facultyMembers.map((faculty) => {
            const isEditing = editingId === faculty.id

            return (
              <TableRow key={faculty.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell className="font-bold text-slate-800">{faculty.full_name}</TableCell>
                <TableCell className="text-slate-600 font-medium">{faculty.email}</TableCell>
                
                {/* Department Cell */}
                <TableCell>
                  {isEditing ? (
                    <Input
                      value={editDept}
                      onChange={(e) => setEditDept(e.target.value)}
                      placeholder="e.g. CSE, ECE"
                      className="h-9 max-w-[150px] border-slate-200 focus-visible:ring-blue-600 focus-visible:border-blue-600 bg-white rounded-lg shadow-sm text-sm"
                      disabled={saving}
                    />
                  ) : (
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wide uppercase border ${
                      faculty.department 
                        ? 'bg-slate-100 text-slate-700 border-slate-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {faculty.department || 'Not Assigned'}
                    </span>
                  )}
                </TableCell>

                {/* Weekly Limit Cell */}
                <TableCell>
                  {isEditing ? (
                    <div className="flex items-center gap-1.5 max-w-[110px]">
                      <Input
                        type="number"
                        min="1"
                        value={editLimit}
                        onChange={(e) => setEditLimit(parseInt(e.target.value) || 0)}
                        className="h-9 border-slate-200 focus-visible:ring-blue-600 focus-visible:border-blue-600 bg-white rounded-lg shadow-sm text-sm"
                        disabled={saving}
                      />
                      <span className="text-xs text-slate-400 font-semibold">hrs</span>
                    </div>
                  ) : (
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-bold tracking-wide border border-blue-100">
                      {faculty.weekly_hour_limit ?? 20} hrs/week
                    </span>
                  )}
                </TableCell>

                {/* Joined At Cell */}
                <TableCell className="text-slate-500 text-sm font-medium">
                  {new Date(faculty.created_at).toLocaleDateString()}
                </TableCell>

                {/* Actions Cell */}
                <TableCell className="text-right">
                  {isEditing ? (
                    <div className="flex justify-end items-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleSave(faculty.id)}
                        disabled={saving}
                        className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                        title="Save changes"
                      >
                        {saving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={cancelEditing}
                        disabled={saving}
                        className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditing(faculty)}
                      className="border-slate-200 hover:border-blue-600 hover:text-blue-700 transition-all font-medium text-xs rounded-lg gap-1.5 h-8"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit Limit
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
          {facultyMembers.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12 text-slate-500 bg-slate-50/30">
                No faculty members found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
