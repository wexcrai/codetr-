import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/giris')
  }
  
  return <DashboardLayout>{children}</DashboardLayout>
}
