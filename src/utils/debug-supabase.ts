import { createClient } from '@/utils/supabase/server'

export async function debugSupabase() {
  console.log('Environment variables:')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set')

  try {
    const supabase = await createClient()
    console.log('Supabase client created successfully')

    // Test basic connection
    const { data, error } = await supabase.auth.getSession()
    console.log('Session check result:', { data: !!data, error })

    return { success: true }
  } catch (error) {
    console.error('Error creating Supabase client:', error)
    return { success: false, error }
  }
}
