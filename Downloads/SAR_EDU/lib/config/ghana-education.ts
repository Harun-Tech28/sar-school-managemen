// Ghana Education System Configuration
// Aligned with Ghana Education Service (GES) and National Council for Curriculum and Assessment (NaCCA)

interface CurriculumLevel {
  subjects: string[]
  duration: string
  ageRange: string
}

interface GradingSystem {
  scale: string
  grades: { grade: string; range: string; interpretation: string }[]
}

interface FeeStructure {
  tuition: number
  textbooks: number
  uniform: number
  pta: number
  currency: string
}

interface GhanaEducationConfig {
  curriculum: {
    primary: CurriculumLevel
    jhs: CurriculumLevel
    shs: CurriculumLevel
  }
  grading: {
    primary: GradingSystem
    jhs: GradingSystem
    shs: GradingSystem
  }
  fees: {
    primary: FeeStructure
    jhs: FeeStructure
    shs: FeeStructure
  }
}

const ghanaEducationConfig: GhanaEducationConfig = {
  curriculum: {
    primary: {
      subjects: [
        "English Language",
        "Mathematics",
        "Science",
        "Social Studies",
        "Ghanaian Language",
        "Religious and Moral Education",
        "Creative Arts",
        "Physical Education"
      ],
      duration: "6 years",
      ageRange: "6-11 years"
    },
    jhs: {
      subjects: [
        "English Language",
        "Mathematics",
        "Integrated Science",
        "Social Studies",
        "Ghanaian Language",
        "Religious and Moral Education",
        "ICT",
        "French",
        "Basic Design and Technology"
      ],
      duration: "3 years",
      ageRange: "12-14 years"
    },
    shs: {
      subjects: [
        "Core Mathematics",
        "English Language",
        "Integrated Science",
        "Social Studies",
        "Elective Subjects (varies by program)"
      ],
      duration: "3 years",
      ageRange: "15-17 years"
    }
  },
  grading: {
    primary: {
      scale: "A1 to F9",
      grades: [
        { grade: "A1", range: "80-100", interpretation: "Excellent" },
        { grade: "B2", range: "70-79", interpretation: "Very Good" },
        { grade: "B3", range: "65-69", interpretation: "Good" },
        { grade: "C4", range: "60-64", interpretation: "Credit" },
        { grade: "C5", range: "55-59", interpretation: "Credit" },
        { grade: "C6", range: "50-54", interpretation: "Credit" },
        { grade: "D7", range: "45-49", interpretation: "Pass" },
        { grade: "E8", range: "40-44", interpretation: "Pass" },
        { grade: "F9", range: "0-39", interpretation: "Fail" }
      ]
    },
    jhs: {
      scale: "A1 to F9",
      grades: [
        { grade: "A1", range: "80-100", interpretation: "Excellent" },
        { grade: "B2", range: "70-79", interpretation: "Very Good" },
        { grade: "B3", range: "65-69", interpretation: "Good" },
        { grade: "C4", range: "60-64", interpretation: "Credit" },
        { grade: "C5", range: "55-59", interpretation: "Credit" },
        { grade: "C6", range: "50-54", interpretation: "Credit" },
        { grade: "D7", range: "45-49", interpretation: "Pass" },
        { grade: "E8", range: "40-44", interpretation: "Pass" },
        { grade: "F9", range: "0-39", interpretation: "Fail" }
      ]
    },
    shs: {
      scale: "A1 to F9",
      grades: [
        { grade: "A1", range: "80-100", interpretation: "Excellent" },
        { grade: "B2", range: "70-79", interpretation: "Very Good" },
        { grade: "B3", range: "65-69", interpretation: "Good" },
        { grade: "C4", range: "60-64", interpretation: "Credit" },
        { grade: "C5", range: "55-59", interpretation: "Credit" },
        { grade: "C6", range: "50-54", interpretation: "Credit" },
        { grade: "D7", range: "45-49", interpretation: "Pass" },
        { grade: "E8", range: "40-44", interpretation: "Pass" },
        { grade: "F9", range: "0-39", interpretation: "Fail" }
      ]
    }
  },
  fees: {
    primary: {
      tuition: 0, // Free Compulsory Universal Basic Education (FCUBE)
      textbooks: 50,
      uniform: 100,
      pta: 20,
      currency: "GH₵"
    },
    jhs: {
      tuition: 0, // Free Compulsory Universal Basic Education (FCUBE)
      textbooks: 100,
      uniform: 150,
      pta: 30,
      currency: "GH₵"
    },
    shs: {
      tuition: 0, // Free SHS Policy
      textbooks: 200,
      uniform: 200,
      pta: 50,
      currency: "GH₵"
    }
  }
}

export default ghanaEducationConfig
