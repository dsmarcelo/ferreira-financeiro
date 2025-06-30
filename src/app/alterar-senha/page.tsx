import Header from '@/app/_components/header'
import SubPageHeader from '@/app/_components/sub-page-header'
import ChangePasswordForm from './_components/change-password-form'

export default async function ChangePasswordPage() {
  // TODO: Implement user authentication check with new auth provider
  const userEmail = 'user@example.com' // Placeholder - replace with actual user email from auth provider

  return (
    <div className="">
      <Header showBackButton={false} showDatePicker={false} />
      <SubPageHeader prevURL="/" title="Alterar Senha" />

      <div className="mx-auto mt-4 container px-4">
        <ChangePasswordForm userEmail={userEmail} />
      </div>
    </div>
  )
}
