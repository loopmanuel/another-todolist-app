import { useMemo } from 'react';
import { TaskInputParser } from './parser';
import type { ParsedPatterns, Label } from './types';

/**
 * Hook to parse task input and extract date, label, and priority patterns
 */
export function useTaskInputParser(text: string, availableLabels: Label[]): ParsedPatterns {
  const parser = useMemo(() => new TaskInputParser(), []);

  const patterns = useMemo(() => {
    if (!text.trim()) {
      return {
        dates: [],
        labels: [],
        priorities: [],
        cleanText: '',
        hasPatterns: false,
      };
    }

    return parser.parseInput(text, availableLabels);
  }, [text, availableLabels, parser]);

  return patterns;
}
