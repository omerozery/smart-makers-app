import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function SchoolsPage() {
  const supabase = await createClient()

  const { data: schools } = await supabase
    .from('schools')
    .select('id, name, city, groups(id)')
    .eq('is_active', true)
    .order('name')

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">בתי ספר</h1>
        <Link
          href="/schools/new"
          className="bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          + הוסף בית ספר
        </Link>
      </div>

      {!schools?.length ? (
        <p className="text-sm text-muted-foreground">אין בתי ספר פעילים</p>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">שם</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">עיר</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">קבוצות</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {schools.map((school) => (
                <tr key={school.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{school.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{school.city}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {Array.isArray(school.groups) ? school.groups.length : 0}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/schools/${school.id}`}
                      className="text-primary underline underline-offset-2"
                    >
                      פתח
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
