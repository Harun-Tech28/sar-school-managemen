// Calendar service for managing events and calendar operations

import { CalendarEvent, CalendarDay, CalendarMonth, EventType, EventVisibility } from '../types/calendar'
import { ghanaHolidays2025, isHoliday, getHolidayName } from './ghana-holidays'

const STORAGE_KEY = 'calendar_events'

// Get all calendar events from localStorage
export function getCalendarEvents(): CalendarEvent[] {
  if (typeof window === 'undefined') return []
  
  const eventsJson = localStorage.getItem(STORAGE_KEY)
  if (!eventsJson) return []
  
  try {
    return JSON.parse(eventsJson)
  } catch {
    return []
  }
}

// Save calendar events to localStorage
export function saveCalendarEvents(events: CalendarEvent[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
}

// Add a new calendar event
export function addCalendarEvent(event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): CalendarEvent {
  const events = getCalendarEvents()
  
  const newEvent: CalendarEvent = {
    ...event,
    id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
  
  events.push(newEvent)
  saveCalendarEvents(events)
  
  return newEvent
}

// Update an existing calendar event
export function updateCalendarEvent(id: string, updates: Partial<CalendarEvent>): CalendarEvent | null {
  const events = getCalendarEvents()
  const index = events.findIndex(e => e.id === id)
  
  if (index === -1) return null
  
  events[index] = {
    ...events[index],
    ...updates,
    updatedAt: Date.now()
  }
  
  saveCalendarEvents(events)
  return events[index]
}

// Delete a calendar event
export function deleteCalendarEvent(id: string): boolean {
  const events = getCalendarEvents()
  const filteredEvents = events.filter(e => e.id !== id)
  
  if (filteredEvents.length === events.length) return false
  
  saveCalendarEvents(filteredEvents)
  return true
}

// Get events for a specific date
export function getEventsForDate(dateString: string, userRole?: string): CalendarEvent[] {
  const events = getCalendarEvents()
  
  return events.filter(event => {
    // Check date match
    if (event.date !== dateString) return false
    
    // Check visibility
    if (!userRole) return event.visibility === 'all'
    if (event.visibility === 'all') return true
    if (event.visibility === userRole) return true
    
    return false
  })
}

// Get events for a month
export function getEventsForMonth(year: number, month: number, userRole?: string): CalendarEvent[] {
  const events = getCalendarEvents()
  const monthStr = String(month + 1).padStart(2, '0')
  const yearMonthPrefix = `${year}-${monthStr}`
  
  return events.filter(event => {
    // Check if event is in this month
    if (!event.date.startsWith(yearMonthPrefix)) return false
    
    // Check visibility
    if (!userRole) return event.visibility === 'all'
    if (event.visibility === 'all') return true
    if (event.visibility === userRole) return true
    
    return false
  })
}

// Get upcoming events (next 30 days)
export function getUpcomingEvents(userRole?: string, days: number = 30): CalendarEvent[] {
  const events = getCalendarEvents()
  const today = new Date()
  const futureDate = new Date()
  futureDate.setDate(today.getDate() + days)
  
  const todayStr = today.toISOString().split('T')[0]
  const futureStr = futureDate.toISOString().split('T')[0]
  
  return events
    .filter(event => {
      // Check if event is in the future
      if (event.date < todayStr || event.date > futureStr) return false
      
      // Check visibility
      if (!userRole) return event.visibility === 'all'
      if (event.visibility === 'all') return true
      if (event.visibility === userRole) return true
      
      return false
    })
    .sort((a, b) => a.date.localeCompare(b.date))
}

// Generate calendar month data
export function generateCalendarMonth(year: number, month: number, userRole?: string): CalendarMonth {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  
  // Get day of week for first day (0 = Sunday)
  const firstDayOfWeek = firstDay.getDay()
  
  // Get events for this month
  const monthEvents = getEventsForMonth(year, month, userRole)
  
  const days: CalendarDay[] = []
  
  // Add days from previous month
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i
    const date = new Date(year, month - 1, day)
    const dateString = date.toISOString().split('T')[0]
    
    days.push({
      date,
      dateString,
      isCurrentMonth: false,
      isToday: false,
      events: [],
      hasEvents: false
    })
  }
  
  // Add days from current month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day)
    const dateString = date.toISOString().split('T')[0]
    const dayEvents = monthEvents.filter(e => e.date === dateString)
    
    // Add holiday events
    if (isHoliday(dateString)) {
      const holidayName = getHolidayName(dateString)
      if (holidayName) {
        dayEvents.push({
          id: `holiday_${dateString}`,
          title: holidayName,
          description: 'Public Holiday',
          date: dateString,
          type: 'holiday',
          color: 'yellow',
          visibility: 'all',
          createdBy: 'system',
          createdAt: 0,
          updatedAt: 0
        })
      }
    }
    
    days.push({
      date,
      dateString,
      isCurrentMonth: true,
      isToday: dateString === todayStr,
      events: dayEvents,
      hasEvents: dayEvents.length > 0
    })
  }
  
  // Add days from next month to complete the grid
  const remainingDays = 42 - days.length // 6 rows * 7 days
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day)
    const dateString = date.toISOString().split('T')[0]
    
    days.push({
      date,
      dateString,
      isCurrentMonth: false,
      isToday: false,
      events: [],
      hasEvents: false
    })
  }
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  return {
    year,
    month,
    monthName: monthNames[month],
    days
  }
}

