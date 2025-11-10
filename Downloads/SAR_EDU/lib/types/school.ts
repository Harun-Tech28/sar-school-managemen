// TypeScript interfaces for Ghana school system data models
interface School {
  id: number
  name: string
  location: string
}

interface Teacher {
  id: number
  name: string
  subject: string
}

interface Student {
  id: number
  name: string
  grade: string
}

interface Class {
  id: number
  name: string
  teacherId: number
  studentIds: number[]
}

interface SchoolSystem {
  schools: School[]
  teachers: Teacher[]
  students: Student[]
  classes: Class[]
}

// Example usage
const schoolSystem: SchoolSystem = {
  schools: [
    { id: 1, name: "Ghana High", location: "Accra" },
    { id: 2, name: "Kwame Nkrumah", location: "Kumasi" },
  ],
  teachers: [
    { id: 1, name: "Mr. Doe", subject: "Mathematics" },
    { id: 2, name: "Mrs. Smith", subject: "Science" },
  ],
  students: [
    { id: 1, name: "John Doe", grade: "A" },
    { id: 2, name: "Jane Smith", grade: "B" },
  ],
  classes: [
    { id: 1, name: "Class 1", teacherId: 1, studentIds: [1, 2] },
    { id: 2, name: "Class 2", teacherId: 2, studentIds: [2] },
  ],
}
