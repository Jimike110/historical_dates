export interface HistoricalEvent {
  id: number;
  year: number;
  description: string;
}

export interface TimelineData {
  id: number;
  startYear: number;
  endYear: number;
  title: string;
  events: HistoricalEvent[];
}
