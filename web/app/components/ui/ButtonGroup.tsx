import { cnMerge } from "@/lib/utils"

type Props = {
  className?: string
  defaultLabel?: string
  options: string[]
  value?: string
  setValue?: (value: string) => void
}

export default function ButtonGroup({
  className,
  defaultLabel,
  options,
  value,
  setValue,
}: Props) {
  return (
    <div className="flex gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={cnMerge(
            "rounded-md border bg-white px-4 py-2 text-sm font-medium text-gray-700",
            value === option
              ? "border-blue-500 bg-blue-500 text-white"
              : "border-gray-300 hover:bg-gray-100",
            className
          )}
          onClick={() => setValue && setValue(option)}
        >
          {option === "" && defaultLabel ? defaultLabel : option}
        </button>
      ))}
      <input type="hidden" value={value} />
    </div>
  )
}
