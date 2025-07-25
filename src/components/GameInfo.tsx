import React from 'react';
import { Calendar, Target, Trophy, Zap } from 'lucide-react';

export const GameInfo: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
        <Calendar className="mr-2 text-blue-600" />
        How to Play
      </h2>
      
      <div className="space-y-4">
        <div className="flex items-start">
          <Target className="mt-1 mr-3 text-green-600 flex-shrink-0" size={20} />
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Objective</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Clear your schedule by cancelling all meetings using the ball!</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <Zap className="mt-1 mr-3 text-yellow-600 flex-shrink-0" size={20} />
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Power-ups</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Collect office-themed power-ups for special abilities</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <Trophy className="mt-1 mr-3 text-purple-600 flex-shrink-0" size={20} />
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Scoring</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Different meeting types give different points</p>
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Controls</h3>
        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
          <li><strong>Arrow Keys / A,D:</strong> Move paddle</li>
          <li><strong>Mouse/Touch:</strong> Move paddle</li>
          <li><strong>Space:</strong> Start/Pause/Restart</li>
        </ul>
      </div>
    </div>
  );
};