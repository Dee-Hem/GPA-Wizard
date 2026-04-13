"use client";
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Plus, Trash2, Bell } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { App } from '@capacitor/app';
import { useRouter } from 'next/navigation';
import { LocalNotifications } from '@capacitor/local-notifications';

interface Course {
  id: string;
  code: string;
  name: string;
  time: string;
  location: string;
  day: string;
}

export default function TimetablePage() {
  const [activeDay, setActiveDay] = useState('Monday');
  const [courses, setCourses] = useState<Course[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCourse, setNewCourse] = useState({ code: '', name: '', time: '', location: '' });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    const saved = localStorage.getItem('gpa-wizard-timetable');
    if (saved) setCourses(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('gpa-wizard-timetable', JSON.stringify(courses));
  }, [courses]);

  const syncWithNotifications = async () => {
    try {
      const perms = await LocalNotifications.requestPermissions();
      if (perms.display !== 'granted') {
        alert("Wizard needs notification permission!");
        return;
      }
// 1. Added 'location' to the arguments
const scheduleLectureAlert = async (courseName: string, startTime: string, dayOfWeek: number, location: string) => {
  const trigger = new Date();
  
  // For testing, this triggers 15 mins ago, 
  // but for the real logic, you'll calculate the actual class time.
  trigger.setMinutes(trigger.getMinutes() - 15); 

  await LocalNotifications.schedule({
    notifications: [
      {
        title: "Lecture Incoming! 📚",
        // 2. Updated variables to match the arguments
        body: `${courseName} starts in 15 minutes at ${location}. Don't be late!`,
        id: Math.floor(Math.random() * 10000),
        schedule: { at: trigger, allowWhileIdle: true },
        sound: 'default',
        extra: { courseName },
        importance: 5, 
        channelId: 'default'
      }
    ]
  });
};

      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
      }

      const notifications = courses.map((course, index) => ({
        title: `Class: ${course.code}`,
        body: `Starts at ${course.time} in ${course.location || 'Venue TBA'}`,
        id: index + 1,
        schedule: { at: new Date(Date.now() + 1000 * 10) }, // 10 second test
        sound: 'default',
      }));

      if (notifications.length > 0) {
        await LocalNotifications.schedule({ notifications });
        alert("Alerts set! Testing in 10 seconds...");
      } else {
        alert("Add some classes first!");
      }
    } catch (err) {
      alert("Sync failed. Ensure plugin is version 5.0.0");
    }
  };
  
  const router = useRouter();

  useEffect(() => {
  const backHandler = App.addListener('backButton', (data) => {
    // If we are on the timetable, go back to the home dashboard
    router.push('/'); 
  });

  return () => {
    backHandler.then(h => h.remove());
  };
}, [router]);

  const addCourse = () => {
    if (!newCourse.code || !newCourse.time) return;
    const courseToAdd = { ...newCourse, id: Date.now().toString(), day: activeDay };
    setCourses([...courses, courseToAdd]);
    setNewCourse({ code: '', name: '', time: '', location: '' });
    setShowAddForm(false);
  };

  const deleteCourse = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
  };

  const filteredCourses = courses
    .filter(c => c.day === activeDay)
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto space-y-6 min-h-screen bg-background text-foreground">
      <div className="flex justify-between items-center pt-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Timetable</h1>
          <p className="text-muted-foreground text-sm">Lecture Schedule</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="rounded-full h-12 w-12 p-0 shadow-lg">
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar border-b">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              activeDay === day ? 'bg-primary text-primary-foreground' : 'bg-card border'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {showAddForm && (
        <Card className="border-2 border-primary/20 bg-card">
          <CardContent className="p-4 space-y-3">
            <input 
              placeholder="Course Code" 
              className="w-full p-3 rounded-lg bg-background border text-sm"
              value={newCourse.code}
              onChange={(e) => setNewCourse({...newCourse, code: e.target.value.toUpperCase()})}
            />
            <div className="flex gap-2">
              <input type="time" className="flex-1 p-3 rounded-lg bg-background border text-sm" value={newCourse.time} onChange={(e) => setNewCourse({...newCourse, time: e.target.value})} />
              <input placeholder="Venue" className="flex-1 p-3 rounded-lg bg-background border text-sm" value={newCourse.location} onChange={(e) => setNewCourse({...newCourse, location: e.target.value})} />
            </div>
            <Button onClick={addCourse} className="w-full font-bold">Save Class</Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="relative border-none bg-card shadow-sm overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
            <CardContent className="p-4 flex items-center justify-between text-foreground">
              <div className="flex gap-4 items-center">
                <div className="flex flex-col items-center justify-center min-w-[60px] py-1 bg-muted rounded-lg">
                  <Clock className="h-3 w-3 mb-1" />
                  <span className="text-xs font-black">{course.time}</span>
                </div>
                <div>
                  <h3 className="font-bold">{course.code}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {course.location || 'TBA'}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteCourse(course.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="fixed bottom-6 right-6 left-6">
         <Button onClick={syncWithNotifications} className="w-full h-14 shadow-2xl gap-2 rounded-2xl font-black">
            <Bell className="h-5 w-5" />
            ENABLE CLASS ALERTS
         </Button>
      </div>
    </div>
  );
}
