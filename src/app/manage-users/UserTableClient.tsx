'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Edit2, Check, X, Loader2 } from 'lucide-react'
import DeleteUserButton from './DeleteUserButton'
import { updateFacultyProfile } from '../faculty/actions'

interface UserProfile {
  id: string
  full_name: string | null
  email: string
  role: string
  weekly_hour_limit: number | null
  created_at: string
}

export default function UserTableClient({ initialUsers }: { initialUsers: UserProfile[] }) {
  const [users, setUsers] = useState<UserProfile[]>(initialUsers)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLimit, setEditLimit] = useState<number>(20)
  const [saving, setSaving] = useState(false)

  const startEditing = (user: UserProfile) => {
    setEditingId(user.id)
    setEditLimit(user.weekly_hour_limit ?? 20)
  }

  const cancelEditing = () => {
    setEditingId(null)
  }

  const handleSave = async (id: string) => {
    if (editLimit < 1) {
      alert('Weekly Limit must be at least 1 hour.')
      return
    }

    setSaving(true)
    try {
      const res = await updateFacultyProfile(id, {
        weekly_hour_limit: editLimit
      })

      if (res?.error) {
        throw new Error(res.error)
      }

      setUsers(prev => prev.map(u => {
        if (u.id === id) {
          return {
            ...u,
            weekly_hour_limit: editLimit
          }
        }
        return u
      }))
      setEditingId(null)
    } catch (err: any) {
      alert('Failed to update weekly limit: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 border-b border-slate-200">
            <TableHead className="font-semibold text-slate-700">Name</TableHead>
            <TableHead className="font-semibold text-slate-700">Email</TableHead>
            <TableHead className="font-semibold text-slate-700">Role</TableHead>
            <TableHead className="font-semibold text-slate-700 w-[180px]">Weekly Limit</TableHead>
            <TableHead className="font-semibold text-slate-700">Created At</TableHead>
            <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => {
            const isEditing = editingId === u.id

            return (
              <TableRow key={u.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell className="font-medium text-slate-900">{u.full_name}</TableCell>
                <TableCell className="text-slate-600">{u.email}</TableCell>
                <TableCell>
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-bold tracking-wide uppercase border border-blue-100">
                    {u.role.replace('_', ' ')}
                  </span>
                </TableCell>
                
                {/* Weekly Limit Column */}
                <TableCell className="text-slate-600 font-medium">
                  {u.role === 'faculty' ? (
                    isEditing ? (
                      <div className="flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150">
                        <Input
                          type="number"
                          min="1"
                          value={editLimit}
                          onChange={(e) => setEditLimit(parseInt(e.target.value) || 0)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSave(u.id)
                            } else if (e.key === 'Escape') {
                              cancelEditing()
                            }
                          }}
                          className="h-8 w-16 border-slate-200 focus-visible:ring-blue-600 focus-visible:border-blue-600 bg-white rounded-lg shadow-sm text-sm p-1.5"
                          disabled={saving}
                          autoFocus
                        />
                        <span className="text-xs text-slate-400 font-semibold">hrs</span>
                        
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSave(u.id)}
                          disabled={saving}
                          className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg p-0"
                          title="Save"
                        >
                          {saving ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={cancelEditing}
                          disabled={saving}
                          className="h-7 w-7 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg p-0"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <div 
                        className="flex items-center gap-2 group cursor-pointer inline-flex hover:text-blue-600 transition-colors"
                        onClick={() => startEditing(u)}
                        title="Click to edit weekly limit"
                      >
                        <span>{u.weekly_hour_limit ?? 20} hrs</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-40 group-hover:opacity-100 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                          title="Edit weekly limit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )
                  ) : (
                    '-'
                  )}
                </TableCell>

                <TableCell className="text-slate-600">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <DeleteUserButton userId={u.id} role={u.role} />
                </TableCell>
              </TableRow>
            )
          })}
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12 text-slate-500 bg-slate-50/30">
                No users found matching your permission scope.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
