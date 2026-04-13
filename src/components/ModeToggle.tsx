"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Wait until the component is "mounted" on the phone
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // If not mounted yet, show a placeholder so the layout doesn't jump
  if (!mounted) {
    return <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full w-10 h-10 shrink-0 border dark:border-slate-800 bg-slate-100 dark:bg-slate-800 transition-all hover:scale-110"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
    <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
