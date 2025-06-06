import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default function ErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">Erro de Autenticação</CardTitle>
          <CardDescription>
            Ocorreu um erro durante o processo de autenticação.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Possíveis causas:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Link de confirmação expirado</li>
              <li>Credenciais inválidas</li>
              <li>Problema temporário no sistema</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href="/login">
                Tentar novamente
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/create-account">
                Criar nova conta
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
