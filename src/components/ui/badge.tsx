import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        
        // Academic Standing Variants
        firstClass: 
          "border-transparent bg-amber-500 text-amber-950 hover:bg-amber-400",
        secondUpper: 
          "border-transparent bg-blue-600 text-white hover:bg-blue-500",
        secondLower: 
          "border-transparent bg-cyan-600 text-white hover:bg-cyan-500",
        thirdClass: 
          "border-transparent bg-orange-600 text-white hover:bg-orange-500",
          
        // Grade Specific Variants
        gradeA: "border-transparent bg-emerald-600 text-white",
        gradeB: "border-transparent bg-blue-500 text-white",
        gradeC: "border-transparent bg-yellow-500 text-yellow-950",
        gradeD: "border-transparent bg-orange-500 text-white",
        gradeF: "border-transparent bg-red-600 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }