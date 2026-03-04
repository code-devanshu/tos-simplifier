export interface Section {
  title: string;
  severity: 'safe' | 'warning' | 'danger';
  summary: string;
  details: string;
}

export interface AnalysisResult {
  tldr: string;
  redFlags: string[];
  sections: Section[];
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  source: string;
  result: AnalysisResult;
}
