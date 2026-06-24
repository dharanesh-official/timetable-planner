'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createUser } from './actions'

export default function CreateUserForm({ currentUserRole }: { currentUserRole: string }) {
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    setLoading(true)
    
    try {
      const formData = new FormData(form)
      const role = formData.get('role')
      
      if (!role) {
        throw new Error('Please select a role')
      }

      const result = await createUser(formData)
      
      if (result?.error) {
        throw new Error(result.error)
      }

      alert('User created successfully!')
      // Reset form safely
      form.reset()
      setSelectedRole('')
    } catch (error: any) {
      alert(error.message || 'An error occurred while creating the user.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${selectedRole === 'faculty' ? 'xl:grid-cols-6' : 'xl:grid-cols-5'} gap-5 items-end`}>
      <div className="flex flex-col space-y-2 lg:col-span-1">
        <Label htmlFor="full_name" className="text-slate-700 font-semibold">Full Name</Label>
        <Input id="full_name" name="full_name" required placeholder="John Doe" className="border-slate-200 focus-visible:ring-blue-600 bg-slate-50/50" />
      </div>
      <div className="flex flex-col space-y-2 lg:col-span-1">
        <Label htmlFor="email" className="text-slate-700 font-semibold">Email</Label>
        <Input id="email" name="email" type="email" required placeholder="name@example.com" className="border-slate-200 focus-visible:ring-blue-600 bg-slate-50/50" />
      </div>
      <div className="flex flex-col space-y-2 lg:col-span-1">
        <Label htmlFor="password" className="text-slate-700 font-semibold">Password</Label>
        <Input id="password" name="password" type="password" required placeholder="••••••••" minLength={6} className="border-slate-200 focus-visible:ring-blue-600 bg-slate-50/50" />
      </div>
      <div className="flex flex-col space-y-2 lg:col-span-1">
        <Label htmlFor="role" className="text-slate-700 font-semibold">Role</Label>
        <Select name="role" required onValueChange={(val) => setSelectedRole(val || '')} value={selectedRole}>
          <SelectTrigger className="border-slate-200 focus-visible:ring-blue-600 bg-slate-50/50">
            <SelectValue placeholder="Select Role" />
          </SelectTrigger>
          <SelectContent>
            {currentUserRole === 'super_admin' && (
              <SelectItem value="timetable_planner">Timetable Planner</SelectItem>
            )}
            {currentUserRole === 'timetable_planner' && (
              <>
                <SelectItem value="curriculum_designer">Curriculum Designer</SelectItem>
                <SelectItem value="faculty">Faculty</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
      </div>
      {selectedRole === 'faculty' && (
        <div className="flex flex-col space-y-2 lg:col-span-1 animate-in fade-in slide-in-from-top-2 duration-200">
          <Label htmlFor="weekly_hour_limit" className="text-slate-700 font-semibold">Weekly Limit (hrs)</Label>
          <Input 
            id="weekly_hour_limit" 
            name="weekly_hour_limit" 
            type="number" 
            min="1" 
            defaultValue="20" 
            required 
            className="border-slate-200 focus-visible:ring-blue-600 bg-slate-50/50" 
          />
        </div>
      )}
      <Button type="submit" isLoading={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-all text-sm rounded-lg">
        {loading ? 'Creating...' : 'Create'}
      </Button>
    </form>
  )
}
