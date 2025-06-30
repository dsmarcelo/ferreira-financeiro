'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, KeyRound, User, Tag } from 'lucide-react'
import Link from 'next/link'

export default function UserMenu() {
  const handleLogout = () => {
    // TODO: Implement logout with new auth provider
    console.log('Logout clicked - implement with new auth provider')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
        >
          <User size={16} />
          <span className="hidden sm:inline">Conta</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild>
          <Link href="/categorias" className="flex items-center gap-2 cursor-pointer">
            <Tag size={16} />
            Editar Categorias
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/alterar-senha" className="flex items-center gap-2 cursor-pointer">
            <KeyRound size={16} />
            Alterar Senha
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full text-left text-sm"
          >
            <LogOut size={16} />
            Sair
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
