# Design Document - Header Enhancements

## Overview

This design adds three essential features to the SAR Educational Complex header: Global Search, Contact/Support, and Academic Calendar. These features improve navigation, user support, and awareness of school events.

## Architecture

### Component Structure

```
components/
├── header/
│   ├── search-modal.tsx           # Global search
│   ├── search-results.tsx         # Search results display
│   ├── support-modal.tsx          # Contact & support
│   ├── calendar-modal.tsx         # Academic calendar
│   └── calendar-event.tsx         # Event details
├── layout/
│   └── header.tsx                 # Updated with new icons
└── ui/
    └── modal.tsx                  # Reusable modal component

lib/
├── search/
│   └── search-service.ts          # Search logic
├── support/
│   └── ticket-service.ts          # Support tickets
└── calendar/
    ├── calendar-service.ts        # Calendar logic
    └── ghana-holidays.ts          # Ghana school holidays
```

## 1. Global Search

### Search Modal Design

```
┌────────────────────────────────────────┐
│  🔍 Search...          Ctrl+K    [×]   │
├────────────────────────────────────────┤
│                                        │
│  👨‍🎓 Students (3)                      │
│  • Kwame Asante - Form 1A              │
│  • Ama Boateng - Form 2B               │
│  • Kofi Mensah - Form 3C               │
│                                        │
│  👨‍🏫 Teachers (2)                      │
│  • Mr. Adjei - Mathematics             │
│  • Mrs. Owusu - English                │
│                                        │
│  🏫 Classes (1)                        │
│  • Form 1A - Room 101                  │
│                                        │
└────────────────────────────────────────┘
```

### Search Features

- **Keyboard Shortcut**: Ctrl+K (Cmd+K on Mac)
- **Keyboard Navigation**: Arrow keys, Enter, Escape
- **Recent Searches**: Last 5 searches
- **Role-Based**: Filters results by user role
- **Categories**: Students, Teachers, Classes, Announcements, Documents

### Search Service

```typescript
interface SearchResult {
  id: string
  type: 'student' | 'teacher' | 'class' | 'announcement' | 'document'
  title: string
  subtitle: string
  url: string
  icon: string
}

class SearchService {
  search(query: string, userRole: string): SearchResult[]
  getRecentSearches(userId: string): string[]
  saveSearch(userId: string, query: string): void
}
```

## 2. Contact & Support

### Support Modal Design

```
┌────────────────────────────────────────┐
│  💬 Help & Support              [×]    │
├────────────────────────────────────────┤
│                                        │
│  📞 Contact Information                │
│  Phone: +233 XX XXX XXXX               │
│  Email: info@saredu.com                │
│  Address: Box 130, Sepe Sote, Kumasi  │
│  Office Hours: Mon-Fri, 8AM-5PM        │
│                                        │
│  ❓ Frequently Asked Questions         │
│  ▼ How do I reset my password?        │
│  ▼ How do I view my grades?           │
│  ▼ How do I contact my teacher?       │
│                                        │
│  🎫 Submit Support Ticket              │
│  [Submit Ticket Button]                │
│                                        │
│  📚 Quick Links                        │
│  • User Guide                          │
│  • Video Tutorials                     │
│  • System Status                       │
│                                        │
└────────────────────────────────────────┘
```

### Support Features

- **Contact Info**: Phone, email, address, hours
- **FAQ Accordion**: Common questions with answers
- **Support Tickets**: Submit and track issues
- **Quick Links**: Guides and tutorials
- **SAR Branding**: Red/yellow colors

### Support Ticket Form

```
┌────────────────────────────────────────┐
│  Submit Support Ticket          [×]    │
├────────────────────────────────────────┤
│                                        │
│  Category: [Dropdown]                  │
│  • Technical Issue                     │
│  • Account Problem                     │
│  • General Question                    │
│                                        │
│  Priority: [Dropdown]                  │
│  • Low                                 │
│  • Medium                              │
│  • High                                │
│                                        │
│  Description:                          │
│  [Text Area]                           │
│                                        │
│  [Cancel]  [Submit Ticket]             │
│                                        │
└────────────────────────────────────────┘
```

## 3. Academic Calendar

### Calendar Modal Design

