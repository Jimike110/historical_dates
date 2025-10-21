export interface HistoricalEvent {
  year: number;
  description: string;
}

export interface TimelineData {
  startYear: number;
  endYear: number;
  title: string;
  events: HistoricalEvent[];
}
