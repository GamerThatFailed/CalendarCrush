import { Level, MeetingBlock, MeetingType } from '../types/GameTypes';

export class LevelManager {
  private levels: Level[] = [];
  private canvasWidth: number;

  constructor(canvasWidth: number) {
    this.canvasWidth = canvasWidth;
    this.generateLevels();
  }

  private generateLevels(): void {
    // Week 1: Light schedule
    this.levels.push({
      id: 1,
      name: 'Week 1: New Job',
      weekOf: 'January 11-17, 2025',
      meetings: this.createMeetingLayout1(),
      powerUpChance: 0.15,
      ballSpeed: 6
    });

    // Week 2: Getting busier
    this.levels.push({
      id: 2,
      name: 'Week 2: Ramping Up',
      weekOf: 'January 18-24, 2025',
      meetings: this.createMeetingLayout2(),
      powerUpChance: 0.12,
      ballSpeed: 7
    });

    // Week 3: Full calendar
    this.levels.push({
      id: 3,
      name: 'Week 3: Peak Performance',
      weekOf: 'January 25-31, 2025',
      meetings: this.createMeetingLayout3(),
      powerUpChance: 0.1,
      ballSpeed: 8
    });
  }

  private createMeetingLayout1(): MeetingBlock[] {
    const meetings: MeetingBlock[] = [];
    const dayWidth = this.canvasWidth / 7;
    const colors = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'];
    const meetingTitles = [
      'standup', 'sync', '1:1 / alice', 'review', 'planning',
      'demo', 'interview', 'training', 'all-hands', 'retrospective'
    ];

    // Simple pattern for first level
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 7; col++) {
        if (Math.random() > 0.3) { // 70% chance for meeting
          const meeting: MeetingBlock = {
            id: `meeting-${row}-${col}`,
            position: {
              x: col * dayWidth + 10,
              y: 100 + row * 60
            },
            dimensions: {
              width: dayWidth - 20,
              height: 45
            },
            type: MeetingType.STANDUP,
            hits: 0,
            maxHits: 1,
            color: colors[col % colors.length],
            title: meetingTitles[Math.floor(Math.random() * meetingTitles.length)]
          };
          meetings.push(meeting);
        }
      }
    }

    return meetings;
  }

  private createMeetingLayout2(): MeetingBlock[] {
    const meetings: MeetingBlock[] = [];
    const dayWidth = this.canvasWidth / 7;
    const colors = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'];
    const meetingTitles = [
      'standup', 'stakeholder', '1:1 / bob', 'promote', 'discuss',
      'team lunch', 'hiring', 'sitdown', 'planning', 'review'
    ];

    // More complex pattern for second level
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 7; col++) {
        if (Math.random() > 0.2) { // 80% chance for meeting
          const meetingType = row === 3 ? MeetingType.ALL_HANDS : MeetingType.TEAM_MEETING;
          const maxHits = row === 3 ? 3 : (row === 2 ? 2 : 1);
          
          const meeting: MeetingBlock = {
            id: `meeting-${row}-${col}`,
            position: {
              x: col * dayWidth + 10,
              y: 100 + row * 55
            },
            dimensions: {
              width: dayWidth - 20,
              height: 45
            },
            type: meetingType,
            hits: 0,
            maxHits,
            color: colors[Math.floor(Math.random() * colors.length)],
            title: meetingTitles[Math.floor(Math.random() * meetingTitles.length)]
          };
          meetings.push(meeting);
        }
      }
    }

    return meetings;
  }

  private createMeetingLayout3(): MeetingBlock[] {
    const meetings: MeetingBlock[] = [];
    const dayWidth = this.canvasWidth / 7;
    const colors = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4'];
    const meetingTitles = [
      'board meeting', 'investor call', 'quarterly review', 'team offsite',
      'performance review', 'strategy session', 'client presentation', 'training'
    ];

    // Dense pattern for final level
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 7; col++) {
        const meetingType = row === 4 ? MeetingType.ALL_HANDS : 
                          row === 3 ? MeetingType.PLANNING :
                          MeetingType.TEAM_MEETING;
        const maxHits = row === 4 ? 4 : (row === 3 ? 3 : 2);
        
        const meeting: MeetingBlock = {
          id: `meeting-${row}-${col}`,
          position: {
            x: col * dayWidth + 10,
            y: 90 + row * 50
          },
          dimensions: {
            width: dayWidth - 20,
            height: 40
          },
          type: meetingType,
          hits: 0,
          maxHits,
          color: colors[Math.floor(Math.random() * colors.length)],
          title: meetingTitles[Math.floor(Math.random() * meetingTitles.length)]
        };
        meetings.push(meeting);
      }
    }

    return meetings;
  }

  public getLevel(levelNumber: number): Level | null {
    return this.levels.find(level => level.id === levelNumber) || null;
  }

  public getTotalLevels(): number {
    return this.levels.length;
  }
}