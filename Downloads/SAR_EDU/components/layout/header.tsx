"use client"

import { User, Settings, LogOut, Search, X } from "lucide-react"
import { useState } from "react"
import { NotificationBell } from "@/components/notifications/notification-bell"

interface HeaderProps {
  userName: string
  userRole: string
  userId: string
}

export function Header({ userName, userRole, userId }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    // Get all users from localStorage
    const usersJson = localStorage.getItem("users")
    if (!usersJson) {
      setSearchResults([])
      return
    }

    const users = JSON.parse(usersJson)
    const lowerQuery = query.toLowerCase()

    // Filter users based on search query
    const results = users.filter((user: any) => 
      user.name?.toLowerCase().includes(lowerQuery) ||
      user.email?.toLowerCase().includes(lowerQuery) ||
      user.role?.toLowerCase().includes(lowerQuery) ||
      user.id?.toLowerCase().includes(lowerQuery)
    )

    setSearchResults(results)
  }

  return (
    <>
      <header className="bg-card border-b border-border h-16 flex items-center justify-between px-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground capitalize">Welcome back, {userName}</h2>
          <p className="text-sm text-muted-foreground capitalize">{userRole} Dashboard</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Search Button - Prominent and visible */}
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#E31E24] to-[#FFD100] hover:from-[#c91a1f] hover:to-[#e6bc00] text-white rounded-lg transition-all shadow-md hover:shadow-lg"
            title="Search users"
          >
            <Search size={18} />
            <span className="font-medium">Search</span>
          </button>

          <NotificationBell userId={userId} userRole={userRole} />
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Settings size={20} className="text-muted-foreground" />
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("user")
              window.location.href = "/"
            }}
            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut size={20} className="text-destructive" />
          </button>
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <User size={20} className="text-primary-foreground" />
          </div>
        </div>
      </header>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
            {/* Search Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#E31E24] to-[#FFD100] rounded-xl flex items-center justify-center shadow-lg">
                  <Search size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800">Search Users</h3>
                  <p className="text-sm text-gray-600">Find students, teachers, parents, or admins</p>
                </div>
                <button
                  onClick={() => {
                    setIsSearchOpen(false)
                    setSearchQuery("")
                    setSearchResults([])
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} className="text-gray-600" />
                </button>
              </div>

              {/* Search Input */}
              <div className="relative">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search by name, email, role, or ID..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#E31E24] focus:outline-none transition-all text-gray-800 placeholder:text-gray-400"
                  autoFocus
                />
              </div>
            </div>

            {/* Search Results */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-200px)]">
              {searchQuery.trim() === "" ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search size={32} className="text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">Start typing to search</p>
                  <p className="text-sm text-gray-500 mt-2">Search for students, teachers, parents, or admins</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search size={32} className="text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">No results found</p>
                  <p className="text-sm text-gray-500 mt-2">Try searching with different keywords</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-4">Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}</p>
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer border border-gray-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg ${
                          user.role === 'admin' ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                          user.role === 'teacher' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                          user.role === 'student' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                          'bg-gradient-to-br from-orange-500 to-orange-600'
                        }`}>
                          {user.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{user.name}</h4>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                            user.role === 'teacher' ? 'bg-blue-100 text-blue-700' :
                            user.role === 'student' ? 'bg-green-100 text-green-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                          </span>
                        </div>
                      </div>
                      {user.id && (
                        <p className="text-xs text-gray-500 mt-2 ml-16">ID: {user.id}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
