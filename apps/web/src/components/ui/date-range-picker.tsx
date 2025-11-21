import * as React from 'react';
import { format } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { DateRange } from 'react-day-picker';

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = '選擇日期範圍',
  className,
}: DateRangePickerProps) {
  const [selected, setSelected] = React.useState<DateRange | undefined>(value);

  const handleSelect = (range: DateRange | undefined) => {
    setSelected(range);
    onChange?.(range);
  };

  const handleClear = () => {
    setSelected(undefined);
    onChange?.(undefined);
  };

  const displayText = React.useMemo(() => {
    if (!selected?.from) return placeholder;
    if (!selected?.to) return format(selected.from, 'yyyy/MM/dd');
    return `${format(selected.from, 'yyyy/MM/dd')} - ${format(selected.to!, 'yyyy/MM/dd')}`;
  }, [selected, placeholder]);

  return (
    <div className="flex gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !selected?.from && 'text-muted-foreground',
              className,
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayText}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={selected?.from}
            selected={selected}
            onSelect={handleSelect}
            numberOfMonths={2}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {selected?.from && (
        <Button
          variant="outline"
          size="icon"
          onClick={handleClear}
          className="h-9 w-9"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
