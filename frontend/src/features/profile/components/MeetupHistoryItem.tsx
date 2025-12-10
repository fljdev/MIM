import React from 'react';

interface MeetupHistoryItemProps {
  meetup: {
    id: number;
    meetup_code: string;
    title: string | null;
    vibe: string;
    budget_level: string;
    fairness_mode: string;
    status: string;
    created_at: string;
    expires_at: string;
    proposed_date: string | null;
    proposed_time_start: string | null;
    proposed_time_end: string | null;
    is_time_flexible: boolean;
    participant_count: number;
    user_role: 'organizer' | 'participant';
  };
  onClick: () => void;
}

const MeetupHistoryItem: React.FC<MeetupHistoryItemProps> = ({ meetup, onClick }) => {
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string; icon: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending', icon: '⏳' },
      preferences_set: { color: 'bg-blue-100 text-blue-800', label: 'Preferences Set', icon: '⚙️' },
      voting: { color: 'bg-purple-100 text-purple-800', label: 'Voting', icon: '🗳️' },
      confirmed: { color: 'bg-green-100 text-green-800', label: 'Confirmed', icon: '✅' },
      completed: { color: 'bg-gray-100 text-gray-800', label: 'Completed', icon: '🏁' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled', icon: '❌' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status, icon: '❓' };
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </span>
    );
  };

  const getVibeIcon = (vibe: string) => {
    const icons: Record<string, string> = {
      coffee: '☕',
      food: '🍽️',
      drinks: '🍺',
      walk: '🌳',
      study: '📚',
      work: '💼',
      social: '👥',
      sports: '⚽'
    };
    return icons[vibe?.toLowerCase()] || '🎯';
  };

  const getBudgetIcon = (budget: string) => {
    const icons: Record<string, string> = {
      '€': '💰',
      '€€': '💸',
      '€€€': '💎'
    };
    return icons[budget] || '💰';
  };

  const getFairnessIcon = (mode: string) => {
    const icons: Record<string, string> = {
      fastest: '⚡',
      sustainable: '🌱',
      accessible: '♿'
    };
    return icons[mode?.toLowerCase()] || '⚖️';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IE', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getRoleBadge = (role: 'organizer' | 'participant') => {
    if (role === 'organizer') {
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-medium">
          <span>👑</span>
          <span>Organizer</span>
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
          <span>👤</span>
          <span>Participant</span>
        </span>
      );
    }
  };

  const isActive = meetup.status !== 'completed' && meetup.status !== 'cancelled';
  const isPast = meetup.status === 'completed' || meetup.status === 'cancelled';

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl shadow-lg border-2 ${isActive ? 'border-emerald-200 hover:border-emerald-300' : 'border-gray-200 hover:border-gray-300'} p-6 cursor-pointer transition-all hover:shadow-xl`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left side: Meetup info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-2xl">
              {getVibeIcon(meetup.vibe)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                {meetup.title || `Meetup ${meetup.meetup_code}`}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {getStatusBadge(meetup.status)}
                {getRoleBadge(meetup.user_role)}
              </div>
            </div>
          </div>

          {/* Meetup details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-lg">{getBudgetIcon(meetup.budget_level)}</span>
              <span className="font-medium">{meetup.budget_level}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-lg">{getFairnessIcon(meetup.fairness_mode)}</span>
              <span className="font-medium capitalize">{meetup.fairness_mode}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-lg">👥</span>
              <span className="font-medium">{meetup.participant_count} participants</span>
            </div>
          </div>

          {/* Time information */}
          {meetup.proposed_date && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-lg">📅</span>
                <div>
                  <div className="font-medium">{formatDate(meetup.proposed_date)}</div>
                  {meetup.proposed_time_start && (
                    <div className="text-sm text-gray-600">
                      {formatTime(meetup.proposed_time_start)}
                      {meetup.is_time_flexible && meetup.proposed_time_end && (
                        <span> - {formatTime(meetup.proposed_time_end)}</span>
                      )}
                      {meetup.is_time_flexible && ' (flexible)'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Created date */}
          <div className="text-sm text-gray-500">
            Created {formatDate(meetup.created_at)}
          </div>
        </div>

        {/* Right side: Action and status */}
        <div className="flex flex-col items-end gap-3">
          {/* Expiry info for active meetups */}
          {isActive && meetup.expires_at && (
            <div className="text-right">
              <div className="text-sm text-gray-500">Expires</div>
              <div className="font-medium text-gray-700">{formatDate(meetup.expires_at)}</div>
            </div>
          )}

          {/* Action button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className={`px-4 py-2 rounded-lg font-semibold ${isActive ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
          >
            {isActive ? 'View Meetup' : 'View Details'}
          </button>

          {/* Code */}
          <div className="text-sm">
            <div className="text-gray-500">Code</div>
            <div className="font-mono font-bold text-gray-800">{meetup.meetup_code}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetupHistoryItem;
