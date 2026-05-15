'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2, Plus } from 'lucide-react'

export default function ScheduleSettingsClient({ initialWorkingDays, initialTimeSlots }: any) {
  const supabase = createClient()
  const [workingDays, setWorkingDays] = useState<any[]>(initialWorkingDays)
  const [timeSlots, setTimeSlots] = useState<any[]>(initialTimeSlots)
  const [isSaving, setIsSaving] = useState(false)

  const handleDayToggle = (id: number) => {
    setWorkingDays(days => days.map(d => d.id === id ? { ...d, is_working: !d.is_working } : d))
  }

  const handleAddSlot = () => {
    const nextPeriod = timeSlots.length > 0 ? Math.max(...timeSlots.map(t => t.period_number)) + 1 : 1
    setTimeSlots([...timeSlots, { id: `temp-${Date.now()}`, period_number: nextPeriod, type: 'Class', start_time: '00:00', end_time: '01:00', isNew: true }])
  }

  const handleRemoveSlot = (index: number) => {
    const newSlots = [...timeSlots]
    newSlots.splice(index, 1)
    // Recalculate period numbers to be sequential
    const updated = newSlots.map((s, i) => ({ ...s, period_number: i + 1 }))
    setTimeSlots(updated)
  }

  const handleSlotChange = (index: number, field: string, value: string) => {
    const newSlots = [...timeSlots]
    newSlots[index] = { ...newSlots[index], [field]: value }
    setTimeSlots(newSlots)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Save working days
      for (const day of workingDays) {
        await supabase.from('working_days').update({ is_working: day.is_working }).eq('id', day.id)
      }

      // Save time slots (Delete all and reinsert to handle reordering cleanly)
      await supabase.from('time_slots').delete().neq('id', 0) // delete all
      
      const slotsToInsert = timeSlots.map(s => ({
        period_number: s.period_number,
        type: s.type,
        start_time: s.start_time,
        end_time: s.end_time
      }))
      
      const { error } = await supabase.from('time_slots').insert(slotsToInsert)
      if (error) throw error

      alert('Schedule settings saved successfully!')
    } catch (err: any) {
      alert('Error saving settings: ' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Schedule Settings</h1>
          <p className="text-slate-600 mt-1">Configure working days, periods, breaks, and lunch timings.</p>
        </div>
        <Button onClick={handleSave} isLoading={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all rounded-lg font-medium">
          {isSaving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Working Days</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {workingDays.map(day => (
            <div key={day.id} className="flex items-center space-x-3 bg-slate-50 hover:bg-slate-100 transition-colors p-4 rounded-xl border border-slate-200 cursor-pointer" onClick={() => handleDayToggle(day.id)}>
              <input 
                type="checkbox"
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                checked={day.is_working} 
                onChange={(e) => { e.stopPropagation(); handleDayToggle(day.id); }} 
              />
              <Label className={`cursor-pointer ${day.is_working ? 'font-bold text-slate-900' : 'font-medium text-slate-500'}`}>
                {day.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">Time Slots Configuration</h2>
          <Button onClick={handleAddSlot} variant="outline" size="sm" className="border-slate-200 text-slate-700 font-medium rounded-lg"><Plus className="w-4 h-4 mr-2"/> Add Period</Button>
        </div>
        
        <div className="space-y-4">
          {timeSlots.map((slot, index) => (
            <div key={slot.id} className={`flex flex-wrap sm:flex-nowrap items-center gap-4 p-4 rounded-xl border ${slot.type === 'Class' ? 'bg-slate-50 border-slate-200' : 'bg-orange-50/50 border-orange-200'}`}>
              <div className="w-12 flex-shrink-0 text-center font-bold text-slate-400">
                #{slot.period_number}
              </div>
              
              <div className="w-full sm:w-40">
                <select 
                  className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 shadow-sm"
                  value={slot.type}
                  onChange={(e) => handleSlotChange(index, 'type', e.target.value)}
                >
                  <option value="Class">Class Period</option>
                  <option value="Break">Short Break</option>
                  <option value="Lunch">Lunch Break</option>
                </select>
              </div>

              <div className="flex items-center gap-3 flex-1">
                <Input 
                  type="time" 
                  value={slot.start_time.substring(0, 5)} 
                  onChange={(e) => handleSlotChange(index, 'start_time', e.target.value)} 
                  className="w-32 bg-white border-slate-200 shadow-sm rounded-lg"
                />
                <span className="text-slate-400 font-medium">to</span>
                <Input 
                  type="time" 
                  value={slot.end_time.substring(0, 5)} 
                  onChange={(e) => handleSlotChange(index, 'end_time', e.target.value)} 
                  className="w-32 bg-white border-slate-200 shadow-sm rounded-lg"
                />
              </div>

              <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg ml-auto" onClick={() => handleRemoveSlot(index)}>
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
