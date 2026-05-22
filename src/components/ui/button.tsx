import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "rounded-lg bg-brand-mid font-bold text-white shadow hover:bg-brand-dark hover:glow-brand dark:text-brand-deepest dark:hover:bg-brand-light",
        destructive:
          "rounded-lg bg-[#EF5350] font-bold text-white shadow-sm hover:bg-[#EF5350]/90",
        outline:
          "rounded-lg border border-border bg-transparent text-muted-foreground shadow-sm hover:border-brand-mid hover:bg-muted hover:text-foreground",
        secondary:
          "rounded-lg border border-border bg-muted text-foreground shadow-sm hover:border-brand-mid hover:bg-muted/80",
        ghost: "rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground",
        link: "text-brand-mid underline-offset-4 hover:underline dark:text-brand-light",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
