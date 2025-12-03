export interface PoetResponse {
  verses: string[];
  theme: string;
}

export enum ViewState {
  INTRO = 'INTRO',
  EXPERIENCE = 'EXPERIENCE',
}