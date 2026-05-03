export enum QuestCategory {
  MAIN = 'Main',
  SIDE = 'Side',
  DAILY = 'Daily',
  EVENT = 'Event'
}

export enum QuestPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  EPIC = 'Epic'
}

export enum QuestStatus {
  ACTIVE = 'Active',
  COMPLETED = 'Completed',
  FAILED = 'Failed',
  ON_HOLD = 'OnHold'
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  xp: number;
  level: number;
  bio?: string;
  settings?: {
    notifications: boolean;
    theme: 'light' | 'dark' | 'rpg';
  };
  stats?: {
    tasksCompleted: number;
    totalPlayTime: number;
  };
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  priority: QuestPriority;
  status: QuestStatus;
  deadline?: string;
  creatorId: string;
  assignees: string[];
  xpReward: number;
  teamId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderPhoto: string;
  text: string;
  type: 'text' | 'image' | 'file';
  attachmentUrl?: string;
  createdAt: string;
  readBy: string[];
}

export interface Team {
  id: string;
  name: string;
  creatorId: string;
  members: string[];
  createdAt: string;
}
