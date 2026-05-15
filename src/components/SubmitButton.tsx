'use client'

import { useFormStatus } from 'react-dom'
import { Button, ButtonProps } from '@/components/ui/button'

interface SubmitButtonProps extends ButtonProps {
  loadingText?: string
  defaultText: string
}

export function SubmitButton({ loadingText = 'Processing...', defaultText, ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" isLoading={pending} disabled={pending || props.disabled} {...props}>
      {pending ? loadingText : defaultText}
    </Button>
  )
}