```
┌────────────────────────────────────────┐
│  📅 Academic Calendar           [×]    │
│  ◀ January 2025 ▶                      │
├────────────────────────────────────────┤
│  Sun Mon Tue Wed Thu Fri Sat           │
│              1   2   3   4             │
│   5   6   7   8   9  10  11            │
│  12  13  14 [15] 16  17  18            │
│  19  20  21  22  23  24  25            │
│  26  27  28  29  30  31                │
│                                        │
│  🔴 Exams  🟡 Holidays  🔵 Events      │
│                                        │
│  Upcoming Events:                      │
│  • Jan 15 - Mid-term Exams Begin       │
│  • Jan 20 - Parent-Teacher Meeting     │
│  • Feb 1 - Term Break                  │
│                                        │
└────────────────────────────────────────┘
```

### Calendar Features

- **Month View**: Navigate between months
- **Color Coding**: 
  - 🔴 Red: Exams
  - 🟡 Yellow: Holidays
  - 🔵 Blue: School Events
  - 🟢 Green: Personal Reminders
- **Event Details**: Click date to see details
- **Ghana Holidays**: Pre-loaded with GES holidays
- **Admin Controls**: Add/edit/delete events (admin only)
- **Personal Reminders**: Students/parents can add reminders

### Ghana School Calendar 2025

```typescript
const ghanaHolidays2025 = [
  { date: '2025-01-01', name: 'New Year\'s Day', type: 'holiday' },
  { date: '2025-03-06', name: 'Independence Day', type: 'holiday' },
  { date: '2025-04-18', name: 'Good Friday', type: 'holiday' },
  { date: '2025-04-21', name: 'Easter Monday', type: 'holiday' },
  { date: '2025-05-01', name: 'Workers\' Day', type: 'holiday' },
  { date: '2025-08-04', name: 'Founders\' Day', type: 'holiday' },
  { date: '2025-12-25', name: 'Christmas Day', type: 'holiday' },
  { date: '2025-12-26', name: 'Boxing Day', type: 'holiday' },
]

const termDates2025 = [
  { start: '2025-01-08', end: '2025-04-04', name: 'Term 1' },
  { start: '2025-05-05', end: '2025-08-01', name: 'Term 2' },
  { start: '2025-09-08', end: '2025-12-12', name: 'Term 3' },
]
```

## Header Layout

### Updated Header Design

```
┌──────────────────────────────────────────────────────────┐
│  Welcome back, Administrator                             │
│  Admin Dashboard                                         │
│                                                          │
│                    🔍 📅 💬 🔔 ⚙️ 🚪 👤              │
│                   Search Calendar Help Bell Settings Logout User │
└──────────────────────────────────────────────────────────┘
```

### Icon Order (Left to Right)

1. **🔍 Search** - Global search (Ctrl+K)
2. **📅 Calendar** - Academic calendar
3. **💬 Help** - Contact & support
4. **🔔 Bell** - Notifications (with badge)
5. **⚙️ Settings** - User settings
6. **🚪 Logout** - Sign out
7. **👤 User** - User avatar

## Data Models

### Search Data

```typescript
interface SearchIndex {
  students: Array<{
    id: string
    name: string
    class: string
    email: string
  }>
  teachers: Array<{
    id: string
    name: string
    subject: string
    email: string
  }>
  classes: Array<{
    id: string
    name: string
    room: string
    teacher: string
  }>
}
```

### Calendar Event

```typescript
interface CalendarEvent {
  id: string
  title: string
  description: string
  date: string // YYYY-MM-DD
  type: 'exam' | 'holiday' | 'event' | 'reminder'
  color: string
  visibility: 'all' | 'admin' | 'teacher' | 'student' | 'parent'
  createdBy: string
}
```

### Support Ticket

```typescript
interface SupportTicket {
  id: string
  ticketNumber: string
  userId: string
  category: 'technical' | 'account' | 'general'
  priority: 'low' | 'medium' | 'high'
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  createdAt: number
  updatedAt: number
}
```

## Color Palette

### Search
- **Background**: White
- **Hover**: Gray-100
- **Selected**: Red-50 (SAR)
- **Text**: Gray-800

### Support
- **Primary**: Red #E31E24 (SAR)
- **Secondary**: Yellow #FFD100 (SAR)
- **Success**: Green #10B981
- **Info**: Blue #3B82F6

### Calendar
- **Exams**: Red #E31E24
- **Holidays**: Yellow #FFD100
- **Events**: Blue #3B82F6
- **Reminders**: Green #10B981
- **Today**: Red border

## Animations

### Modal Animations

```css
@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

Duration: 200ms
Easing: ease-out
```

### Search Results

```css
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

Duration: 150ms
Easing: ease-out
```

## Implementation Priority

1. **Search** (High) - Most frequently used
2. **Calendar** (High) - Important for planning
3. **Support** (Medium) - Needed but less frequent

---

**Status:** Ready for Implementation
**Priority:** High
**Estimated Effort:** 4-5 days
