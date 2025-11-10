// User storage utility for managing all registered users
export interface User {
  id: string
  email: string
  role: "admin" | "teacher" | "student" | "parent"
  fullName: string
  createdAt: number
  lastLogin: number
  sessionExpiry: number
}

export interface Class {
  id: string
  name: string
  teacherId: string
  studentIds: string[]
  subject?: string
}

// Get all users from localStorage
export function getAllUsers(): User[] {
  if (typeof window === "undefined") return []
  
  const usersData = localStorage.getItem("allUsers")
  if (!usersData) return []
  
  try {
    return JSON.parse(usersData)
  } catch {
    return []
  }
}

// Save all users to localStorage
export function saveAllUsers(users: User[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem("allUsers", JSON.stringify(users))
}

// Add a new user to the system
export function addUser(user: User): void {
  const users = getAllUsers()
  const existingIndex = users.findIndex(u => u.email === user.email)
  
  if (existingIndex >= 0) {
    // Update existing user
    users[existingIndex] = user
  } else {
    // Add new user
    users.push(user)
  }
  
  saveAllUsers(users)
}

// Get users by role
export function getUsersByRole(role: User["role"]): User[] {
  return getAllUsers().filter(user => user.role === role)
}

// Get user counts by role
export function getUserCounts() {
  const users = getAllUsers()
  
  return {
    students: users.filter(u => u.role === "student").length,
    teachers: users.filter(u => u.role === "teacher").length,
    parents: users.filter(u => u.role === "parent").length,
    admins: users.filter(u => u.role === "admin").length,
    total: users.length
  }
}

// Get all classes
export function getAllClasses(): Class[] {
  if (typeof window === "undefined") return []
  
  const classesData = localStorage.getItem("allClasses")
  if (!classesData) return []
  
  try {
    return JSON.parse(classesData)
  } catch {
    return []
  }
}

// Save all classes
export function saveAllClasses(classes: Class[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem("allClasses", JSON.stringify(classes))
}

// Initialize with some demo data if empty
export function initializeDemoData(): void {
  const users = getAllUsers()
  
  if (users.length === 0) {
    // Create demo users
    const demoUsers: User[] = [
      // Students
      {
        id: "s1",
        email: "abdul.ibrahim@student.sar.edu",
        role: "student",
        fullName: "Abdul-Rahman Ibrahim",
        createdAt: Date.now() - 86400000 * 30,
        lastLogin: Date.now() - 3600000,
        sessionExpiry: Date.now() + 86400000
      },
      {
        id: "s2",
        email: "fatima.yusuf@student.sar.edu",
        role: "student",
        fullName: "Fatima Yusuf",
        createdAt: Date.now() - 86400000 * 25,
        lastLogin: Date.now() - 7200000,
        sessionExpiry: Date.now() + 86400000
      },
      {
        id: "s3",
        email: "muhammad.hassan@student.sar.edu",
        role: "student",
        fullName: "Muhammad Hassan",
        createdAt: Date.now() - 86400000 * 20,
        lastLogin: Date.now() - 10800000,
        sessionExpiry: Date.now() + 86400000
      },
      {
        id: "s4",
        email: "abena.osei@student.sar.edu",
        role: "student",
        fullName: "Abena Osei",
        createdAt: Date.now() - 86400000 * 15,
        lastLogin: Date.now() - 14400000,
        sessionExpiry: Date.now() + 86400000
      },
      // Teachers
      {
        id: "t1",
        email: "mr.adjei@teacher.sar.edu",
        role: "teacher",
        fullName: "Mr. Kwabena Adjei",
        createdAt: Date.now() - 86400000 * 60,
        lastLogin: Date.now() - 1800000,
        sessionExpiry: Date.now() + 86400000
      },
      {
        id: "t2",
        email: "mrs.owusu@teacher.sar.edu",
        role: "teacher",
        fullName: "Mrs. Akosua Owusu",
        createdAt: Date.now() - 86400000 * 55,
        lastLogin: Date.now() - 3600000,
        sessionExpiry: Date.now() + 86400000
      },
      // Parents
      {
        id: "p1",
        email: "parent.asante@parent.sar.edu",
        role: "parent",
        fullName: "Mr. Yaw Asante",
        createdAt: Date.now() - 86400000 * 30,
        lastLogin: Date.now() - 7200000,
        sessionExpiry: Date.now() + 86400000
      },
      // Admin
      {
        id: "a1",
        email: "admin@sar.edu",
        role: "admin",
        fullName: "Administrator",
        createdAt: Date.now() - 86400000 * 90,
        lastLogin: Date.now() - 900000,
        sessionExpiry: Date.now() + 86400000
      }
    ]
    
    saveAllUsers(demoUsers)
    
    // Create demo classes
    const demoClasses: Class[] = [
      {
        id: "c1",
        name: "Form 1A",
        teacherId: "t1",
        studentIds: ["s1", "s2"],
        subject: "Mathematics"
      },
      {
        id: "c2",
        name: "Form 2B",
        teacherId: "t2",
        studentIds: ["s3", "s4"],
        subject: "English"
      }
    ]
    
    saveAllClasses(demoClasses)
  }
}
