import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cnMerge } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center border border-transparent justify-center rounded-md font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-blue-500 font-medium text-white hover:bg-blue-600 active:bg-blue-700 focus-visible:ring-blue-300",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 active:bg-red-700 focus-visible:ring-red-300",
        secondary:
          "bg-gray-100 text-gray-950 hover:bg-gray-200 active:bg-gray-300 focus-visible:ring-gray-200",
        outline:
          "bg-white text-gray-700 border-gray-200 hover:bg-gray-100 active:bg-gray-200 focus-visible:ring-gray-200",
        invisible:
          "text-gray-700 hover:border-gray-300 active:bg-gray-100 focus-visible:ring-gray-200",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cnMerge(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
