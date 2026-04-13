"use client"

import { useRef } from 'react';
import { GPAData } from '@/types';
import { Button } from '@/components/ui/button';
import { FileDown, FileUp, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Capacitor } from '@capacitor/core';

interface DataActionsProps {
  data: GPAData;
  onImport: (data: GPAData) => void;
  onExport: () => void;
  onPrint: () => void; // Final prop for the PDF generator
}

export function DataActions({ data, onImport, onExport, onPrint }: DataActionsProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportClick = () => {
    onExport();
    toast({
      title: "Export Initiated",
      description: Capacitor.isNativePlatform() 
        ? "Check your Documents folder for the backup." 
        : "Your backup file is downloading.",
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
  try {
    const importedData = JSON.parse(event.target?.result as string);
    
    // Check for NEW format (Master) OR OLD format (Direct Semesters)
    const isValidNew = importedData.academic && Array.isArray(importedData.academic.semesters);
    const isValidOld = importedData.semesters && Array.isArray(importedData.semesters);

    if (isValidNew || isValidOld) {
      onImport(importedData); // Send it to your flexible importData hook
      toast({
        title: "Data Imported",
        description: "Your wizardry data has been restored.",
      });
    } else {
      throw new Error("Invalid format");
    }
  } catch (err) {
    toast({
      variant: "destructive",
      title: "Import Error",
      description: "Could not parse the backup file.",
    });
  }
};
    reader.readAsText(file);
    e.target.value = ''; 
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center md:justify-end no-print w-full sm:w-auto">
      <Button 
        variant="default" 
        size="sm" 
        onClick={onPrint} // Changed from handlePrint to onPrint
        className="flex items-center gap-2 bg-primary hover:bg-primary/90 shadow-md"
      >
        <Printer className="h-4 w-4" />
        Print Report
      </Button>

      <Button variant="outline" size="sm" onClick={handleExportClick} className="flex items-center gap-2">
        <FileDown className="h-4 w-4" />
        Backup
      </Button>

      <Button variant="outline" size="sm" onClick={handleImportClick} className="flex items-center gap-2">
        <FileUp className="h-4 w-4" />
        Restore
      </Button>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept=".json"
      />
    </div>
  );
}
