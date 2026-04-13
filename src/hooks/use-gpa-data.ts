"use client"

import { useState, useEffect } from 'react';
import { GPAData, Semester, Course, GRADE_SCALE_4, GRADE_SCALE_5, GPAStructure } from '@/types';

const STORAGE_KEY = 'gpa_wizard_data_v2';

export function useGPAData() {
  const [data, setData] = useState<GPAData>({ 
    semesters: [], 
    structure: '4.0',
    lastUpdated: new Date().toISOString(),
    studentName: '',
    department: '',
    level: '',
    school: ''
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved data", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, isLoaded]);

  const setStructure = (structure: GPAStructure) => {
    setData(prev => {
      const scale = structure === '4.0' ? GRADE_SCALE_4 : GRADE_SCALE_5;
      const updatedSemesters = prev.semesters.map(s => ({
        ...s,
        courses: s.courses.map(c => ({
          ...c,
          gradePoint: scale[c.grade] ?? 0
        }))
      }));

      return {
        ...prev,
        structure,
        semesters: updatedSemesters,
        lastUpdated: new Date().toISOString()
      };
    });
  };

  const updateStudentInfo = (info: Partial<Pick<GPAData, 'studentName' | 'department' | 'level' | 'school'>>) => {
    setData(prev => ({
      ...prev,
      ...info,
      lastUpdated: new Date().toISOString()
    }));
  };

  const addSemester = (name: string) => {
    const newSemester: Semester = {
      id: Math.random().toString(36).substring(7),
      name,
      courses: []
    };
    setData(prev => ({
      ...prev,
      semesters: [...prev.semesters, newSemester],
      lastUpdated: new Date().toISOString()
    }));
  };

  const removeSemester = (id: string) => {
    setData(prev => ({
      ...prev,
      semesters: prev.semesters.filter(s => s.id !== id),
      lastUpdated: new Date().toISOString()
    }));
  };

  const updateSemesterName = (id: string, name: string) => {
    setData(prev => ({
      ...prev,
      semesters: prev.semesters.map(s => s.id === id ? { ...s, name } : s),
      lastUpdated: new Date().toISOString()
    }));
  };

  const addCourse = (semesterId: string, course: Omit<Course, 'id' | 'gradePoint'>) => {
    const scale = data.structure === '4.0' ? GRADE_SCALE_4 : GRADE_SCALE_5;
    const newCourse: Course = {
      ...course,
      id: Math.random().toString(36).substring(7),
      gradePoint: scale[course.grade] || 0
    };
    setData(prev => ({
      ...prev,
      semesters: prev.semesters.map(s => 
        s.id === semesterId ? { ...s, courses: [...s.courses, newCourse] } : s
      ),
      lastUpdated: new Date().toISOString()
    }));
  };

  const removeCourse = (semesterId: string, courseId: string) => {
    setData(prev => ({
      ...prev,
      semesters: prev.semesters.map(s => 
        s.id === semesterId ? { ...s, courses: s.courses.filter(c => c.id !== courseId) } : s
      ),
      lastUpdated: new Date().toISOString()
    }));
  };

  const updateCourse = (semesterId: string, courseId: string, updatedCourse: Partial<Course>) => {
    const scale = data.structure === '4.0' ? GRADE_SCALE_4 : GRADE_SCALE_5;
    setData(prev => ({
      ...prev,
      semesters: prev.semesters.map(s => 
        s.id === semesterId ? {
          ...s,
          courses: s.courses.map(c => 
            c.id === courseId ? { 
              ...c, 
              ...updatedCourse, 
              gradePoint: updatedCourse.grade ? (scale[updatedCourse.grade] ?? c.gradePoint) : c.gradePoint 
            } : c
          )
        } : s
      ),
      lastUpdated: new Date().toISOString()
    }));
  };

  const importData = (importedData: GPAData) => {
    setData(importedData);
  };

  return {
    data,
    isLoaded,
    addSemester,
    removeSemester,
    updateSemesterName,
    addCourse,
    removeCourse,
    updateCourse,
    importData,
    setStructure,
    updateStudentInfo
  };
}
