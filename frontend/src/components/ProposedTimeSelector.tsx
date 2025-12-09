// frontend/src/components/ProposedTimeSelector.tsx
// Better UX version - visual date picker with quick time buttons

import React, { useState, useEffect } from 'react';

interface ProposedTimeSelectorProps {
  onTimeChange: (timeData: {
    proposed_date: string;
    proposed_time_start: string;
    proposed_time_end: string | null;
    is_time_flexible: boolean;
  }) => void;
}

export const ProposedTimeSelector: React.FC<ProposedTimeSelectorProps> = ({ onTimeChange }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isFlexible, setIsFlexible] = useState(false);
  const [endTime, setEndTime] = useState<string>('');

  // Quick date options
  const getQuickDates = () => {
    const today = new Date();
    const dates = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  // Quick time options
  const quickTimes = [
    '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', 
    '17:00', '18:00', '19:00', '20:00'
  ];

  const formatDateForDisplay = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-IE', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  const formatDateForAPI = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}${minutes === '00' ? '' : ':' + minutes}${ampm}`;
  };

  useEffect(() => {
    if (selectedDate && selectedTime) {
      onTimeChange({
        proposed_date: formatDateForAPI(selectedDate),
        proposed_time_start: selectedTime + ':00',
        proposed_time_end: isFlexible && endTime ? endTime + ':00' : null,
        is_time_flexible: isFlexible
      });
    }
  }, [selectedDate, selectedTime, endTime, isFlexible]);

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (isFlexible && !endTime) {
      // Auto-set end time to 2 hours later
      const [hours, minutes] = time.split(':');
      const endHour = (parseInt(hours) + 2) % 24;
      setEndTime(`${endHour.toString().padStart(2, '0')}:${minutes}`);
    }
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-300 p-6 space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">📅 When do you want to meet?</h3>
      
      {/* Date Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select a date <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-4 gap-2">
          {getQuickDates().map((date, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedDate(date)}
              className={`p-3 rounded-lg border-2 font-medium transition-all ${
                selectedDate && selectedDate.toDateString() === date.toDateString()
                  ? 'bg-teal-50 border-teal-500 text-teal-700'
                  : 'border-gray-300 text-gray-700 hover:border-teal-300'
              }`}
            >
              <div className="text-xs">{formatDateForDisplay(date)}</div>
              <div className="text-lg font-bold">{date.getDate()}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Flexible Time Toggle */}
      {selectedDate && (
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="time-flexible"
            checked={isFlexible}
            onChange={(e) => setIsFlexible(e.target.checked)}
            className="h-5 w-5 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
          />
          <label htmlFor="time-flexible" className="text-sm font-medium text-gray-700">
            I'm flexible - give a time range (e.g., "2pm - 4pm")
          </label>
        </div>
      )}

      {/* Time Selection */}
      {selectedDate && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {isFlexible ? 'Start time' : 'Select a time'} <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {quickTimes.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => handleTimeSelect(time)}
                className={`p-3 rounded-lg border-2 font-medium transition-all ${
                  selectedTime === time
                    ? 'bg-teal-50 border-teal-500 text-teal-700'
                    : 'border-gray-300 text-gray-700 hover:border-teal-300'
                }`}
              >
                {formatTime(time)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* End Time (if flexible) */}
      {selectedDate && selectedTime && isFlexible && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            End time <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {quickTimes
              .filter(time => time > selectedTime)
              .map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setEndTime(time)}
                  className={`p-3 rounded-lg border-2 font-medium transition-all ${
                    endTime === time
                      ? 'bg-teal-50 border-teal-500 text-teal-700'
                      : 'border-gray-300 text-gray-700 hover:border-teal-300'
                  }`}
                >
                  {formatTime(time)}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Preview */}
      {selectedDate && selectedTime && (
        <div className="p-4 bg-teal-50 rounded-lg border-2 border-teal-200">
          <p className="text-sm text-teal-700 font-medium mb-1">✅ You're proposing:</p>
          <p className="text-lg font-bold text-teal-900">
            {selectedDate.toLocaleDateString('en-IE', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
            {' '}
            {isFlexible && endTime ? (
              <>between {formatTime(selectedTime)} - {formatTime(endTime)}</>
            ) : (
              <>at {formatTime(selectedTime)}</>
            )}
          </p>
        </div>
      )}
    </div>
  );
};