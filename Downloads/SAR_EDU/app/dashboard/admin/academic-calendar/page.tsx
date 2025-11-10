"use client"

import { useState, useEffect } from "react"
import { Calendar, Plus, Edit, Trash2, Save, X } from "lucide-react"
import { 
  generateCalendarMonth, 
  getCalendarEvents, 
  addCalendarEvent, 
  updateCalendarEvent, 
  deleteCalendarEvent,
  initializeDefaultEvents 
} from "@/lib/calendar/calendar-service"
import { CalendarEvent, EventType, EventVisibility } from "@/lib/types/calendar"
import { termDates2025 } from "@/lib/calendar/ghana-holidays"

export default function AcademicCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [showEventForm, setShowEventForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    type: "event" as EventType,
    visibility: "all" as EventVisibility
  })

  // Academic year settings
  const [academicYear, setAcademicYear] = useState({
    startDate: "2025-01-08",
    endDate: "2025-12-12",
    term1Start: "2025-01-08",
    term1End: "2025-04-04",
    term2Start: "2025-05-05",
    term2End: "2025-08-01",
    term3Start: "2025-09-08",
    term3End: "2025-12-12"
  })

  useEffect(() => {
    initializeDefaultEvents()
    loadEvents()
  }, [])

  const loadEvents = () => {
    const allEvents = getCalendarEvents()
    setEvents(allEvents)
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const calendarData = generateCalendarMonth(year, month, "admin")

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1))
  }

  const handleDateClick = (dateString: string) => {
    setSelectedDate(dateString)
    setFormData({ ...formData, date: dateString })
    setShowEventForm(true)
    setEditingEvent(null)
  }

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      type: event.type,
      visibility: event.visibility
    })
    setShowEventForm(true)
  }

  const handleDeleteEvent = (eventId: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      deleteCalendarEvent(eventId)
      loadEvents()
    }
  }

  const handleSubmitEvent = (e: React.FormEvent) => {
    e.preventDefault()
    
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    
    if (editingEvent) {
      updateCalendarEvent(editingEvent.id, {
        ...formData,
        color: getColorForType(formData.type)
      })
    } else {
      addCalendarEvent({
        ...formData,
        color: getColorForType(formData.type),
        createdBy: user.id || "admin"
      })
    }
    
    loadEvents()
    setShowEventForm(false)
    setEditingEvent(null)
    setFormData({
      title: "",
      description: "",
      date: "",
      type: "event",
      visibility: "all"
    })
  }

  const getColorForType = (type: EventType): "red" | "yellow" | "blue" | "green" => {
    switch (type) {
      case "exam": return "red"
      case "holiday": return "yellow"
      case "event": return "blue"
      case "reminder": return "green"
      default: return "blue"
    }
  }

  const handleSaveAcademicYear = () => {
    localStorage.setItem("academic_year_settings", JSON.stringify(academicYear))
    alert("Academic year settings saved successfully!")
  }

  useEffect(() => {
    const saved = localStorage.getItem("academic_year_settings")
    if (saved) {
      setAcademicYear(JSON.parse(saved))
    }
  }, [])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Academic Calendar</h1>
          <p className="text-gray-600 mt-1">Manage school year, terms, and events</p>
        </div>
        <button
          onClick={() => {
            setShowEventForm(true)
            setEditingEvent(null)
            setFormData({
              title: "",
              description: "",
              date: new Date().toISOString().split('T')[0],
              type: "event",
              visibility: "all"
            })
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#E31E24] to-[#FFD100] text-white rounded-lg hover:shadow-lg transition-all"
        >
          <Plus size={20} />
          Add Event
        </button>
      </div>

      {/* Academic Year Settings */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-[#E31E24] to-[#FFD100] rounded-xl flex items-center justify-center">
            <Calendar size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Academic Year Settings</h2>
            <p className="text-sm text-gray-600">Set the beginning and end of the academic year and terms</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Academic Year */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">Academic Year 2025</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year Start Date</label>
              <input
                type="date"
                value={academicYear.startDate}
                onChange={(e) => setAcademicYear({ ...academicYear, startDate: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#E31E24] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year End Date</label>
              <input
                type="date"
                value={academicYear.endDate}
                onChange={(e) => setAcademicYear({ ...academicYear, endDate: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#E31E24] focus:outline-none"
              />
            </div>
          </div>

          {/* First Term */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">First Term</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={academicYear.term1Start}
                onChange={(e) => setAcademicYear({ ...academicYear, term1Start: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#E31E24] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={academicYear.term1End}
                onChange={(e) => setAcademicYear({ ...academicYear, term1End: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#E31E24] focus:outline-none"
              />
            </div>
          </div>

          {/* Second Term */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">Second Term</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={academicYear.term2Start}
                onChange={(e) => setAcademicYear({ ...academicYear, term2Start: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#E31E24] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={academicYear.term2End}
                onChange={(e) => setAcademicYear({ ...academicYear, term2End: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#E31E24] focus:outline-none"
              />
            </div>
          </div>

          {/* Third Term */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">Third Term</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={academicYear.term3Start}
                onChange={(e) => setAcademicYear({ ...academicYear, term3Start: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#E31E24] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={academicYear.term3End}
                onChange={(e) => setAcademicYear({ ...academicYear, term3End: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#E31E24] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSaveAcademicYear}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#E31E24] to-[#FFD100] text-white rounded-lg hover:shadow-lg transition-all font-semibold"
          >
            <Save size={20} />
            Save Academic Year Settings
          </button>
        </div>
      </div>

      {/* Calendar View */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {calendarData.monthName} {calendarData.year}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={goToPreviousMonth}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              ◀ Previous
            </button>
            <button
              onClick={goToNextMonth}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Next ▶
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="text-center font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarData.days.map((day, index) => (
            <div
              key={index}
              onClick={() => day.isCurrentMonth && handleDateClick(day.dateString)}
              className={`min-h-24 p-2 border rounded-lg cursor-pointer transition-all ${
                day.isCurrentMonth
                  ? day.isToday
                    ? "bg-[#E31E24]/10 border-[#E31E24] border-2"
                    : "bg-white hover:bg-gray-50 border-gray-200"
                  : "bg-gray-50 border-gray-100"
              }`}
            >
              <div className={`text-sm font-semibold mb-1 ${
                day.isCurrentMonth ? "text-gray-800" : "text-gray-400"
              }`}>
                {day.date.getDate()}
              </div>
              
              {day.hasEvents && (
                <div className="space-y-1">
                  {day.events.slice(0, 2).map(event => (
                    <div
                      key={event.id}
                      className={`text-xs px-2 py-1 rounded truncate ${
                        event.color === "red" ? "bg-red-100 text-red-700" :
                        event.color === "yellow" ? "bg-yellow-100 text-yellow-700" :
                        event.color === "blue" ? "bg-blue-100 text-blue-700" :
                        "bg-green-100 text-green-700"
                      }`}
                    >
                      {event.title}
                    </div>
                  ))}
                  {day.events.length > 2 && (
                    <div className="text-xs text-gray-500">+{day.events.length - 2} more</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-600">Exams</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-sm text-gray-600">Holidays</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-600">School Events</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600">Reminders</span>
          </div>
        </div>
      </div>

      {/* All Events List */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">All Events</h2>
        <div className="space-y-3">
          {events.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No events scheduled</p>
          ) : (
            events
              .sort((a, b) => a.date.localeCompare(b.date))
              .map(event => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      event.color === "red" ? "bg-red-500" :
                      event.color === "yellow" ? "bg-yellow-500" :
                      event.color === "blue" ? "bg-blue-500" :
                      "bg-green-500"
                    }`}></div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{event.title}</h3>
                      <p className="text-sm text-gray-600">{event.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(event.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric"
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditEvent(event)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Event Form Modal */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">
                  {editingEvent ? "Edit Event" : "Add New Event"}
                </h3>
                <button
                  onClick={() => {
                    setShowEventForm(false)
                    setEditingEvent(null)
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitEvent} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#E31E24] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#E31E24] focus:outline-none"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#E31E24] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as EventType })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#E31E24] focus:outline-none"
                >
                  <option value="event">School Event</option>
                  <option value="exam">Exam</option>
                  <option value="holiday">Holiday</option>
                  <option value="reminder">Reminder</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
                <select
                  value={formData.visibility}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value as EventVisibility })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#E31E24] focus:outline-none"
                >
                  <option value="all">All Users</option>
                  <option value="admin">Admin Only</option>
                  <option value="teacher">Teachers Only</option>
                  <option value="student">Students Only</option>
                  <option value="parent">Parents Only</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEventForm(false)
                    setEditingEvent(null)
                  }}
                  className="flex-1 px-4 py-2 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-[#E31E24] to-[#FFD100] text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                >
                  {editingEvent ? "Update Event" : "Add Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
