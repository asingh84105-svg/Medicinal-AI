export interface MedicineDetails {
  brandName: string;
  genericName: string;
  usage: string;
  dosage: string;
  sideEffects: string[];
  warnings: string[];
  manufacturer?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface MapLocation {
  name: string;
  address: string;
  rating?: number;
  isOpen?: boolean;
  latitude?: number;
  longitude?: number;
}

export interface HistoryItem extends MedicineDetails {
  id: string;
  timestamp: number;
}

export interface Reminder {
  id: string;
  medicine: string;
  time: string;
  active: boolean;
}

export enum AppScreen {
  HOME = 'HOME',
  SCAN = 'SCAN',
  CHAT = 'CHAT',
  MAPS = 'MAPS',
  LIVE = 'LIVE',
  HISTORY = 'HISTORY',
  INTERACTIONS = 'INTERACTIONS',
  REMINDERS = 'REMINDERS'
}
