import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { LoginForm } from './components/login-form'

interface LoginPageProps {
  searchParams: Promise<{ redirectTo?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirectTo } = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Prime Financeiro</CardTitle>
          <CardDescription className="text-center">
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm redirectTo={redirectTo} />
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Precisa criar uma conta?{' '}
              <Link href="/admin/criar-conta" className="text-primary hover:underline">
                Página do administrador
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}