// Initialize default calendar events
export function initializeDefaultEvents(): void {
  const events = getCalendarEvents()
  
  // Only initialize if no events exist
  if (events.length > 0) return
  
  const defaultEvents: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      title: 'First Term Begins',
      description: 'Start of the academic year - First Term',
      date: '2025-01-08',
      type: 'event',
      color: 'blue',
      visibility: 'all',
      createdBy: 'system'
    },
    {
      title: 'Mid-Term Exams',
      description: 'First Term Mid-Term Examinations',
      date: '2025-02-15',
      type: 'exam',
      color: 'red',
      visibility: 'all',
      createdBy: 'system'
    },
    {
      title: 'Parent-Teacher Meeting',
      description: 'First Term Parent-Teacher Conference',
      date: '2025-03-01',
      type: 'event',
      color: 'blue',
      visibility: 'all',
      createdBy: 'system'
    },
    {
      title: 'First Term Ends',
      description: 'End of First Term',
      date: '2025-04-04',
      type: 'event',
      color: 'blue',
      visibility: 'all',
      createdBy: 'system'
    },
    {
      title: 'Second Term Begins',
      description: 'Start of Second Term',
      date: '2025-05-05',
      type: 'event',
      color: 'blue',
      visibility: 'all',
      createdBy: 'system'
    },
    {
      title: 'Sports Day',
      description: 'Annual Inter-House Sports Competition',
      date: '2025-06-15',
      type: 'event',
      color: 'green',
      visibility: 'all',
      createdBy: 'system'
    },
    {
      title: 'Second Term Exams',
      description: 'Second Term Final Examinations',
      date: '2025-07-20',
      type: 'exam',
      color: 'red',
      visibility: 'all',
      createdBy: 'system'
    },
    {
      title: 'Second Term Ends',
      description: 'End of Second Term',
      date: '2025-08-01',
      type: 'event',
      color: 'blue',
      visibility: 'all',
      createdBy: 'system'
    },
    {
      title: 'Third Term Begins',
      description: 'Start of Third Term',
      date: '2025-09-08',
      type: 'event',
      color: 'blue',
      visibility: 'all',
      createdBy: 'system'
    },
    {
      title: 'Speech & Prize Giving Day',
      description: 'Annual Speech and Prize Giving Ceremony',
      date: '2025-11-20',
      type: 'event',
      color: 'green',
      visibility: 'all',
      createdBy: 'system'
    },
    {
      title: 'Final Exams Begin',
      description: 'Third Term Final Examinations',
      date: '2025-12-01',
      type: 'exam',
      color: 'red',
      visibility: 'all',
      createdBy: 'system'
    },
    {
      title: 'Third Term Ends',
      description: 'End of Academic Year',
      date: '2025-12-12',
      type: 'event',
      color: 'blue',
      visibility: 'all',
      createdBy: 'system'
    }
  ]
  
  defaultEvents.forEach(event => addCalendarEvent(event))
}
