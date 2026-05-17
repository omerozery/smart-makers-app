import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/logout-button'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'דשבורד' },
  { href: '/lessons', label: 'שיעורים' },
  { href: '/groups', label: 'קבוצות' },
  { href: '/schools', label: 'בתי ספר' },
  { href: '/instructors', label: 'מדריכים' },
  { href: '/shortages', label: 'חוסרים' },
  { href: '/tasks', label: 'משימות' },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('auth_user_id', user.id)
    .single()

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar — appears on the left in RTL (visual end side) */}
      <aside className="w-56 bg-white border-s flex flex-col shrink-0">
        <div className="p-4 border-b">
          <p className="font-bold text-sm">Smart Makers</p>
          <p className="text-xs text-muted-foreground mt-0.5">ניהול תפעולי</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t space-y-2">
          {profile && (
            <p className="px-3 text-xs text-muted-foreground truncate">{profile.full_name}</p>
          )}
          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  )
}
