// frontend/src/components/TimeSuggestionForm.tsx
// Form for invitees to suggest alternative meeting times

import React, { useState } from 'react';
import { API_BASE_URL } from '../../../Config';

interface TimeSuggestionFormProps {
  meetupId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const TimeSuggestionForm: React.FC<TimeSuggestionFormProps> = ({ 
  meetupId, 
  onSuccess,
  onCancel 
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isFlexible, setIsFlexible] = useState(false);
  const [endTime, setEndTime] = useState<string>('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (isFlexible && !endTime) {
      // Auto-set end time to 2 hours later
      const [hours, minutes] = time.split(':');
      const endHour = (parseInt(hours) + 2) % 24;
      setEndTime(`${endHour.toString().padStart(2, '0')}:${minutes}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !selectedTime) {
      alert('Please select a date and time');
      return;
    }

    if (isFlexible && !endTime) {
      alert('Please select an end time for the flexible window');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/meetup-time-suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          meetup_id: meetupId,
          suggested_date: formatDateForAPI(selectedDate),
          suggested_time_start: selectedTime + ':00',
          suggested_time_end: isFlexible && endTime ? endTime + ':00' : null,
          message: message || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send suggestion');
      }

      alert('Your time suggestion has been sent to the organizer!');
      onSuccess();
    } catch (error: any) {
      console.error('Error submitting time suggestion:', error);
      alert(error.message || 'Failed to send suggestion. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-4 pt-4 border-t border-gray-200">
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Suggest an alternative time</h4>
        
        {/* Date Selection */}
        <div className="mb-6">
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
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg mb-6">
            <input
              type="checkbox"
              id="suggest-flexible"
              checked={isFlexible}
              onChange={(e) => setIsFlexible(e.target.checked)}
              className="h-5 w-5 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
            />
            <label htmlFor="suggest-flexible" className="text-sm font-medium text-gray-700">
              I'm flexible - give a time range
            </label>
          </div>
        )}

        {/* Time Selection */}
        {selectedDate && (
          <div className="mb-6">
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
          <div className="mb-6">
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
          <div className="p-4 bg-teal-50 rounded-lg border-2 border-teal-200 mb-6">
            <p className="text-sm text-teal-700 font-medium mb-1">✅ Suggesting:</p>
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

        {/* Optional Message */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message (optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Let them know why this time works better for you..."
            rows={3}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !selectedDate || !selectedTime}
          className="flex-1 bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting ? 'Sending...' : 'Send Suggestion'}
        </button>
      </div>
    </form>
  );
};
