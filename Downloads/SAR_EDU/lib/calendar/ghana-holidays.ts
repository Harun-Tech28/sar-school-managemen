// Ghana Education Service holidays and term dates for 2025

import { Holiday, TermDate } from '../types/calendar'

export const ghanaHolidays2025: Holiday[] = [
  {
    date: '2025-01-01',
    name: "New Year's Day",
    type: 'holiday'
  },
  {
    date: '2025-03-06',
    name: 'Independence Day',
    type: 'holiday'
  },
  {
    date: '2025-04-18',
    name: 'Good Friday',
    type: 'holiday'
  },
  {
    date: '2025-04-21',
    name: 'Easter Monday',
    type: 'holiday'
  },
  {
    date: '2025-05-01',
    name: "Workers' Day",
    type: 'holiday'
  },
  {
    date: '2025-08-04',
    name: "Founders' Day",
    type: 'holiday'
  },
  {
    date: '2025-09-21',
    name: "Kwame Nkrumah Memorial Day",
    type: 'holiday'
  },
  {
    date: '2025-12-25',
    name: 'Christmas Day',
    type: 'holiday'
  },
  {
    date: '2025-12-26',
    name: 'Boxing Day',
    type: 'holiday'
  }
]

export const termDates2025: TermDate[] = [
  {
    start: '2025-01-08',
    end: '2025-04-04',
    name: 'First Term'
  },
  {
    start: '2025-05-05',
    end: '2025-08-01',
    name: 'Second Term'
  },
  {
    start: '2025-09-08',
    end: '2025-12-12',
    name: 'Third Term'
  }
]

// Get all holidays for a given year
export function getHolidaysForYear(year: number): Holiday[] {
  if (year === 2025) {
    return ghanaHolidays2025
  }
  // For other years, return empty array (can be extended later)
  return []
}

// Check if a date is a holiday
export function isHoliday(dateString: string): boolean {
  return ghanaHolidays2025.some(holiday => holiday.date === dateString)
}

// Get holiday name for a date
export function getHolidayName(dateString: string): string | null {
  const holiday = ghanaHolidays2025.find(h => h.date === dateString)
  return holiday ? holiday.name : null
}

// Get current term
export function getCurrentTerm(): TermDate | null {
  const today = new Date().toISOString().split('T')[0]
  
  for (const term of termDates2025) {
    if (today >= term.start && today <= term.end) {
      return term
    }
  }
  
  return null
}

// Check if date is within a term
export function isWithinTerm(dateString: string): boolean {
  for (const term of termDates2025) {
    if (dateString >= term.start && dateString <= term.end) {
      return true
    }
  }
  return false
}
