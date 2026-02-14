'use client';

import { useState, useMemo } from 'react';
import { Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TimeSlot {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (24h format)
  display: string; // Human-readable format
}

interface TimeSlotPickerProps {
  onSlotsChange: (slots: TimeSlot[]) => void;
  minSlots?: number;
  maxSlots?: number;
}

// Generate next 14 days (2 weeks)
function getAvailableDates(): Date[] {
  const dates: Date[] = [];
  const today = new Date();

  // Start from tomorrow (consultations need at least 1 day advance)
  for (let i = 1; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    // Skip Fridays (off day in Bangladesh)
    if (date.getDay() !== 5) {
      dates.push(date);
    }
  }

  return dates;
}

// Generate time slots for a given date
function getTimeSlotsForDate(): string[] {
  const slots: string[] = [];

  // Business hours: 9 AM to 5 PM (Bangladesh time)
  // Slots every 30 minutes
  for (let hour = 9; hour < 17; hour++) {
    for (const minute of [0, 30]) {
      if (hour === 16 && minute === 30) break; // End at 5:00 PM

      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
  }

  return slots;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function TimeSlotPicker({ onSlotsChange, minSlots = 2, maxSlots = 5 }: TimeSlotPickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);

  const availableDates = useMemo(() => getAvailableDates(), []);
  const availableTimeSlots = useMemo(
    () => (selectedDate ? getTimeSlotsForDate() : []),
    [selectedDate]
  );

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleTimeSelect = (time: string) => {
    if (!selectedDate) return;

    const dateString = selectedDate.toISOString().split('T')[0];
    const display = `${formatDate(selectedDate)}, ${formatTime(time)}`;

    const slotId = `${dateString}T${time}`;
    const existingIndex = selectedSlots.findIndex(
      (slot) => `${slot.date}T${slot.time}` === slotId
    );

    let newSlots: TimeSlot[];

    if (existingIndex >= 0) {
      // Remove slot
      newSlots = selectedSlots.filter((_, index) => index !== existingIndex);
    } else {
      // Add slot (if under max limit)
      if (selectedSlots.length >= maxSlots) {
        return; // Don't add more than max
      }

      newSlots = [
        ...selectedSlots,
        {
          date: dateString,
          time,
          display,
        },
      ];
    }

    setSelectedSlots(newSlots);
    onSlotsChange(newSlots);
  };

  const isSlotSelected = (date: Date, time: string): boolean => {
    const dateString = date.toISOString().split('T')[0];
    return selectedSlots.some((slot) => slot.date === dateString && slot.time === time);
  };

  const removeSlot = (index: number) => {
    const newSlots = selectedSlots.filter((_, i) => i !== index);
    setSelectedSlots(newSlots);
    onSlotsChange(newSlots);
  };

  const hasEnoughSlots = selectedSlots.length >= minSlots;

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Card className="bg-wisebox-background-card border-wisebox-primary/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-white flex items-center gap-2">
            <Calendar className="h-4 w-4 text-wisebox-primary" />
            Select Your Preferred Time Slots
          </CardTitle>
          <CardDescription className="text-wisebox-text-secondary">
            Choose {minSlots}-{maxSlots} time slots when you&apos;re available for a consultation.
            Our consultant will confirm one of these times.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasEnoughSlots && (
            <div className="flex items-start gap-2 p-3 bg-wisebox-status-warning/10 border border-wisebox-status-warning/30 rounded-lg">
              <AlertCircle className="h-4 w-4 text-wisebox-status-warning shrink-0 mt-0.5" />
              <p className="text-sm text-wisebox-status-warning">
                Please select at least {minSlots} time slots ({minSlots - selectedSlots.length} more needed)
              </p>
            </div>
          )}
          {hasEnoughSlots && (
            <div className="flex items-start gap-2 p-3 bg-wisebox-status-success/10 border border-wisebox-status-success/30 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-wisebox-status-success shrink-0 mt-0.5" />
              <p className="text-sm text-wisebox-status-success">
                Great! You&apos;ve selected {selectedSlots.length} time slots.
                {selectedSlots.length < maxSlots && ` You can select up to ${maxSlots - selectedSlots.length} more.`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Date Selector */}
      <Card className="bg-wisebox-background-card border-wisebox-border">
        <CardHeader>
          <CardTitle className="text-base text-white">Step 1: Choose a Date</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {availableDates.map((date) => {
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              const hasSlots = selectedSlots.some(
                (slot) => slot.date === date.toISOString().split('T')[0]
              );

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDateSelect(date)}
                  className={cn(
                    'relative p-3 rounded-lg border-2 transition-all text-center',
                    isSelected
                      ? 'border-wisebox-primary bg-wisebox-primary/10'
                      : 'border-wisebox-border hover:border-wisebox-border-light bg-wisebox-background-lighter',
                    hasSlots && !isSelected && 'ring-2 ring-wisebox-status-success/30'
                  )}
                >
                  {hasSlots && !isSelected && (
                    <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-wisebox-status-success" />
                  )}
                  <p className={cn('text-xs font-medium', isSelected ? 'text-wisebox-primary' : 'text-wisebox-text-secondary')}>
                    {date.toLocaleDateString('en-GB', { weekday: 'short' })}
                  </p>
                  <p className={cn('text-lg font-bold mt-1', isSelected ? 'text-white' : 'text-white')}>
                    {date.getDate()}
                  </p>
                  <p className={cn('text-xs', isSelected ? 'text-wisebox-primary' : 'text-wisebox-text-muted')}>
                    {date.toLocaleDateString('en-GB', { month: 'short' })}
                  </p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Time Slot Selector */}
      {selectedDate && (
        <Card className="bg-wisebox-background-card border-wisebox-border">
          <CardHeader>
            <CardTitle className="text-base text-white flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Step 2: Choose Time Slots for {formatDate(selectedDate)}
            </CardTitle>
            <CardDescription className="text-wisebox-text-secondary">
              All times shown in Bangladesh Standard Time (BST)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {availableTimeSlots.map((time) => {
                const isSelected = isSlotSelected(selectedDate, time);

                return (
                  <button
                    key={time}
                    onClick={() => handleTimeSelect(time)}
                    disabled={!isSelected && selectedSlots.length >= maxSlots}
                    className={cn(
                      'p-3 rounded-lg border transition-all text-center',
                      isSelected
                        ? 'border-wisebox-status-success bg-wisebox-status-success/10 text-wisebox-status-success'
                        : 'border-wisebox-border hover:border-wisebox-primary bg-wisebox-background-lighter text-white',
                      !isSelected && selectedSlots.length >= maxSlots && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {isSelected && <CheckCircle2 className="h-3 w-3" />}
                      <span className="text-sm font-medium">{formatTime(time)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Slots Summary */}
      {selectedSlots.length > 0 && (
        <Card className="bg-wisebox-background-card border-wisebox-border">
          <CardHeader>
            <CardTitle className="text-base text-white">Your Selected Time Slots</CardTitle>
            <CardDescription className="text-wisebox-text-secondary">
              The consultant will confirm one of these times with you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedSlots.map((slot, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-wisebox-background-lighter border border-wisebox-border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-wisebox-primary/20 text-wisebox-primary border-wisebox-primary/30">
                      #{index + 1}
                    </Badge>
                    <span className="text-sm text-white">{slot.display}</span>
                  </div>
                  <button
                    onClick={() => removeSlot(index)}
                    className="text-xs text-wisebox-text-secondary hover:text-red-400 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
