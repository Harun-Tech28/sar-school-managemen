export interface Payment {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  payment_reference: string;
  payment_gateway: string;
  status: string;
  receipt_url: string | null;
  term: {
    term_name: string;
    academic_year: {
      year_name: string;
    };
  } | null;
}

export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  student_id: string;
  class_id: string;
}

export interface Class {
  id: string;
  name: string;
  grade_level: number;
  academic_year_id: string;
}

export interface Term {
  id: string;
  term_name: string;
  start_date: string;
  end_date: string;
  academic_year_id: string;
}

export interface AcademicYear {
  id: string;
  year_name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}