"use client"

import React, { useState } from "react"
import { Search } from "lucide-react"

interface SearchWidgetProps {
  placeholder?: string
  onSearch?: (query: string) => void
}

export function SearchWidget({ placeholder = "Search students, teachers, classes...", onSearch }: SearchWidgetProps) {
  const [query, setQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSearch && query.trim()) {
      onSearch(query)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-[#E31E24] to-[#FFD100] rounded-xl flex items-center justify-center shadow-lg">
          <Search size={20} className="text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">Quick Search</h3>
          <p className="text-xs text-gray-600">Find anything quickly</p>
        </div>
      </div>
      
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#E31E24] focus:outline-none transition-all text-gray-800 placeholder:text-gray-400"
          />
        </div>
      </form>
      
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-xs text-gray-500">Quick filters:</span>
        <button className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold hover:bg-blue-100 transition-colors">
          👨‍🎓 Students
        </button>
        <button className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-semibold hover:bg-green-100 transition-colors">
          👨‍🏫 Teachers
        </button>
        <button className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-semibold hover:bg-purple-100 transition-colors">
          🏫 Classes
        </button>
      </div>
    </div>
  )
}
