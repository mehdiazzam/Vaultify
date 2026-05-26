import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { cn } from '../../utils';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3 z-90', className)}
      classNames={{
        months: 'relative flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-3',
        month_caption: 'flex justify-center items-center h-8 relative',
        caption_label: 'text-[0.925rem] font-medium tracking-wide',
        nav: 'absolute top-0 flex grow w-full items-center justify-between pointer-events-none z-100 ',
        button_previous: cn(
          'h-7 w-7 bg-transparent p-0 opacity-60 hover:opacity-100 flex items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-white/10 transition-colors pointer-events-auto fill-white'
        ),
        button_next: cn(
          'h-7 w-7 bg-transparent p-0 opacity-60 hover:opacity-100 flex items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-white/10 transition-colors pointer-events-auto fill-white'
        ),
        month_grid: 'w-full border-collapse space-y-1',
        weekdays: 'flex',
        weekday: 'text-slate-400 rounded-md w-8 font-medium text-[0.7rem] uppercase tracking-wider',
        week: 'flex w-full mt-1',
        day: 'h-8 w-8 text-center text-[0.8rem] p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-slate-100/50 [&:has([aria-selected])]:bg-slate-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 dark:[&:has([aria-selected].day-outside)]:bg-white/5 dark:[&:has([aria-selected])]:bg-white/10',
        day_button: cn(
          'h-8 w-8 p-0 font-normal aria-selected:opacity-100 flex items-center justify-center rounded-md hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-slate-50 transition-colors'
        ),
        range_end: 'day-range-end',
        selected:
          'bg-gradient-to-br from-violet-500 to-indigo-600 text-white hover:from-violet-400 hover:to-indigo-500 hover:text-white focus:from-violet-500 focus:to-indigo-600 focus:text-white shadow-[0_0_12px_rgba(139,92,246,0.3)] font-semibold border-none',
        today: 'bg-black/5 text-slate-900 dark:bg-white/5 dark:text-slate-50 font-semibold',
        outside:
          'day-outside pointer-events-none cursor-default text-slate-400 opacity-50 aria-selected:bg-slate-100/50 aria-selected:text-slate-500 aria-selected:opacity-30 dark:text-slate-500 dark:aria-selected:bg-white/5 dark:aria-selected:text-slate-400',
        disabled: 'text-slate-400 opacity-50 dark:text-slate-500',
        range_middle:
          'aria-selected:bg-slate-100 aria-selected:text-slate-900 dark:aria-selected:bg-white/10 dark:aria-selected:text-slate-50',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ ...props }) => {
          if (props.orientation === 'left') {
            return <ChevronLeft className="h-4 w-4" {...props} />;
          }
          return <ChevronRight className="h-4 w-4" {...props} />;
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
