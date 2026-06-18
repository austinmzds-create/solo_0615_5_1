import type { Schedule } from '../mock/schedules'

export interface ConflictCheckResult {
  hasConflict: boolean
  conflictSchedule?: Schedule
  message?: string
}

export function checkClassroomConflict(
  schedules: Schedule[],
  weekday: string,
  timeSlot: string,
  classroom: string,
  excludeId?: string | null
): ConflictCheckResult {
  const conflict = schedules.find((s) => {
    if (excludeId && s.id === excludeId) return false
    return s.weekday === weekday && s.timeSlot === timeSlot && s.classroom === classroom
  })

  if (conflict) {
    return {
      hasConflict: true,
      conflictSchedule: conflict,
      message: `教室「${conflict.classroom}」在${conflict.weekday}${conflict.timeSlot}已被「${conflict.courseName}」占用`
    }
  }

  return {
    hasConflict: false
  }
}
