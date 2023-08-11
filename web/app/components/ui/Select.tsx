import { Listbox, Transition } from "@headlessui/react"
import { Slot } from "@radix-ui/react-slot"
import { IconCheck, IconChevronDown, IconChevronUp } from "@tabler/icons-react"
import { cva, type VariantProps } from "class-variance-authority"
import {
  forwardRef,
  type ButtonHTMLAttributes,
  SelectHTMLAttributes,
} from "react"
import { Fragment, useState } from "react"
import { cnMerge } from "@/lib/utils"
import { Button } from "./Button"

// const selectVariants = cva(
//   "inline-flex items-center border border-transparent justify-center rounded-md font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50",
//   {
//     variants: {
//       variant: {
//         primary:
//           "bg-blue-500 font-medium text-white hover:bg-blue-600 active:bg-blue-700 focus-visible:ring-blue-300",
//         destructive:
//           "bg-red-500 text-white hover:bg-red-600 active:bg-red-700 focus-visible:ring-red-300",
//         secondary:
//           "bg-gray-100 text-gray-950 hover:bg-gray-200 active:bg-gray-300 focus-visible:ring-gray-200",
//         outline:
//           "bg-white text-gray-700 border-gray-200 hover:bg-gray-100 active:bg-gray-200 focus-visible:ring-gray-200",
//         invisible:
//           "text-gray-700 hover:border-gray-300 active:bg-gray-100 focus-visible:ring-gray-200",
//       },
//       size: {
//         default: "h-10 px-4 py-2",
//         sm: "h-9 rounded-md px-3",
//         lg: "h-11 rounded-md px-8",
//         icon: "h-10 w-10",
//       },
//     },
//     defaultVariants: {
//       variant: "primary",
//       size: "default",
//     },
//   }
// )

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  defaultValue?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ placeholder, children, defaultValue }, ref) => {
    //
    const [value, setValue] = useState<{ title: string; value: string }>()
    return (
      <Listbox
        className="w-fit"
        by="value"
        value={value}
        onChange={setValue}
        defaultValue={defaultValue}
      >
        <div className="">
          <Listbox.Button as={Fragment}>
            <Button variant="outline">
              {value ? value.title : placeholder}
              <span className="ml-3 text-gray-500">
                <IconChevronDown size={18} />
              </span>
            </Button>
          </Listbox.Button>
          <Transition
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-64 w-max space-y-1 overflow-auto rounded-md bg-white p-1.5 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              {children}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    )
  }
)
Select.displayName = "Select"

type SelectOptionProps = {
  title: string
  value: string
}
const SelectOption = ({ title, value }: SelectOptionProps) => {
  return (
    <Listbox.Option
      key={value}
      className={({ active, selected }) =>
        cnMerge(
          active && "bg-gray-100",
          selected && "bg-blue-500 text-white",
          "ui-selected:pr-8 relative cursor-default select-none rounded-md px-3 py-2"
        )
      }
      value={{ title, value }}
    >
      <span className="block truncate">{title}</span>
      <span className="ui-selected:flex ui-selected:pr-2 absolute inset-y-0 right-0 hidden items-center">
        <IconCheck size={18} />
      </span>
    </Listbox.Option>
  )
}

export { Select, SelectOption }
