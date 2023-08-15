import { forwardRef, type InputHTMLAttributes } from "react"
import { cnMerge } from "@/lib/utils"

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cnMerge(
            "border-input focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-blue-300 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50",
            icon && "pl-8",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
