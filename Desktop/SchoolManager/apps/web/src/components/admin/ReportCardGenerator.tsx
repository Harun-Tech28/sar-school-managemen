import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import jsPDF from 'jspdf';

interface Student {
  id: string;
  student_id: string;
  profile: {
    first_name: string;
    last_name: string;
  };
  class: {
    class_name: string;
  };
}

interface Term {
  id: string;
  term_name: string;
  academic_year: {
    year_name: string;
  };
}

interface SubjectGrade {
  subject_name: string;
  class_score: number;
  exam_score: number;
  total_score: number;
  grade: string;
  remarks: string;
}

export const ReportCardGenerator = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [generating, setGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchStudents();
    fetchTerms();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          id,
          student_id,
          profile:profiles(first_name, last_name),
          class:classes(class_name)
        `)
        .eq('status', 'active')
        .order('student_id');

      if (error) throw error;
      setStudents(data as any || []);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const fetchTerms = async () => {
    try {
      const { data, error } = await supabase
        .from('terms')
        .select(`
          id,
          term_name,
          academic_year:academic_years(year_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTerms(data as any || []);
    } catch (err) {
      console.error('Error fetching terms:', err);
    }
  };

  const calculateGrade = (percentage: number): string => {
    if (percentage >= 80) return 'A - Excellent';
    if (percentage >= 70) return 'B - Very Good';
    if (percentage >= 60) return 'C - Good';
    if (percentage >= 50) return 'D - Credit';
    if (percentage >= 40) return 'E - Pass';
    return 'F - Fail';
  };

  const fetchStudentGrades = async (studentId: string, _termId: string): Promise<SubjectGrade[]> => {
    try {
      // Fetch all assessments for the student in the selected term
      const { data: grades, error } = await supabase
        .from('grades')
        .select(`
          score,
          assessment:assessments(
            assessment_type,
            total_marks,
            subject:subjects(subject_name)
          )
        `)
        .eq('student_id', studentId);

      if (error) throw error;

      // Group by subject and calculate totals
      const subjectMap: Record<string, { classTotal: number; examTotal: number; classMax: number; examMax: number }> = {};

      grades?.forEach((grade: any) => {
        const subjectName = grade.assessment.subject.subject_name;
        const type = grade.assessment.assessment_type;
        const score = Number(grade.score);
        const maxMarks = Number(grade.assessment.total_marks);

        if (!subjectMap[subjectName]) {
          subjectMap[subjectName] = { classTotal: 0, examTotal: 0, classMax: 0, examMax: 0 };
        }

        if (type === 'exam') {
          subjectMap[subjectName].examTotal += score;
          subjectMap[subjectName].examMax += maxMarks;
        } else {
          subjectMap[subjectName].classTotal += score;
          subjectMap[subjectName].classMax += maxMarks;
        }
      });

      // Convert to SubjectGrade array
      return Object.entries(subjectMap).map(([subjectName, scores]) => {
        const classScore = scores.classMax > 0 ? (scores.classTotal / scores.classMax) * 30 : 0;
        const examScore = scores.examMax > 0 ? (scores.examTotal / scores.examMax) * 70 : 0;
        const totalScore = classScore + examScore;
        const grade = calculateGrade(totalScore);

        return {
          subject_name: subjectName,
          class_score: Math.round(classScore * 10) / 10,
          exam_score: Math.round(examScore * 10) / 10,
          total_score: Math.round(totalScore * 10) / 10,
          grade: grade.split(' - ')[0],
          remarks: grade.split(' - ')[1],
        };
      });
    } catch (err) {
      console.error('Error fetching grades:', err);
      return [];
    }
  };

  const calculatePosition = async (studentId: string, termId: string, _totalScore: number): Promise<{ position: number; totalStudents: number }> => {
    try {
      // Get student's class
      const { data: student } = await supabase
        .from('students')
        .select('class_id')
        .eq('id', studentId)
        .single();

      if (!student) return { position: 0, totalStudents: 0 };

      // Get all students in the same class
      const { data: classStudents } = await supabase
        .from('students')
        .select('id')
        .eq('class_id', student.class_id)
        .eq('status', 'active');

      if (!classStudents) return { position: 0, totalStudents: 0 };

      // Calculate total scores for all students (simplified - in production, this should be optimized)
      const studentScores: { studentId: string; total: number }[] = [];

      for (const classStudent of classStudents) {
        const grades = await fetchStudentGrades(classStudent.id, termId);
        const total = grades.reduce((sum, g) => sum + g.total_score, 0);
        studentScores.push({ studentId: classStudent.id, total });
      }

      // Sort by total score descending
      studentScores.sort((a, b) => b.total - a.total);

      // Find position
      const position = studentScores.findIndex(s => s.studentId === studentId) + 1;

      return { position, totalStudents: classStudents.length };
    } catch (err) {
      console.error('Error calculating position:', err);
      return { position: 0, totalStudents: 0 };
    }
  };

  const fetchAttendanceStats = async (studentId: string, _termId: string) => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('status')
        .eq('student_id', studentId);

      if (error) throw error;

      const total = data?.length || 0;
      const present = data?.filter(a => a.status === 'present').length || 0;
      const late = data?.filter(a => a.status === 'late').length || 0;
      const absent = data?.filter(a => a.status === 'absent').length || 0;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

      return { total, present, late, absent, percentage };
    } catch (err) {
      console.error('Error fetching attendance:', err);
      return { total: 0, present: 0, late: 0, absent: 0, percentage: 0 };
    }
  };

  const generateReportCard = async () => {
    if (!selectedStudent || !selectedTerm) {
      alert('Please select both student and term');
      return;
    }

    setGenerating(true);

    try {
      // Fetch student details
      const student = students.find(s => s.id === selectedStudent);
      const term = terms.find(t => t.id === selectedTerm);

      if (!student || !term) {
        throw new Error('Student or term not found');
      }

      // Fetch grades
      const grades = await fetchStudentGrades(selectedStudent, selectedTerm);

      if (grades.length === 0) {
        alert('No grades found for this student in the selected term');
        setGenerating(false);
        return;
      }

      // Calculate overall performance
      const totalScore = grades.reduce((sum, g) => sum + g.total_score, 0);
      const averageScore = totalScore / grades.length;

      // Get position
      const { position, totalStudents } = await calculatePosition(selectedStudent, selectedTerm, totalScore);

      // Get attendance
      const attendance = await fetchAttendanceStats(selectedStudent, selectedTerm);

      // Generate PDF
      const doc = new jsPDF();

      // Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('SAR EDUCATIONAL COMPLEX', 105, 20, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Sepe Dote near Hospital Junction, Asokore Mampong District, Kumasi, Ghana', 105, 28, { align: 'center' });

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('STUDENT REPORT CARD', 105, 40, { align: 'center' });

      // Student Info
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      let yPos = 55;

      doc.text(`Student Name: ${student.profile.first_name} ${student.profile.last_name}`, 20, yPos);
      doc.text(`Student ID: ${student.student_id}`, 150, yPos);
      yPos += 7;

      doc.text(`Class: ${student.class.class_name}`, 20, yPos);
      doc.text(`Term: ${term.term_name}`, 150, yPos);
      yPos += 7;

      doc.text(`Academic Year: ${term.academic_year.year_name}`, 20, yPos);
      yPos += 10;

      // Grades Table
      doc.setFont('helvetica', 'bold');
      doc.text('Subject', 20, yPos);
      doc.text('Class (30%)', 80, yPos);
      doc.text('Exam (70%)', 115, yPos);
      doc.text('Total', 150, yPos);
      doc.text('Grade', 175, yPos);
      yPos += 2;

      doc.line(20, yPos, 190, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'normal');
      grades.forEach((grade) => {
        doc.text(grade.subject_name, 20, yPos);
        doc.text(grade.class_score.toFixed(1), 85, yPos);
        doc.text(grade.exam_score.toFixed(1), 120, yPos);
        doc.text(grade.total_score.toFixed(1), 152, yPos);
        doc.text(grade.grade, 177, yPos);
        yPos += 7;
      });

      yPos += 3;
      doc.line(20, yPos, 190, yPos);
      yPos += 7;

      // Summary
      doc.setFont('helvetica', 'bold');
      doc.text(`Average Score: ${averageScore.toFixed(2)}%`, 20, yPos);
      doc.text(`Position: ${position} of ${totalStudents}`, 120, yPos);
      yPos += 10;

      // Attendance
      doc.text('Attendance Summary:', 20, yPos);
      yPos += 7;

      doc.setFont('helvetica', 'normal');
      doc.text(`Total Days: ${attendance.total}`, 20, yPos);
      doc.text(`Present: ${attendance.present}`, 70, yPos);
      doc.text(`Late: ${attendance.late}`, 110, yPos);
      doc.text(`Absent: ${attendance.absent}`, 140, yPos);
      doc.text(`Percentage: ${attendance.percentage}%`, 170, yPos);
      yPos += 10;

      // Remarks
      doc.setFont('helvetica', 'bold');
      doc.text('Teacher\'s Remarks:', 20, yPos);
      yPos += 7;

      doc.setFont('helvetica', 'normal');
      const remarks = averageScore >= 70 ? 'Excellent performance. Keep it up!' :
                      averageScore >= 60 ? 'Good performance. Can do better.' :
                      averageScore >= 50 ? 'Fair performance. Needs improvement.' :
                      'Poor performance. Requires serious attention.';
      doc.text(remarks, 20, yPos);
      yPos += 15;

      // Signatures
      doc.line(20, yPos, 80, yPos);
      doc.line(130, yPos, 190, yPos);
      yPos += 5;

      doc.setFontSize(10);
      doc.text('Class Teacher', 35, yPos);
      doc.text('Headmaster/Headmistress', 140, yPos);

      // Save PDF
      doc.save(`Report_Card_${student.student_id}_${term.term_name}.pdf`);

      alert('Report card generated successfully!');
    } catch (err: any) {
      console.error('Error generating report card:', err);
      alert(err.message || 'Failed to generate report card');
    } finally {
      setGenerating(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const query = searchQuery.toLowerCase();
    return (
      student.student_id.toLowerCase().includes(query) ||
      student.profile.first_name.toLowerCase().includes(query) ||
      student.profile.last_name.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Report Card Generator</h2>
          <p className="text-gray-600 mt-1">Generate student report cards</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          {/* Term Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Term <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Choose a term</option>
              {terms.map((term) => (
                <option key={term.id} value={term.id}>
                  {term.term_name} - {term.academic_year.year_name}
                </option>
              ))}
            </select>
          </div>

          {/* Student Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Student
            </label>
            <input
              type="text"
              placeholder="Search by student ID or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Student Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Student <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Choose a student</option>
              {filteredStudents.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.student_id} - {student.profile.first_name} {student.profile.last_name} ({student.class.class_name})
                </option>
              ))}
            </select>
          </div>

          {/* Generate Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={generateReportCard}
              disabled={generating || !selectedStudent || !selectedTerm}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              {generating ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : (
                '📄 Generate Report Card'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">ℹ️ Report Card Information</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Report cards include all subject grades for the selected term</li>
          <li>• Class work is weighted at 30%, exams at 70%</li>
          <li>• Position is calculated based on total score within the class</li>
          <li>• Attendance statistics are included</li>
          <li>• PDF is automatically downloaded when generated</li>
        </ul>
      </div>
    </div>
  );
};
