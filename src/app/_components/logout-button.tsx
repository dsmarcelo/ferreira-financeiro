'use client'

import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
  const handleLogout = () => {
    // TODO: Implement logout with new auth provider
    console.log('Logout clicked - implement with new auth provider')
  }

  return (
    <Button
      onClick={handleLogout}
      variant="ghost"
      size="sm"
      className="flex items-center gap-2"
    >
      <LogOut size={16} />
      <span className="hidden sm:inline">Sair</span>
    </Button>
  )
}
