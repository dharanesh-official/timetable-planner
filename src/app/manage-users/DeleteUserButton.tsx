'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { deleteUser } from './actions'

export default function DeleteUserButton({ userId, role }: { userId: string, role: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return
    
    setIsDeleting(true)
    const result = await deleteUser(userId, role)
    if (result.error) {
      alert(result.error)
    }
    setIsDeleting(false)
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="text-red-500 hover:text-red-700 hover:bg-red-50"
      onClick={handleDelete}
      isLoading={isDeleting}
    >
      {!isDeleting && <Trash2 className="w-4 h-4 mr-2" />}
      {isDeleting ? 'Deleting...' : 'Remove'}
    </Button>
  )
}
