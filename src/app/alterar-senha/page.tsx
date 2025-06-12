import { getCurrentUser } from '@/utils/supabase/user'
import Header from '@/app/_components/header'
import SubPageHeader from '@/app/_components/sub-page-header'
import ChangePasswordForm from './_components/change-password-form'

export default async function ChangePasswordPage() {
  // Ensure user is authenticated (middleware already checked this)
  const user = await getCurrentUser()

  return (
    <div className="">
      <Header showBackButton={false} showDatePicker={false} />
      <SubPageHeader prevURL="/" title="Alterar Senha" />

      <div className="mx-auto mt-4 container px-4">
        <ChangePasswordForm userEmail={user.email!} />
      </div>
    </div>
  )
}
