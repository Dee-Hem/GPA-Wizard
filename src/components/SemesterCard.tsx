"use client"

import { useState } from 'react';
import { Semester, Course, GPAStructure, getGradeOptions, getGradeVariant } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus, Edit2, Check, X, GraduationCap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SemesterCardProps {
  semester: Semester;
  structure: GPAStructure;
  onUpdateName: (id: string, name: string) => void;
  onRemoveSemester: (id: string) => void;
  onAddCourse: (semesterId: string, course: Omit<Course, 'id' | 'gradePoint'>) => void;
  onRemoveCourse: (semesterId: string, courseId: string) => void;
  onUpdateCourse: (semesterId: string, courseId: string, updatedCourse: Partial<Course>) => void;
}

export function SemesterCard({ 
  semester, 
  structure,
  onUpdateName, 
  onRemoveSemester, 
  onAddCourse, 
  onRemoveCourse,
  onUpdateCourse
}: SemesterCardProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(semester.name);
  const gradeOptions = getGradeOptions(structure);
  const [newCourse, setNewCourse] = useState({ name: '', credits: 3, grade: gradeOptions[0] || 'A' });

  const totalCredits = semester.courses.reduce((sum, c) => sum + Number(c.credits), 0);
  const totalPoints = semester.courses.reduce((sum, c) => sum + (c.gradePoint * c.credits), 0);
  const semesterGPA = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";

  const handleAddCourse = () => {
    if (!newCourse.name) return;
    onAddCourse(semester.id, newCourse);
    setNewCourse({ name: '', credits: 3, grade: gradeOptions[0] || 'A' });
  };

  return (
    // 1. Changed Card to use bg-card and text-card-foreground
    <Card className="shadow-sm border-border bg-card text-card-foreground overflow-hidden">
      
      {/* 2. Changed Header to use bg-muted/50 and border-b */}
      <CardHeader className="bg-muted/50 border-b border-border flex flex-row items-center justify-between py-4">
        <div className="flex items-center gap-2">
          {isEditingName ? (
            <div className="flex items-center gap-1">
              <Input 
                value={tempName} 
                onChange={(e) => setTempName(e.target.value)} 
                className="h-8 w-40 bg-background border-input"
              />
              <Button size="icon" variant="ghost" onClick={() => { onUpdateName(semester.id, tempName); setIsEditingName(false); }}>
                <Check className="h-4 w-4 text-green-600" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => setIsEditingName(false)}>
                <X className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          ) : (
            <>
              <CardTitle className="text-lg font-bold text-primary">{semester.name}</CardTitle>
              <Button size="icon" variant="ghost" onClick={() => setIsEditingName(true)} className="h-8 w-8 opacity-50 hover:opacity-100 no-print">
                <Edit2 className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 px-3 py-1 rounded-full flex items-center gap-2">
            <span className="text-xs font-semibold text-primary uppercase">GPA</span>
            <span className="text-sm font-bold text-primary">{semesterGPA}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onRemoveSemester(semester.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10 no-print">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6 bg-card">
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-muted-foreground">Course Name</TableHead>
                <TableHead className="w-24 text-muted-foreground">Credits</TableHead>
                <TableHead className="w-32 text-muted-foreground">Grade</TableHead>
                <TableHead className="w-12 no-print"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {semester.courses.map(course => (
                <TableRow key={course.id} className="border-border hover:bg-muted/30">
                  <TableCell className="font-medium p-2">
                    <Input 
                      value={course.name} 
                      onChange={(e) => onUpdateCourse(semester.id, course.id, { name: e.target.value })}
                      className="border-transparent bg-transparent hover:border-input focus:bg-background h-8 text-foreground"
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Input 
                      type="number" 
                      value={course.credits} 
                      onChange={(e) => onUpdateCourse(semester.id, course.id, { credits: Number(e.target.value) })}
                      className="border-transparent bg-transparent hover:border-input focus:bg-background h-8 text-foreground"
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <div className="flex items-center gap-2">
                      <Select 
                        value={course.grade} 
                        onValueChange={(val) => onUpdateCourse(semester.id, course.id, { grade: val })}
                      >
                        <SelectTrigger className="h-8 border-transparent bg-transparent hover:border-input focus:ring-0 w-20 text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover text-popover-foreground">
                          {gradeOptions.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Badge variant={getGradeVariant(course.grade)} className="h-6 w-8 flex justify-center text-[10px] font-black">
                        {course.grade}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="p-2 no-print">
                    <Button variant="ghost" size="icon" onClick={() => onRemoveCourse(semester.id, course.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              
              {/* Add New Course Row: Changed to bg-muted/20 and text-foreground */}
              <TableRow className="bg-muted/20 border-t-2 border-primary/5 no-print">
                <TableCell className="p-2">
                  <Input 
                    placeholder="New Course" 
                    value={newCourse.name}
                    onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                    className="h-8 bg-background text-foreground border-input"
                  />
                </TableCell>
                <TableCell className="p-2">
                  <Input 
                    type="number" 
                    value={newCourse.credits}
                    onChange={(e) => setNewCourse({...newCourse, credits: Number(e.target.value)})}
                    className="h-8 bg-background text-foreground border-input"
                  />
                </TableCell>
                <TableCell className="p-2">
                  <Select 
                    value={newCourse.grade}
                    onValueChange={(val) => setNewCourse({...newCourse, grade: val})}
                  >
                    <SelectTrigger className="h-8 bg-background text-foreground border-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover text-popover-foreground">
                      {gradeOptions.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="p-2">
                  <Button size="icon" className="h-8 w-8 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleAddCourse}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* 3. Footer: Changed to bg-muted/30 */}
      <CardFooter className="bg-muted/30 border-t border-border py-3 flex justify-between">
        <div className="text-xs text-muted-foreground font-medium">
          Total Credits: {totalCredits}
        </div>
        <div className="flex items-center gap-1 text-primary">
          <GraduationCap className="h-4 w-4" />
          <span className="text-xs font-bold">Semester GPA: {semesterGPA}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
