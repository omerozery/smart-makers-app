'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { SHORTAGE_TYPE_LABELS, canClose, canCloseWithException, canCancel, isLessonEditable } from '@/lib/lesson-status'
import {
  SaveLessonSchema,
  CloseLessonWithExceptionSchema,
  CancelLessonSchema,
  AddShortageSchema,
  type SaveLessonData,
} from '@/lib/validations/lesson'
import {
  saveLesson,
  closeLesson,
  closeLessonWithException,
  cancelLesson,
  replaceInstructor,
  addShortage,
} from '@/app/(dashboard)/lessons/[id]/actions'
import type { LessonWithRelations, LessonStatus, Instructor, Model } from '@/lib/types'

interface Props {
  lesson: LessonWithRelations
  status: LessonStatus
  instructors: Instructor[]
  models: Model[]
}

const NULL_VALUE = '__null__'

export function LessonForm({ lesson, status, instructors, models }: Props) {
  const editable = isLessonEditable(status)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Dialog state
  const [exceptionOpen, setExceptionOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false)
  const [shortageOpen, setShortageOpen] = useState(false)
  const [replaceOpen, setReplaceOpen] = useState(false)

  const { register, handleSubmit, watch, setValue } = useForm<SaveLessonData>({
    resolver: zodResolver(SaveLessonSchema),
    defaultValues: {
      actual_instructor_id: lesson.actual_instructor_id,
      attendance_received: lesson.attendance_received,
      attendance_count: lesson.attendance_count,
      attendance_notes: lesson.attendance_notes,
      summary_received: lesson.summary_received,
      actual_model_id: lesson.actual_model_id,
      actual_model_other_text: lesson.actual_model_other_text,
      actual_lesson_number: lesson.actual_lesson_number,
      actual_stage_number: lesson.actual_stage_number,
      student_notes: lesson.student_notes,
      all_students_aligned: lesson.all_students_aligned ?? false,
      alignment_notes: lesson.alignment_notes,
      manager_notes: lesson.manager_notes,
    },
  })

  const attendanceReceived = watch('attendance_received')
  const summaryReceived = watch('summary_received')
  const allAligned = watch('all_students_aligned')

  // Exception dialog form
  const exceptionForm = useForm({
    resolver: zodResolver(CloseLessonWithExceptionSchema),
    defaultValues: { exception_reason: '' },
  })

  // Cancel dialog form
  const cancelForm = useForm({
    resolver: zodResolver(CancelLessonSchema),
    defaultValues: { cancelled_reason: '' },
  })

  // Shortage dialog form
  const shortageForm = useForm({
    resolver: zodResolver(AddShortageSchema),
    defaultValues: { shortage_type: 'school_materials' as const, shortage_description: '', due_date: '' },
  })

  // Replace instructor dialog
  const [selectedInstructor, setSelectedInstructor] = useState<string>(lesson.actual_instructor_id ?? '')

  async function onSave(data: SaveLessonData) {
    setSaving(true)
    setFeedback(null)
    const result = await saveLesson(lesson.id, data)
    setSaving(false)
    if ('error' in result) {
      setFeedback({ type: 'error', message: result.error })
    } else {
      setFeedback({ type: 'success', message: 'השינויים נשמרו בהצלחה' })
    }
  }

  async function onClose() {
    setCloseConfirmOpen(false)
    setSaving(true)
    const result = await closeLesson(lesson.id)
    setSaving(false)
    if ('error' in result) setFeedback({ type: 'error', message: result.error })
  }

  async function onCloseWithException(data: { exception_reason: string }) {
    setExceptionOpen(false)
    setSaving(true)
    const result = await closeLessonWithException(lesson.id, data.exception_reason)
    setSaving(false)
    if ('error' in result) setFeedback({ type: 'error', message: result.error })
  }

  async function onCancel(data: { cancelled_reason: string }) {
    setCancelOpen(false)
    setSaving(true)
    const result = await cancelLesson(lesson.id, data.cancelled_reason)
    setSaving(false)
    if ('error' in result) setFeedback({ type: 'error', message: result.error })
  }

  async function onReplaceInstructor() {
    if (!selectedInstructor) return
    setReplaceOpen(false)
    setSaving(true)
    const result = await replaceInstructor(lesson.id, selectedInstructor)
    setSaving(false)
    if ('error' in result) setFeedback({ type: 'error', message: result.error })
  }

  async function onAddShortage(data: { shortage_type: 'instructor_kit' | 'school_materials' | 'group_materials' | 'other'; shortage_description: string; due_date?: string | null }) {
    setShortageOpen(false)
    setSaving(true)
    const result = await addShortage(lesson.id, lesson.group_id, lesson.school_id, data)
    setSaving(false)
    if ('error' in result) setFeedback({ type: 'error', message: result.error })
    else shortageForm.reset()
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSave)} className="space-y-4">

        {/* Feedback */}
        {feedback && (
          <div className={`rounded-md px-4 py-3 text-sm ${feedback.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {feedback.message}
          </div>
        )}

        {/* Exception / Cancelled notice */}
        {status === 'Cancelled' && (
          <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            <strong>שיעור בוטל:</strong> {lesson.cancelled_reason}
          </div>
        )}
        {status === 'Completed With Exception' && lesson.exception_reason && (
          <div className="rounded-md bg-purple-50 border border-purple-200 px-4 py-3 text-sm text-purple-700">
            <strong>חריגה:</strong> {lesson.exception_reason}
          </div>
        )}

        {/* Area 1 — Lesson Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">פרטי השיעור</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div className="flex gap-2">
                <span className="text-muted-foreground shrink-0">בית ספר:</span>
                <span className="font-medium">{lesson.school.name}, {lesson.school.city}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground shrink-0">קבוצה:</span>
                <span className="font-medium">{lesson.group.name}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground shrink-0">מדריך מתוכנן:</span>
                <span className="font-medium">{lesson.planned_instructor?.full_name ?? '—'}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground shrink-0">מדריך בפועל:</span>
                <span className="font-medium">
                  {lesson.actual_instructor?.full_name ?? lesson.planned_instructor?.full_name ?? '—'}
                </span>
              </div>
              {lesson.planned_model && (
                <>
                  <div className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">מודל מתוכנן:</span>
                    <span className="font-medium">{lesson.planned_model.model_name}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">שיעור / שלב:</span>
                    <span className="font-medium">
                      {lesson.planned_lesson_number ?? '—'} / {lesson.planned_stage_number ?? '—'}
                    </span>
                  </div>
                </>
              )}
            </div>
            {editable && (
              <div className="mt-4">
                <Button type="button" variant="outline" size="sm" onClick={() => setReplaceOpen(true)}>
                  החלפת מדריך
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Area 2 — Attendance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">נוכחות</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Checkbox
                id="attendance_received"
                disabled={!editable}
                checked={attendanceReceived}
                onCheckedChange={(v) => setValue('attendance_received', !!v)}
              />
              <Label htmlFor="attendance_received" className="cursor-pointer">
                התקבלה נוכחות
              </Label>
            </div>
            {attendanceReceived && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="attendance_count">מספר משתתפים</Label>
                  <Input
                    id="attendance_count"
                    type="number"
                    min={0}
                    disabled={!editable}
                    {...register('attendance_count', {
                      setValueAs: (v) => (v === '' || v === undefined || v === null ? null : Number(v)),
                    })}
                    className="w-32"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="attendance_notes">הערות נוכחות</Label>
                  <Input
                    id="attendance_notes"
                    disabled={!editable}
                    {...register('attendance_notes')}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Area 3 — Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">סיכום שיעור</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Checkbox
                id="summary_received"
                disabled={!editable}
                checked={summaryReceived}
                onCheckedChange={(v) => setValue('summary_received', !!v)}
              />
              <Label htmlFor="summary_received" className="cursor-pointer">
                התקבל סיכום מהמדריך
              </Label>
            </div>

            {summaryReceived && (
              <div className="space-y-4 pt-2">
                <Separator />
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>מודל בפועל</Label>
                    <Select
                      disabled={!editable}
                      value={watch('actual_model_id') ?? NULL_VALUE}
                      onValueChange={(v) => setValue('actual_model_id', v === NULL_VALUE ? null : v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="בחר מודל" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NULL_VALUE}>— ללא —</SelectItem>
                        {models.map((m) => (
                          <SelectItem key={m.id} value={m.id}>{m.model_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="actual_lesson_number">שיעור בפועל</Label>
                    <Input
                      id="actual_lesson_number"
                      type="number"
                      min={1}
                      disabled={!editable}
                      {...register('actual_lesson_number', {
                        setValueAs: (v) => (v === '' || v === undefined || v === null ? null : Number(v)),
                      })}
                      className="w-24"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="actual_stage_number">שלב בפועל</Label>
                    <Input
                      id="actual_stage_number"
                      type="number"
                      min={1}
                      disabled={!editable}
                      {...register('actual_stage_number', {
                        setValueAs: (v) => (v === '' || v === undefined || v === null ? null : Number(v)),
                      })}
                      className="w-24"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox
                    id="all_students_aligned"
                    disabled={!editable}
                    checked={allAligned ?? false}
                    onCheckedChange={(v) => setValue('all_students_aligned', !!v)}
                  />
                  <Label htmlFor="all_students_aligned" className="cursor-pointer">
                    כל התלמידים מסונכרנים עם הסילבוס
                  </Label>
                </div>

                {allAligned === false && (
                  <div className="space-y-2">
                    <Label htmlFor="alignment_notes">הערות סנכרון</Label>
                    <Textarea
                      id="alignment_notes"
                      disabled={!editable}
                      {...register('alignment_notes')}
                      rows={2}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="student_notes">הערות על תלמידים</Label>
                  <Textarea
                    id="student_notes"
                    disabled={!editable}
                    {...register('student_notes')}
                    rows={2}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="manager_notes">הערות מנהל</Label>
              <Textarea
                id="manager_notes"
                disabled={!editable}
                {...register('manager_notes')}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Area 4 — Shortages */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">חוסרים</CardTitle>
            {editable && (
              <Button type="button" variant="outline" size="sm" onClick={() => setShortageOpen(true)}>
                + הוסף חוסר
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {lesson.shortages.filter((s) => s.status === 'open').length === 0 ? (
              <p className="text-sm text-muted-foreground">אין חוסרים פתוחים</p>
            ) : (
              <div className="space-y-2">
                {lesson.shortages
                  .filter((s) => s.status === 'open')
                  .map((s) => (
                    <div key={s.id} className="flex items-start gap-3 text-sm p-3 rounded-md bg-orange-50 border border-orange-100">
                      <span className="font-medium text-orange-700 shrink-0">
                        {SHORTAGE_TYPE_LABELS[s.shortage_type]}
                      </span>
                      <span className="text-gray-700">{s.shortage_description}</span>
                      {s.due_date && (
                        <span className="text-muted-foreground shrink-0 mr-auto">
                          עד {new Date(s.due_date).toLocaleDateString('he-IL')}
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Area 5 — Actions */}
        {editable && (
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={saving}>
                  {saving ? 'שומר...' : 'שמור שינויים'}
                </Button>

                {canClose(status) && (
                  <Button
                    type="button"
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                    disabled={saving}
                    onClick={() => setCloseConfirmOpen(true)}
                  >
                    סגור שיעור
                  </Button>
                )}

                {canCloseWithException(status) && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={saving}
                    onClick={() => setExceptionOpen(true)}
                  >
                    סגור עם חריגה
                  </Button>
                )}

                {canCancel(status) && (
                  <Button
                    type="button"
                    variant="outline"
                    className="text-destructive border-destructive hover:bg-destructive hover:text-white"
                    disabled={saving}
                    onClick={() => setCancelOpen(true)}
                  >
                    בטל שיעור
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </form>

      {/* Close Confirmation */}
      <AlertDialog open={closeConfirmOpen} onOpenChange={setCloseConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>סגירת שיעור</AlertDialogTitle>
            <AlertDialogDescription>
              האם לסגור את השיעור? לא ניתן לבטל פעולה זו.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={onClose}>סגור שיעור</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Close With Exception Dialog */}
      <Dialog open={exceptionOpen} onOpenChange={setExceptionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>סגירה עם חריגה</DialogTitle>
          </DialogHeader>
          <form onSubmit={exceptionForm.handleSubmit(onCloseWithException)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="exception_reason">סיבת החריגה *</Label>
              <Textarea
                id="exception_reason"
                {...exceptionForm.register('exception_reason')}
                rows={3}
                placeholder="פרט מה חסר או מדוע נסגר השיעור ללא כל הנתונים"
              />
              {exceptionForm.formState.errors.exception_reason && (
                <p className="text-sm text-destructive">{exceptionForm.formState.errors.exception_reason.message}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setExceptionOpen(false)}>ביטול</Button>
              <Button type="submit">סגור עם חריגה</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Cancel Lesson Dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ביטול שיעור</DialogTitle>
          </DialogHeader>
          <form onSubmit={cancelForm.handleSubmit(onCancel)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cancelled_reason">סיבת הביטול *</Label>
              <Textarea
                id="cancelled_reason"
                {...cancelForm.register('cancelled_reason')}
                rows={3}
                placeholder="פרט מדוע בוטל השיעור"
              />
              {cancelForm.formState.errors.cancelled_reason && (
                <p className="text-sm text-destructive">{cancelForm.formState.errors.cancelled_reason.message}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCancelOpen(false)}>חזרה</Button>
              <Button type="submit" variant="destructive">בטל שיעור</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Replace Instructor Dialog */}
      <Dialog open={replaceOpen} onOpenChange={setReplaceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>החלפת מדריך</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>מדריך בפועל</Label>
              <Select value={selectedInstructor} onValueChange={setSelectedInstructor}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר מדריך" />
                </SelectTrigger>
                <SelectContent>
                  {instructors.map((i) => (
                    <SelectItem key={i.id} value={i.id}>{i.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReplaceOpen(false)}>ביטול</Button>
              <Button onClick={onReplaceInstructor}>אשר החלפה</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Shortage Dialog */}
      <Dialog open={shortageOpen} onOpenChange={setShortageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>הוספת חוסר</DialogTitle>
          </DialogHeader>
          <form onSubmit={shortageForm.handleSubmit(onAddShortage)} className="space-y-4">
            <div className="space-y-2">
              <Label>סוג חוסר</Label>
              <Select
                value={shortageForm.watch('shortage_type')}
                onValueChange={(v) => shortageForm.setValue('shortage_type', v as 'instructor_kit' | 'school_materials' | 'group_materials' | 'other')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SHORTAGE_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="shortage_description">תיאור החוסר *</Label>
              <Textarea
                id="shortage_description"
                {...shortageForm.register('shortage_description')}
                rows={2}
              />
              {shortageForm.formState.errors.shortage_description && (
                <p className="text-sm text-destructive">{shortageForm.formState.errors.shortage_description.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_date">תאריך יעד (אופציונלי)</Label>
              <Input id="due_date" type="date" {...shortageForm.register('due_date')} dir="ltr" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShortageOpen(false)}>ביטול</Button>
              <Button type="submit">הוסף חוסר</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
