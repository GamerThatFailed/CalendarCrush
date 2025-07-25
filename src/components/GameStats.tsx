import React from 'react';
import { BarChart3, Clock, Target, Zap } from 'lucide-react';

interface GameStatsProps {
  score: number;
  level: number;
  lives: number;
  meetingsCancelled: number;
  powerUpsCollected: number;
  timeElapsed: number;
}

export const GameStats: React.FC<GameStatsProps> = ({
  score,
  level,
  lives,
  meetingsCancelled,
  powerUpsCollected,
  timeElapsed
}) => {
  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
        <BarChart3 className="mr-2 text-blue-600" />
        Game Stats
      </h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{score.toLocaleString()}</div>
          <div className="text-sm text-blue-800">Score</div>
        </div>
        
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{level}</div>
          <div className="text-sm text-green-800">Week</div>
        </div>
        
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{lives}</div>
          <div className="text-sm text-red-800">Lives</div>
        </div>
        
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{meetingsCancelled}</div>
          <div className="text-sm text-purple-800">Cancelled</div>
        </div>
      </div>
      
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center text-gray-600">
            <Zap className="mr-1" size={16} />
            Power-ups Collected
          </span>
          <span className="font-semibold text-gray-800">{powerUpsCollected}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center text-gray-600">
            <Clock className="mr-1" size={16} />
            Time Played
          </span>
          <span className="font-semibold text-gray-800">{formatTime(timeElapsed)}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center text-gray-600">
            <Target className="mr-1" size={16} />
            Efficiency
          </span>
          <span className="font-semibold text-gray-800">
            {timeElapsed > 0 ? Math.round((meetingsCancelled / (timeElapsed / 1000)) * 60) : 0}/min
          </span>
        </div>
      </div>
    </div>
  );
};