'use client'

import { useActionState, useEffect } from 'react'
import { changePassword, type ActionResponse } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { KeyRound, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const initialState: ActionResponse = {
  success: false,
  message: '',
}

interface ChangePasswordFormProps {
  userEmail: string
}

export default function ChangePasswordForm({ userEmail }: ChangePasswordFormProps) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState<ActionResponse, FormData>(
    changePassword,
    initialState,
  )

  // Handle success/error toasts
  useEffect(() => {
    if (state.success === true && state.message) {
      toast.success(state.message)
      // Redirect back to home after successful password change
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } else if (state.success === false && state.message) {
      toast.error(state.message)
    }
  }, [state, router])

  // Parse error messages from ActionResponse
  const errors = state?.errors ?? {}

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-2">
          <KeyRound className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold text-center">Alterar Senha</CardTitle>
        <CardDescription className="text-center">
          Digite sua nova senha para atualizar sua conta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Senha Atual</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              placeholder="Digite sua senha atual"
              required
              min={6}
              disabled={pending}
              defaultValue={state?.currentPassword}
            />
            {errors.currentPassword && (
              <p className="text-sm text-red-500" aria-live="polite">
                {errors.currentPassword[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova Senha</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder="Digite sua nova senha"
              required
              min={6}
              disabled={pending}
              defaultValue={state?.newPassword}
            />
            {errors.newPassword && (
              <p className="text-sm text-red-500" aria-live="polite">
                {errors.newPassword[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirme sua nova senha"
              required
              min={6}
              disabled={pending}
              defaultValue={state?.confirmPassword}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500" aria-live="polite">
                {errors.confirmPassword[0]}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Alterando...
              </>
            ) : (
              'Alterar Senha'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Email: {userEmail}
          </p>
        </div>

        {state.message && !state.success && (
          <p className="mt-4 text-sm text-red-600 text-center" aria-live="polite">
            {state.message}
          </p>
        )}
      </CardContent>
    </Card>
  )
}