"use client"

import { GPAData } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserCircle } from 'lucide-react';

interface StudentProfileProps {
  data: GPAData;
  onUpdate: (info: Partial<Pick<GPAData, 'studentName' | 'department' | 'level' | 'school'>>) => void;
}

export function StudentProfile({ data, onUpdate }: StudentProfileProps) {
  return (
    <Card className="border-primary/20 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <UserCircle className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Student Profile</CardTitle>
        </div>
        <CardDescription>Enter details to show on your report.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="studentName" className="text-xs font-bold uppercase text-muted-foreground">Full Name</Label>
          <Input 
            id="studentName" 
            placeholder="e.g. John Doe" 
            value={data.studentName || ''} 
            onChange={(e) => onUpdate({ studentName: e.target.value })}
            className="h-9"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="level" className="text-xs font-bold uppercase text-muted-foreground">Level</Label>
            <Input 
              id="level" 
              placeholder="e.g. 400" 
              value={data.level || ''} 
              onChange={(e) => onUpdate({ level: e.target.value })}
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="department" className="text-xs font-bold uppercase text-muted-foreground">Department</Label>
            <Input 
              id="department" 
              placeholder="e.g. Computer Science" 
              value={data.department || ''} 
              onChange={(e) => onUpdate({ department: e.target.value })}
              className="h-9"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="school" className="text-xs font-bold uppercase text-muted-foreground">University / School</Label>
          <Input 
            id="school" 
            placeholder="e.g. Stanford University" 
            value={data.school || ''} 
            onChange={(e) => onUpdate({ school: e.target.value })}
            className="h-9"
          />
        </div>
      </CardContent>
    </Card>
  );
}
