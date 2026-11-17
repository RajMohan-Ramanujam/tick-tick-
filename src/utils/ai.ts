// ApexFlow AI Productivity Engine
// Smart Task Breakdown Generator & Natural Language Processing (NLP) Parser

import { Priority } from '../types';

export interface AISubtaskSuggestion {
  title: string;
  estimatedPomodoros: number;
  priority: Priority;
}

export interface AIBreakdownResult {
  mainTitle: string;
  suggestedPriority: Priority;
  suggestedPomodoros: number;
  subtasks: AISubtaskSuggestion[];
  suggestedTags: string[];
}

export class AIParentEngine {
  /**
   * Generates a structured breakdown of subtasks & pomodoro estimates for any goal.
   */
  static breakdownGoal(goalTitle: string): AIBreakdownResult {
    const cleanTitle = goalTitle.trim();
    const lower = cleanTitle.toLowerCase();

    let suggestedPriority: Priority = 'medium';
    let suggestedPomodoros = 3;
    let suggestedTags: string[] = ['ai-generated'];
    let subtasks: AISubtaskSuggestion[] = [];

    if (lower.includes('website') || lower.includes('app') || lower.includes('code') || lower.includes('software')) {
      suggestedPriority = 'high';
      suggestedPomodoros = 6;
      suggestedTags.push('development', 'tech');
      subtasks = [
        { title: 'Define project scope & architectural requirements', estimatedPomodoros: 2, priority: 'high' },
        { title: 'Create UI mockups & component design system', estimatedPomodoros: 2, priority: 'high' },
        { title: 'Develop core frontend components & state management', estimatedPomodoros: 3, priority: 'high' },
        { title: 'Integrate backend API & database persistence', estimatedPomodoros: 2, priority: 'medium' },
        { title: 'Perform QA testing & production deployment', estimatedPomodoros: 1, priority: 'medium' },
      ];
    } else if (lower.includes('workout') || lower.includes('fitness') || lower.includes('health') || lower.includes('gym')) {
      suggestedPriority = 'medium';
      suggestedPomodoros = 2;
      suggestedTags.push('fitness', 'wellness');
      subtasks = [
        { title: 'Dynamic warmup & mobility stretching (10 mins)', estimatedPomodoros: 1, priority: 'medium' },
        { title: 'Main compound training workout routine', estimatedPomodoros: 2, priority: 'high' },
        { title: 'Post-workout cooldown & hydration recovery', estimatedPomodoros: 1, priority: 'low' },
      ];
    } else if (lower.includes('study') || lower.includes('exam') || lower.includes('course') || lower.includes('book')) {
      suggestedPriority = 'high';
      suggestedPomodoros = 4;
      suggestedTags.push('learning', 'study');
      subtasks = [
        { title: 'Review core concepts & chapter outlines', estimatedPomodoros: 2, priority: 'high' },
        { title: 'Solve practice problems & flashcard exercises', estimatedPomodoros: 2, priority: 'high' },
        { title: 'Summarize key takeaways in markdown notes', estimatedPomodoros: 1, priority: 'medium' },
      ];
    } else {
      // General Task Breakdown Fallback
      suggestedPriority = 'medium';
      suggestedPomodoros = 3;
      suggestedTags.push('planning');
      subtasks = [
        { title: `Initial research & preparation for ${cleanTitle}`, estimatedPomodoros: 1, priority: 'medium' },
        { title: `Execute core work items for ${cleanTitle}`, estimatedPomodoros: 2, priority: 'high' },
        { title: `Review results & finalize deliverables`, estimatedPomodoros: 1, priority: 'low' },
      ];
    }

    return {
      mainTitle: cleanTitle,
      suggestedPriority,
      suggestedPomodoros,
      subtasks,
      suggestedTags,
    };
  }

  /**
   * Smart NLP Task Parser extracting title, dates, tags, and priorities.
   */
  static parseNaturalLanguage(inputText: string): {
    title: string;
    priority: Priority;
    dueDate: string | null;
    tags: string[];
  } {
    let text = inputText;
    let priority: Priority = 'none';
    let dueDate: string | null = null;
    const tags: string[] = [];

    // Priority Detection (!high, !medium, !low)
    if (text.includes('!high') || text.includes('!urgent')) {
      priority = 'high';
      text = text.replace(/!(high|urgent)/gi, '');
    } else if (text.includes('!med') || text.includes('!medium')) {
      priority = 'medium';
      text = text.replace(/!(med|medium)/gi, '');
    } else if (text.includes('!low')) {
      priority = 'low';
      text = text.replace(/!low/gi, '');
    }

    // Tag Extraction (#work, #coding)
    const tagMatches = text.match(/#(\w+)/g);
    if (tagMatches) {
      tagMatches.forEach((t) => {
        tags.push(t.replace('#', ''));
        text = text.replace(t, '');
      });
    }

    // Date Detection (today, tomorrow)
    const today = new Date();
    const lowerText = text.toLowerCase();

    if (lowerText.includes('today')) {
      dueDate = today.toISOString().split('T')[0];
      text = text.replace(/today/gi, '');
    } else if (lowerText.includes('tomorrow')) {
      const tom = new Date(today);
      tom.setDate(today.getDate() + 1);
      dueDate = tom.toISOString().split('T')[0];
      text = text.replace(/tomorrow/gi, '');
    }

    return {
      title: text.trim(),
      priority,
      dueDate,
      tags,
    };
  }
}
