export enum AppState {
  AUTH = 'AUTH',
  LOADING = 'LOADING',
  EXPERIENCE = 'EXPERIENCE'
}

export interface Hotspot {
  id: string;
  x: number;
  y: number;
  label: string;
  description: string;
}

export const COLORS = {
  LIME: '#ACFF01',
  BLUE: '#2DD6FF',
  CARBON: '#0a0a0a',
  WHITE: '#FFFFFF',
};
