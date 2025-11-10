"use client"

import React, { useState } from "react"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"

interface CalendarEvent {
  date: number
  title: string
  type: "exam" | "holiday" | "event"
  color: string
}

export function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"]
  
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  
  // Sample events
  const events: CalendarEvent[] = [
    { date: 15, title: "Mid-term Exams", type: "exam", color: "bg-red-500" },
    { date: 20, title: "Parent Meeting", type: "event", color: "bg-blue-500" },
    { date: 25, title: "Sports Day", type: "event", color: "bg-green-500" },
  ]
  
  const getEventForDate = (day: number) => {
    return events.find(e => e.date === day)
  }
  
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }
  
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }
  
  const today = new Date()
  const isToday = (day: number) => {
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear()
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#E31E24] to-[#FFD100] rounded-xl flex items-center justify-center shadow-lg">
            <Calendar size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Academic Calendar</h3>
            <p className="text-xs text-gray-600">Upcoming events</p>
          </div>
        </div>
      </div>
      
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={previousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <h4 className="text-lg font-bold text-gray-800">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h4>
        <button 
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
          <div key={index} className="text-center text-xs font-bold text-gray-500 py-2">
            {day}
          </div>
        ))}
        
        {/* Empty cells for days before month starts */}
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square"></div>
        ))}
        
        {/* Days of month */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1
          const event = getEventForDate(day)
          const isTodayDate = isToday(day)
          
          return (
            <div
              key={day}
              className={`aspect-square flex items-center justify-center text-sm rounded-lg transition-all cursor-pointer
                ${isTodayDate ? 'bg-[#E31E24] text-white font-bold ring-2 ring-[#FFD100]' : 
                  event ? `${event.color} text-white font-semibold` : 
                  'hover:bg-gray-100 text-gray-700'}`}
              title={event?.title}
            >
              {day}
            </div>
          )
        })}
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-gray-600">Exams</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-gray-600">Events</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-gray-600">Activities</span>
        </div>
      </div>
      
      {/* Upcoming Events */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs font-semibold text-gray-700 mb-3">Upcoming Events:</p>
        <div className="space-y-2">
          {events.slice(0, 3).map((event, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div className={`w-2 h-2 ${event.color} rounded-full`}></div>
              <span className="text-gray-600">
                {monthNames[currentDate.getMonth()]} {event.date} - {event.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
