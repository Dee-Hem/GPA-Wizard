import React from 'react';
import Link from 'next/link';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from 'lucide-react';
import { ModeToggle } from '@/components/ModeToggle';
import { useGPAData } from '@/hooks/use-gpa-data';
import { SemesterCard } from '@/components/SemesterCard';
import { GPASummary } from '@/components/GPASummary';
import { StudentProfile } from '@/components/StudentProfile';
import { DataActions } from '@/components/DataActions';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { Plus, GraduationCap, Settings2, ShieldCheck } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GPAStructure, getAcademicStanding, getStandingVariant } from '@/types';
import { Badge } from '@/components/ui/badge';

// --- NATIVE & PDF IMPORTS ---
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function GPAWizard() {
  const { 
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
  } = useGPAData();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <GraduationCap className="h-12 w-12 text-primary mb-4" />
          <h1 className="text-xl font-bold text-primary">Loading GPA Wizard...</h1>
        </div>
      </div>
    );
  }

  // --- CALCULATION LOGIC ---
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

  // --- NATIVE PDF GENERATOR ---
  const handlePrintReport = async () => {
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString();

    // Define Theme Colors
    const colors = {
      primary: [40, 70, 150] as [number, number, number],
      excellent: [22, 163, 74], // Green
      good: [37, 99, 235],      // Blue
      warning: [217, 119, 6],   // Amber
      danger: [220, 38, 38],    // Red
      textMain: [30, 41, 59],
      textLight: [100, 116, 139]
    };

    // Helper for Grade Colors
    const getGradeColor = (grade: string): [number, number, number] => {
      const g = grade.toUpperCase();
      if (['A', 'A+', '5'].includes(g)) return colors.excellent as [number, number, number];
      if (['B', 'B+', '4'].includes(g)) return colors.good as [number, number, number];
      if (['C', '3'].includes(g)) return colors.warning as [number, number, number];
      return colors.danger as [number, number, number];
    };

    // 1. Header & Branding
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.text("ACADEMIC TRANSCRIPT", 105, 22, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
    doc.text(`Generated on: ${timestamp}`, 105, 28, { align: 'center' });

    // 2. High-Impact CGPA Box (Top Right)
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(145, 38, 45, 25, 3, 3, 'F');
    doc.setFontSize(9);
    doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
    doc.text("CUMULATIVE GPA", 167.5, 45, { align: 'center' });
    doc.setFontSize(18);
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.text(cgpa, 167.5, 55, { align: 'center' });
    
// 1. Define Helper for Standing Colors
    const getStandingColor = (val: number): [number, number, number] => {
      if (val >= 3.5) return colors.excellent as [number, number, number]; // First Class / Distinction
      if (val >= 3.0) return colors.good as [number, number, number];      // Upper Credit / 2:1
      if (val >= 2.0) return colors.warning as [number, number, number];   // Lower Credit / 2:2
      return colors.danger as [number, number, number];                   // Pass / Probation
    };

    // 2. Student Profile Info
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(colors.textMain[0], colors.textMain[1], colors.textMain[2]);
    doc.text(`STUDENT: ${data.studentName?.toUpperCase() || 'ADELEKE OLUMIDE'}`, 20, 45);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Institution: ${data.school || 'University of Ilorin'}`, 20, 52);
    doc.text(`Department: ${data.department || 'Computer Science'}`, 20, 58);

    // 3. DYNAMIC STANDING COLOR
    const sColor = getStandingColor(cgpaValue);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(sColor[0], sColor[1], sColor[2]);
    doc.text(`Standing: ${standing.toUpperCase()}`, 20, 65);

    // Reset color for the line and rest of doc
    doc.setDrawColor(226, 232, 240);
    doc.line(20, 72, 190, 72);
    let currentY = 82;
    
    // 4. Semester Tables
    data.semesters.forEach((semester) => {
      if (currentY > 230) { doc.addPage(); currentY = 25; }

      // Calculate Semester-Specific GPA
      const semPoints = semester.courses.reduce((sum, c) => sum + (c.gradePoint * c.credits), 0);
      const semCredits = semester.courses.reduce((sum, c) => sum + Number(c.credits), 0);
      const semGPA = semCredits > 0 ? (semPoints / semCredits).toFixed(2) : "0.00";

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      doc.text(`${semester.name.toUpperCase()}`, 20, currentY);
      
      doc.setFontSize(10);
      doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
      doc.text(`SGPA: ${semGPA}`, 190, currentY, { align: 'right' });

      autoTable(doc, {
        startY: currentY + 4,
        head: [['Course Name', 'Credits', 'Grade', 'Point']],
        body: semester.courses.map(c => [c.name, c.credits, c.grade, c.gradePoint]),
        theme: 'grid',
        headStyles: { fillColor: colors.primary, fontSize: 10, fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 4 },
        columnStyles: {
          2: { fontStyle: 'bold' }, // Grade Column
          3: { halign: 'center' }
        },
        didParseCell: (data) => {
          // Apply Grade Colors
          if (data.section === 'body' && data.column.index === 2) {
            const grade = data.cell.raw as string;
            const color = getGradeColor(grade);
            data.cell.styles.textColor = color;
          }
        }
      });

      currentY = (doc as any).lastAutoTable.finalY + 15;
    });

    // 5. Final Save
    if (Capacitor.isNativePlatform()) {
      try {
        const pdfBase64 = doc.output('datauristring').split(',')[1];
        const fileName = `Transcript_${Date.now()}.pdf`;
        await Filesystem.writeFile({
          path: fileName,
          data: pdfBase64,
          directory: Directory.Documents,
          recursive: true
        });
        alert("Transcript exported successfully to Documents!");
      } catch (e) {
        alert("Failed to save PDF. Please verify storage permissions.");
      }
    } else {
      doc.save("Academic_Transcript.pdf");
    }
  };

  // --- NATIVE JSON EXPORT ---
  const handleNativeExport = async () => {
    const fileName = `GPA_Wizard_Master_${Date.now()}.json`;
    
    // Grab the timetable from storage
    const timetableData = localStorage.getItem('gpa-wizard-timetable');

    // Create a combined backup object
    const fullBackup = {
      academic: data, // This is the 'data' from your useGPAData hook
      timetable: timetableData ? JSON.parse(timetableData) : null,
      exportDate: new Date().toISOString()
    };

    const content = JSON.stringify(fullBackup, null, 2);

    if (Capacitor.isNativePlatform()) {
      try {
        await Filesystem.writeFile({
          path: fileName,
          data: content,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
          recursive: true
        });
        alert("Success! GPA & Timetable saved to Documents.");
      } catch (e) {
        alert("Failed to save JSON backup.");
      }
    } else {
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
    }
  };

  return (
  <div className="no-print min-h-screen bg-background text-foreground transition-colors duration-300">
  {/* Header: Changed bg-white to bg-card and added border-border */}
  <header className="bg-card border-b sticky top-0 z-50 shadow-sm px-4 md:px-0 border-border">
    <div className="max-w-6xl mx-auto min-h-[4rem] py-3 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2 self-start md:self-auto">
        <div className="bg-primary p-2 rounded-lg">
          <GraduationCap className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-black text-primary tracking-tight">GPA WIZARD</h1>
      </div>
      
      <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto">
        <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-lg border border-border h-10">
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          <Select value={data.structure} onValueChange={(val) => setStructure(val as GPAStructure)}>
            <SelectTrigger className="h-8 w-32 border-none bg-transparent focus:ring-0 shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4.0">4.00 Scale</SelectItem>
              <SelectItem value="5.0">5.00 Scale</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ModeToggle />
        
        <DataActions 
          data={data} 
          onImport={importData} 
          onExport={handleNativeExport} 
          onPrint={handlePrintReport} 
        />
      </div>
    </div>
  </header>

  <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
    <div className="space-y-8">
      <GPASummary data={data} />

      <Link href="/timetable" className="block mb-6">
  <div className="flex items-center justify-between p-4 rounded-2xl bg-[#1e293b] border border-slate-800 active:scale-[0.98] transition-all">
    <div className="flex items-center gap-4">
      <div className="bg-blue-600/20 p-3 rounded-xl">
        <Calendar className="text-blue-500" size={24} />
      </div>
      <div>
        <h3 className="font-bold text-slate-100">Lecture Timetable</h3>
        <p className="text-xs text-slate-400">View & track your classes</p>
      </div>
    </div>
    <div className="text-slate-500 pr-2">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m9 18 6-6-6-6"/>
      </svg>
    </div>
  </div>
</Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-foreground">Academic History</h2>
            <Button onClick={() => addSemester(`Semester ${data.semesters.length + 1}`)} className="bg-primary hover:bg-primary/90 rounded-full px-6 shadow-md text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" />
              Add Semester
            </Button>
          </div>

          {data.semesters.length === 0 ? (
            /* Empty State: Changed bg-white to bg-card/50 */
            <div className="bg-card/50 rounded-xl border-2 border-dashed border-muted p-12 text-center shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-2">No semesters added yet</h3>
              <Button onClick={() => addSemester('Semester 1')} variant="outline">
                Add My First Semester
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {data.semesters.map(semester => (
                <SemesterCard 
                  key={semester.id} 
                  semester={semester}
                  structure={data.structure}
                  onUpdateName={updateSemesterName}
                  onRemoveSemester={removeSemester}
                  onAddCourse={addCourse}
                  onRemoveCourse={removeCourse}
                  onUpdateCourse={updateCourse}
                />
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <StudentProfile data={data} onUpdate={updateStudentInfo} />
        
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-bold text-foreground">Offline & Private</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex gap-3 text-sm text-muted-foreground">
                <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center shrink-0">✓</div>
                <p><strong className="text-foreground">Device Storage:</strong> Local persistence enabled.</p>
              </li>
              <li className="flex gap-3 text-sm text-muted-foreground">
                <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center shrink-0">✓</div>
                <p><strong className="text-foreground">Native Export:</strong> PDF & JSON save to Documents.</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
</main>
        <Toaster />
      </div>
    );
}
