import React, { useRef, useEffect, useState } from 'react';
import { GameEngine } from '../game/GameEngine';
import { GameState } from '../types/GameTypes';

interface GameCanvasProps {
  onGameStateChange?: (state: GameState) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ onGameStateChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (canvasRef.current && !gameEngineRef.current) {
      gameEngineRef.current = new GameEngine(canvasRef.current);
      setIsLoaded(true);
      
      // Start the game engine
      gameEngineRef.current.start();
    }

    return () => {
      if (gameEngineRef.current) {
        gameEngineRef.current.stop();
      }
    };
  }, []);

  const handleCanvasClick = () => {
    if (gameEngineRef.current) {
      const currentState = gameEngineRef.current.getCurrentState();
      if (currentState === GameState.MENU) {
        gameEngineRef.current.startGame();
      }
    }
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="border-2 border-gray-200 rounded-lg shadow-lg cursor-pointer max-w-full h-auto"
        style={{ 
          aspectRatio: '10/7',
          width: '100%',
          maxWidth: '1000px'
        }}
        onClick={handleCanvasClick}
      />
      
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Calendar Breaker...</p>
          </div>
        </div>
      )}
    </div>
  );
};