export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface MeetingBlock {
  id: string;
  position: Position;
  dimensions: Dimensions;
  type: MeetingType;
  hits: number;
  maxHits: number;
  color: string;
  title: string;
}

export interface Ball {
  position: Position;
  velocity: Velocity;
  radius: number;
  trail: Position[];
}

export interface Paddle {
  position: Position;
  dimensions: Dimensions;
  velocity: number;
}

export interface PowerUp {
  id: string;
  position: Position;
  velocity: Velocity;
  type: PowerUpType;
  dimensions: Dimensions;
  active: boolean;
}

export interface Particle {
  id: string;
  position: Position;
  velocity: Velocity;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export enum MeetingType {
  STANDUP = 'standup',
  ONE_ON_ONE = 'one-on-one',
  TEAM_MEETING = 'team-meeting',
  ALL_HANDS = 'all-hands',
  REVIEW = 'review',
  PLANNING = 'planning'
}

export enum PowerUpType {
  MULTI_BALL = 'multi-ball',
  MEETING_CANCELLATION = 'meeting-cancellation',
  COFFEE_BREAK = 'coffee-break',
  SCHEDULE_CLEAR = 'schedule-clear',
  OVERTIME = 'overtime',
  WIDE_PADDLE = 'wide-paddle'
}

export enum GameState {
  MENU = 'menu',
  PLAYING = 'playing',
  PAUSED = 'paused',
  GAME_OVER = 'game-over',
  LEVEL_COMPLETE = 'level-complete',
  VICTORY = 'victory'
}

export interface GameStats {
  score: number;
  level: number;
  lives: number;
  meetingsCancelled: number;
  powerUpsCollected: number;
  timeElapsed: number;
}

export interface Level {
  id: number;
  name: string;
  weekOf: string;
  meetings: MeetingBlock[];
  powerUpChance: number;
  ballSpeed: number;
}