import { Listbox, Transition } from "@headlessui/react"
import { IconCheck, IconChevronDown } from "@tabler/icons-react"
import { forwardRef, SelectHTMLAttributes, ReactElement, Fragment } from "react"
import { cnMerge } from "@/lib/utils"
import { Button } from "./Button"

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  defaultValue?: string
  children?: Array<ReactElement<SelectOptionProps>>
  setValue?: (value: string) => void
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, placeholder, children, defaultValue, value, setValue },
    ref
  ) => {
    // const [value, setValue] = useState(defaultValue)
    const titles = children
      ? children.reduce((acc, child) => {
          // @ts-ignore
          acc[child.props.value] = child.props.title
          return acc
        }, {})
      : {}
    return (
      <Listbox className="relative" value={value} onChange={setValue}>
        <div>
          <Listbox.Button as={Fragment}>
            <Button
              variant="outline"
              className={cnMerge(!value ? "text-gray-500" : "", className)}
            >
              {/* @ts-ignore */}
              {value && value in titles ? titles[value] : placeholder}
              <span className="ml-3 text-gray-400">
                <IconChevronDown size={18} />
              </span>
            </Button>
          </Listbox.Button>
          <Transition
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-20 mt-1 max-h-64 w-full min-w-full space-y-1 overflow-auto rounded-md bg-white p-1.5 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              {placeholder && (
                <SelectOption title={placeholder} value="" disabled />
              )}
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
  disabled?: boolean
}
const SelectOption = ({ title, value, disabled }: SelectOptionProps) => {
  return (
    <Listbox.Option
      key={value}
      className={({ active, selected }) =>
        cnMerge(
          active && "bg-gray-100",
          selected && "bg-blue-500 text-white",
          disabled ? "cursor-default text-gray-400" : "cursor-pointer",
          "ui-selected:pr-8 relative select-none rounded-md px-3 py-2"
        )
      }
      disabled={disabled}
      value={value}
    >
      <span className="block truncate">{title}</span>
      <span className="ui-selected:flex ui-selected:pr-2 absolute inset-y-0 right-0 hidden items-center">
        <IconCheck size={18} />
      </span>
    </Listbox.Option>
  )
}

export { Select, SelectOption }
