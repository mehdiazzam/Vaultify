"use client"

import * as React from "react"
import { format } from "date-fns"
import { ChevronDown } from "lucide-react"

import { Button } from "../ui/Button"
import { Calendar } from "../ui/Calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"

export function DatePickerDemo() {
  const [date, setDate] = React.useState<Date>()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          className="w-[212px] justify-between text-left font-normal"
          data-empty={!date}
        >
          {date ? format(date, "PPP") : <span>Pick a date</span>}
          <ChevronDown />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => setDate(d)}
          defaultMonth={date}
        />
      </PopoverContent>
    </Popover>
  )
}

export default DatePickerDemo;
