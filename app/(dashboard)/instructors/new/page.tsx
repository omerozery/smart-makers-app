import Link from 'next/link'
import { InstructorForm } from '@/components/instructors/instructor-form'
import { createInstructor } from './actions'

export default function NewInstructorPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-1">
        <Link href="/instructors" className="text-sm text-muted-foreground hover:text-foreground">
          ← מדריכים
        </Link>
        <h1 className="text-xl font-bold">מדריך חדש</h1>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <InstructorForm onSave={createInstructor} />
      </div>
    </div>
  )
}
