export interface Course {
  id: string;
  name: string;
  credits: number;
  grade: string;
  gradePoint: number;
}

export interface Semester {
  id: string;
  name: string;
  courses: Course[];
}

export type GPAStructure = '4.0' | '5.0';

export interface GPAData {
  semesters: Semester[];
  structure: GPAStructure;
  lastUpdated: string;
  studentName?: string;
  department?: string;
  level?: string;
  school?: string;
}

export const GRADE_SCALE_4: Record<string, number> = {
  'A': 4.0,
  'A-': 3.7,
  'B+': 3.3,
  'B': 3.0,
  'B-': 2.7,
  'C+': 2.3,
  'C': 2.0,
  'C-': 1.7,
  'D+': 1.3,
  'D': 1.0,
  'F': 0.0
};

export const GRADE_SCALE_5: Record<string, number> = {
  'A': 5.0,
  'B': 4.0,
  'C': 3.0,
  'D': 2.0,
  'E': 1.0,
  'F': 0.0
};

export function getGradeOptions(structure: GPAStructure) {
  return structure === '4.0' ? Object.keys(GRADE_SCALE_4) : Object.keys(GRADE_SCALE_5);
}

export function getAcademicStanding(cgpa: number, structure: GPAStructure): string {
  const gpa = Number(cgpa);
  if (structure === '5.0') {
    if (gpa >= 4.50) return 'FIRST CLASS';
    if (gpa >= 3.50) return 'SECOND CLASS UPPER';
    if (gpa >= 2.40) return 'SECOND CLASS LOWER';
    if (gpa >= 1.50) return 'THIRD CLASS';
    if (gpa >= 1.00) return 'PASS';
    return 'FAIL';
  } else {
    if (gpa >= 3.70) return 'FIRST CLASS';
    if (gpa >= 3.30) return 'SECOND CLASS UPPER';
    if (gpa >= 3.00) return 'SECOND CLASS LOWER';
    if (gpa >= 2.00) return 'PASS';
    return 'BELOW AVERAGE';
  }
}

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "firstClass" | "secondUpper" | "secondLower" | "thirdClass" | "gradeA" | "gradeB" | "gradeC" | "gradeD" | "gradeF";

export function getGradeVariant(grade: string): BadgeVariant {
  const g = grade.toUpperCase();
  if (g.startsWith('A')) return 'gradeA';
  if (g.startsWith('B')) return 'gradeB';
  if (g.startsWith('C')) return 'gradeC';
  if (g.startsWith('D')) return 'gradeD';
  if (g === 'E') return 'secondary';
  if (g === 'F') return 'gradeF';
  return 'default';
}

export function getStandingVariant(standing: string): BadgeVariant {
  const s = standing.toUpperCase();
  if (s === 'FIRST CLASS') return 'firstClass';
  if (s === 'SECOND CLASS UPPER') return 'secondUpper';
  if (s === 'SECOND CLASS LOWER') return 'secondLower';
  if (s === 'THIRD CLASS') return 'thirdClass';
  if (s === 'FAIL' || s === 'BELOW AVERAGE') return 'destructive';
  return 'default';
}
