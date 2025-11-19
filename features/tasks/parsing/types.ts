export type PatternType = 'date' | 'label' | 'priority';

export type DatePattern = {
  type: 'date';
  text: string; // Original matched text (e.g., "tomorr")
  normalizedText: string; // Normalized/completed text (e.g., "tomorrow")
  startIndex: number;
  endIndex: number;
  suggestedDate: string; // YYYY-MM-DD format
  displayText: string; // Human readable like "Tomorrow, Dec 25"
  confidence: 'high' | 'medium' | 'low';
};

export type LabelPattern = {
  type: 'label';
  text: string; // e.g., "#work"
  startIndex: number;
  endIndex: number;
  labelName: string; // e.g., "work"
  labelId?: string; // Matched existing label ID
  isExisting: boolean; // Whether this matches an existing label
};

export type PriorityPattern = {
  type: 'priority';
  text: string; // e.g., "!!", "#p1", "p:1"
  startIndex: number;
  endIndex: number;
  priority: number; // 0-3 (0=none, 1=low, 2=medium, 3=high)
  displayText: string; // e.g., "High priority"
};

export type ParsedPatterns = {
  dates: DatePattern[];
  labels: LabelPattern[];
  priorities: PriorityPattern[];
  cleanText: string; // Text without pattern markers
  hasPatterns: boolean;
};

export type Label = {
  id: string;
  name: string;
  color: string | null;
};
