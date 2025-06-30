'use client'

import { useActionState } from 'react'
import { login, type LoginResponse } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Loader2 } from 'lucide-react'

interface LoginFormProps {
  redirectTo?: string | null
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const [state, formAction, pending] = useActionState<LoginResponse, FormData>(login, {})

  return (
    <>
      {state.error && (
        <div className="mb-4 flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        {redirectTo && (
          <input type="hidden" name="redirectTo" value={redirectTo} />
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="seu@email.com"
            required
            disabled={pending}
            defaultValue={state?.email}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            min={6}
            disabled={pending}
          />
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Entrando...
            </>
          ) : (
            'Entrar'
          )}
        </Button>
      </form>
    </>
  )
}