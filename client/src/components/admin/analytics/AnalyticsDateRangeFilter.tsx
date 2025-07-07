
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

interface AnalyticsDateRangeFilterProps {
  dateRange: { from?: Date; to?: Date };
  onDateRangeChange: (dateRange: { from?: Date; to?: Date }) => void;
}

const AnalyticsDateRangeFilter: React.FC<AnalyticsDateRangeFilterProps> = ({
  dateRange,
  onDateRangeChange
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    onDateRangeChange({
      from: range?.from,
      to: range?.to
    });
  };

  const clearDateRange = () => {
    onDateRangeChange({});
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Date Range Filter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !dateRange.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Select date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={{
                from: dateRange.from,
                to: dateRange.to
              }}
              onSelect={handleDateRangeSelect}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
        
        {(dateRange.from || dateRange.to) && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearDateRange}
            className="w-full"
          >
            Clear Date Range
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalyticsDateRangeFilter;
