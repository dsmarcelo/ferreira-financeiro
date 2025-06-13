'use client'

import { useActionState, useEffect } from 'react'
import { createAccount, type CreateAccountResponse } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Shield, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function CreateAccountPage() {
  const router = useRouter()
  const [state, formAction, pending] = useActionState<CreateAccountResponse, FormData>(createAccount, {})

  useEffect(() => {
    if (state?.success === true && state.message) {
      toast.success(state.message)
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else if (state?.error) {
      toast.error(state.error)
    }
  }, [state, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Área do Administrador</CardTitle>
          <CardDescription className="text-center">
            Criar nova conta de usuário
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminPassword">Senha do Administrador</Label>
              <Input
                id="adminPassword"
                name="adminPassword"
                type="password"
                placeholder="Digite a senha de administrador"
                required
                disabled={pending}
                defaultValue={state?.adminPassword}
              />
              <p className="text-xs text-muted-foreground">
                Senha necessária para criar novas contas
              </p>
            </div>

            <div className="border-t pt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email do Novo Usuário</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="usuario@email.com"
                  required
                  disabled={pending}
                  defaultValue={state?.email}
                />
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="password">Senha do Novo Usuário</Label>
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
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar Conta'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-primary hover:underline">
              ← Voltar para o login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
