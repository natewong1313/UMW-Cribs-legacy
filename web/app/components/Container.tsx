import type { HTMLProps } from "react"
import { cnMerge } from "@/lib/utils"

type Props = HTMLProps<HTMLDivElement> & {
  sectionClassName?: string
}

export default function Container({
  children,
  className,
  sectionClassName,
  ...props
}: Props) {
  return (
    <section className={sectionClassName}>
      <div
        className={cnMerge("mx-auto max-w-7xl px-6 sm:px-8", className)}
        {...props}
      >
        {children}
      </div>
    </section>
  )
}
