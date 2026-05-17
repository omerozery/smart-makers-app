import Link from 'next/link'
import { SchoolForm } from '@/components/schools/school-form'
import { createSchool } from './actions'

export default function NewSchoolPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-1">
        <Link href="/schools" className="text-sm text-muted-foreground hover:text-foreground">
          ← בתי ספר
        </Link>
        <h1 className="text-xl font-bold">בית ספר חדש</h1>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <SchoolForm onSave={createSchool} />
      </div>
    </div>
  )
}
