// Calendar event types and interfaces

export type EventType = 'exam' | 'holiday' | 'event' | 'reminder'
export type EventVisibility = 'all' | 'admin' | 'teacher' | 'student' | 'parent'
export type EventColor = 'red' | 'yellow' | 'blue' | 'green'

export interface CalendarEvent {
  id: string
  title: string
  description: string
  date: string // YYYY-MM-DD format
  type: EventType
  color: EventColor
  visibility: EventVisibility
  createdBy: string
  createdAt: number
  updatedAt: number
}

export interface Holiday {
  date: string // YYYY-MM-DD format
  name: string
  type: 'holiday'
}

export interface TermDate {
  start: string // YYYY-MM-DD format
  end: string // YYYY-MM-DD format
  name: string
}

export interface CalendarDay {
  date: Date
  dateString: string // YYYY-MM-DD
  isCurrentMonth: boolean
  isToday: boolean
  events: CalendarEvent[]
  hasEvents: boolean
}

export interface CalendarMonth {
  year: number
  month: number // 0-11
  monthName: string
  days: CalendarDay[]
}
