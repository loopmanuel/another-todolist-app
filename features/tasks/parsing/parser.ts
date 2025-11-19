import * as chrono from 'chrono-node';
import dayjs from 'dayjs';
import type { DatePattern, LabelPattern, PriorityPattern, ParsedPatterns, Label } from './types';

export class TaskInputParser {
  /**
   * Main parsing function that extracts all patterns from input text
   */
  parseInput(text: string, availableLabels: Label[]): ParsedPatterns {
    const dates = this.extractDates(text);
    const labels = this.extractLabels(text, availableLabels);
    const priorities = this.extractPriorities(text);
    const cleanText = this.removePatterns(text, [...dates, ...labels, ...priorities]);

    return {
      dates,
      labels,
      priorities,
      cleanText,
      hasPatterns: dates.length > 0 || labels.length > 0 || priorities.length > 0,
    };
  }

  /**
   * Extract date patterns using chrono-node natural language parser
   */
  private extractDates(text: string): DatePattern[] {
    const results = chrono.parse(text);
    const patterns: DatePattern[] = [];

    for (const result of results) {
      // Skip if the date is in the past (except for "today")
      const parsedDate = result.start.date();
      const today = dayjs().startOf('day');
      const isToday = dayjs(parsedDate).isSame(today, 'day');

      if (!isToday && dayjs(parsedDate).isBefore(today)) {
        continue;
      }

      const confidence = this.getDateConfidence(result);
      const suggestedDate = dayjs(parsedDate).format('YYYY-MM-DD');
      const displayText = this.formatDateDisplay(parsedDate);

      patterns.push({
        type: 'date',
        text: result.text,
        startIndex: result.index,
        endIndex: result.index + result.text.length,
        suggestedDate,
        displayText,
        confidence,
      });
    }

    return patterns;
  }

  /**
   * Extract label patterns (#hashtag format)
   */
  private extractLabels(text: string, availableLabels: Label[]): LabelPattern[] {
    const labelRegex = /#(\w+)/g;
    const patterns: LabelPattern[] = [];
    let match;

    while ((match = labelRegex.exec(text)) !== null) {
      const labelName = match[1].toLowerCase();
      const matchedLabel = this.findMatchingLabel(labelName, availableLabels);

      patterns.push({
        type: 'label',
        text: match[0], // Full match including #
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        labelName: matchedLabel?.name || labelName,
        labelId: matchedLabel?.id,
        isExisting: !!matchedLabel,
      });
    }

    return patterns;
  }

  /**
   * Extract priority patterns (!!, #p1, p:1, etc.)
   */
  private extractPriorities(text: string): PriorityPattern[] {
    const patterns: PriorityPattern[] = [];

    // Pattern 1: !!, !!!, !
    const exclamationRegex = /(!{1,3})(?:\s|$)/g;
    let match;

    while ((match = exclamationRegex.exec(text)) !== null) {
      const count = match[1].length;
      const priority = Math.min(count, 3); // Map to 1-3

      patterns.push({
        type: 'priority',
        text: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        priority,
        displayText: this.getPriorityDisplayText(priority),
      });
    }

    // Pattern 2: #p1, #p2, #p3
    const hashPriorityRegex = /#p([0-3])\b/gi;
    while ((match = hashPriorityRegex.exec(text)) !== null) {
      const priority = parseInt(match[1], 10);

      patterns.push({
        type: 'priority',
        text: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        priority,
        displayText: this.getPriorityDisplayText(priority),
      });
    }

    // Pattern 3: p:0, p:1, p:2, p:3
    const colonPriorityRegex = /\bp:([0-3])\b/gi;
    while ((match = colonPriorityRegex.exec(text)) !== null) {
      const priority = parseInt(match[1], 10);

      patterns.push({
        type: 'priority',
        text: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        priority,
        displayText: this.getPriorityDisplayText(priority),
      });
    }

    // Remove duplicates (if same position detected by multiple patterns)
    return this.deduplicatePriorities(patterns);
  }

  /**
   * Remove pattern markers from text to get clean task title
   */
  private removePatterns(
    text: string,
    patterns: Array<DatePattern | LabelPattern | PriorityPattern>
  ): string {
    // Sort patterns by startIndex in reverse order
    const sorted = [...patterns].sort((a, b) => b.startIndex - a.startIndex);

    let cleanText = text;
    for (const pattern of sorted) {
      cleanText =
        cleanText.slice(0, pattern.startIndex) + cleanText.slice(pattern.endIndex);
    }

    // Clean up extra whitespace
    return cleanText.trim().replace(/\s+/g, ' ');
  }

  /**
   * Find matching label from available labels (fuzzy match)
   */
  private findMatchingLabel(labelName: string, availableLabels: Label[]): Label | undefined {
    const normalized = labelName.toLowerCase();

    // Exact match first
    const exactMatch = availableLabels.find((l) => l.name.toLowerCase() === normalized);
    if (exactMatch) return exactMatch;

    // Fuzzy match (starts with)
    const fuzzyMatch = availableLabels.find((l) =>
      l.name.toLowerCase().startsWith(normalized)
    );
    return fuzzyMatch;
  }

  /**
   * Determine confidence level for parsed date
   */
  private getDateConfidence(result: chrono.ParsedResult): 'high' | 'medium' | 'low' {
    // High confidence for explicit dates
    if (result.start.isCertain('day') && result.start.isCertain('month')) {
      return 'high';
    }

    // Medium confidence for relative dates
    if (result.text.match(/tomorrow|today|next|this/i)) {
      return 'high';
    }

    return 'medium';
  }

  /**
   * Format date for display
   */
  private formatDateDisplay(date: Date): string {
    const dayjsDate = dayjs(date);
    const today = dayjs().startOf('day');
    const tomorrow = today.add(1, 'day');

    if (dayjsDate.isSame(today, 'day')) {
      return 'Today';
    }
    if (dayjsDate.isSame(tomorrow, 'day')) {
      return 'Tomorrow';
    }

    // Show relative time if within next 7 days
    const diff = dayjsDate.diff(today, 'day');
    if (diff <= 7) {
      return dayjsDate.format('dddd, MMM D');
    }

    return dayjsDate.format('MMM D, YYYY');
  }

  /**
   * Get display text for priority level
   */
  private getPriorityDisplayText(priority: number): string {
    switch (priority) {
      case 3:
        return 'High priority';
      case 2:
        return 'Medium priority';
      case 1:
        return 'Low priority';
      default:
        return 'No priority';
    }
  }

  /**
   * Remove duplicate priority patterns
   */
  private deduplicatePriorities(patterns: PriorityPattern[]): PriorityPattern[] {
    const seen = new Set<string>();
    return patterns.filter((p) => {
      const key = `${p.startIndex}-${p.endIndex}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}
