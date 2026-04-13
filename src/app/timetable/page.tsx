"use client";
import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Plus } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function TimetablePage() {
  const [activeDay, setActiveDay] = useState('Monday');
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="p-4 pb-20 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-foreground">Class Timetable</h1>
        <button className="bg-primary text-white p-2 rounded-full shadow-lg">
          <Plus className="h-6 w-6" />
        </button>
      </div>

      {/* Day Selector (Horizontal Scroll) */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
              activeDay === day 
              ? 'bg-primary text-white' 
              : 'bg-card text-muted-foreground border'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* The Timeline List */}
      <div className="space-y-4">
        {/* We will map through classes here */}
        <Card className="border-l-4 border-l-blue-500 bg-card shadow-sm">
          <CardContent className="p-4 flex gap-4">
            <div className="text-sm font-bold text-muted-foreground min-w-[60px]">
              08:00
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-foreground">CSC 401</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Lecture Theater II
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
