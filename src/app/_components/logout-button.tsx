'use client'

import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { signout } from '@/app/login/actions'

export default function LogoutButton() {
  return (
    <form action={signout}>
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className="flex items-center gap-2"
      >
        <LogOut size={16} />
        <span className="hidden sm:inline">Sair</span>
      </Button>
    </form>
  )
}
