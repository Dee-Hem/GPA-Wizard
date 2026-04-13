"use client"

import { GPAData, getAcademicStanding, getStandingVariant } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, GraduationCap, TrendingUp, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface GPASummaryProps {
  data: GPAData;
}

export function GPASummary({ data }: GPASummaryProps) {
  let totalWeightedPoints = 0;
  let totalCredits = 0;
  let totalCourses = 0;

  data.semesters.forEach(sem => {
    sem.courses.forEach(course => {
      totalWeightedPoints += (course.gradePoint * course.credits);
      totalCredits += course.credits;
      totalCourses++;
    });
  });

  const cgpaValue = totalCredits > 0 ? (totalWeightedPoints / totalCredits) : 0;
  const cgpa = cgpaValue.toFixed(2);
  const standing = getAcademicStanding(cgpaValue, data.structure);
  const standingVariant = getStandingVariant(standing);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-primary text-primary-foreground border-none shadow-lg overflow-hidden relative col-span-1 md:col-span-1">
        <div className="absolute right-0 top-0 p-4 opacity-10">
          <GraduationCap size={80} />
        </div>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Overall CGPA</span>
          </div>
          <div className="text-4xl font-black mb-1">{cgpa}</div>
          <p className="text-xs opacity-80">On a {data.structure} scale</p>
        </CardContent>
      </Card>

      {/* 1. Academic Standing Card */}
<Card className="border-none dark:border-solid dark:border-border shadow-sm bg-card dark:bg-slate-900/50 overflow-hidden relative col-span-1 md:col-span-1">
  <CardContent className="p-6">
    <div className="flex items-center gap-2 mb-2 text-primary dark:text-blue-400">
      <Award className="h-4 w-4" />
      <span className="text-xs font-bold uppercase tracking-wider">Academic Standing</span>
    </div>
    <div className="mt-2">
      <Badge variant={standingVariant} className="text-xs py-1 px-3 font-bold shadow-sm">
        {standing}
      </Badge>
    </div>
    <p className="text-xs text-muted-foreground mt-4">Current performance level</p>
  </CardContent>
</Card>

{/* 2. Progress Card */}
<Card className="border-none dark:border-solid dark:border-border shadow-sm bg-card dark:bg-slate-900/50 overflow-hidden relative">
  <CardContent className="p-6">
    <div className="flex items-center gap-2 mb-2 text-primary dark:text-blue-400">
      <BookOpen className="h-4 w-4" />
      <span className="text-xs font-bold uppercase tracking-wider">Progress</span>
    </div>
    <div className="text-3xl font-black text-foreground mb-1">{totalCredits}</div>
    <p className="text-xs text-muted-foreground">Total credits earned</p>
  </CardContent>
</Card>

<Card className="border-none dark:border-solid dark:border-border shadow-sm bg-card dark:bg-slate-900/50 overflow-hidden relative">
  <CardContent className="p-6">
    <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400">
      <TrendingUp className="h-4 w-4" />
      <span className="text-xs font-bold uppercase tracking-wider">Activity</span>
    </div>
    <div className="text-3xl font-black text-foreground mb-1">{data.semesters.length}</div>
    <p className="text-xs text-muted-foreground">{totalCourses} courses recorded</p>
  </CardContent>
</Card>
    </div>
  );
}
