'use client'

import { useActionState } from 'react'
import { createAccount } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { AlertCircle, CheckCircle, Shield, Loader2 } from 'lucide-react'

export default function CreateAccountPage() {
  const [state, formAction, pending] = useActionState(createAccount, null)

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
          {state && state !== 'success' && (
            <div className="mb-4 flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {state === 'missing_admin_password' && 'Senha de administrador não configurada no sistema.'}
              {state === 'invalid_admin_password' && 'Senha de administrador incorreta.'}
              {state !== 'missing_admin_password' && state !== 'invalid_admin_password' && state}
            </div>
          )}

          {state === 'success' && (
            <div className="mb-4 flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-700">
              <CheckCircle className="h-4 w-4" />
              Conta criada com sucesso!
            </div>
          )}

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
