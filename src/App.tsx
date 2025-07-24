import React, { useState, useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { GameInfo } from './components/GameInfo';
import { GameStats } from './components/GameStats';
import { Calendar, Github, Coffee, Trophy } from 'lucide-react';

function App() {
  const [gameStats, setGameStats] = useState({
    score: 0,
    level: 1,
    lives: 3,
    meetingsCancelled: 0,
    powerUpsCollected: 0,
    timeElapsed: 0
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Calendar Breaker</h1>
              <span className="ml-3 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                v1.0
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                <Coffee className="h-4 w-4 mr-1" />
                <span className="text-sm">Coffee Break Mode</span>
              </button>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Canvas - Takes up 2 columns on large screens */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Week {gameStats.level}: Your Calendar
                </h2>
                <div className="text-sm text-gray-600">
                  January 11-17, 2025
                </div>
              </div>
              
              <GameCanvas />
              
              <div className="mt-4 text-center text-sm text-gray-600">
                Use arrow keys, A/D, or mouse to control your paddle. Press SPACE to start!
              </div>
            </div>
          </div>

          {/* Sidebar with game info and stats */}
          <div className="space-y-6">
            <GameInfo />
            <GameStats {...gameStats} />
            
            {/* Achievement Panel */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Trophy className="mr-2 text-yellow-600" />
                Achievements
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <span className="text-sm text-green-800">Meeting Veteran</span>
                  <span className="text-xs text-green-600">10 meetings cancelled</span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg opacity-50">
                  <span className="text-sm text-gray-600">Power User</span>
                  <span className="text-xs text-gray-500">5 power-ups collected</span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg opacity-50">
                  <span className="text-sm text-gray-600">Schedule Master</span>
                  <span className="text-xs text-gray-500">Complete all weeks</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>
            Built with React, TypeScript, and HTML5 Canvas. 
            A modern take on the classic Arkanoid game with a professional calendar theme.
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;