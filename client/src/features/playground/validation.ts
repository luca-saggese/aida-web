import type { Question } from '../../types';
import type { ValidationIssue } from '../../stores/playgroundStore';

export function validateQuestions(questions: Record<string, Question>): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (Object.keys(questions).length === 0) {
    issues.push({ questionKey: '', message: 'At least one question is required' });
    return issues;
  }

  for (const [key, q] of Object.entries(questions)) {
    if (!q || typeof q !== 'object') {
      issues.push({ questionKey: key, message: 'Question must be an object' });
      continue;
    }

    const type = (q as Question).type;
    if (!['noul', 'choice', 'score'].includes(type)) {
      issues.push({ questionKey: key, message: 'Invalid primitive type' });
    }

    if (!('instructions' in q) || q.instructions === '') {
      issues.push({ questionKey: key, message: 'Instructions are required' });
    }

    if (type === 'choice') {
      const criteria = (q as Extract<Question, { type: 'choice' }>).criteria;
      if (!criteria || Object.keys(criteria).length === 0) {
        issues.push({ questionKey: key, message: 'Choice requires at least one option' });
      } else if (Object.keys(criteria).length > 255) {
        issues.push({ questionKey: key, message: 'Choice supports at most 255 options' });
      }
    }

    if (type === 'score') {
      const criteria = (q as Extract<Question, { type: 'score' }>).criteria;
      if (!Array.isArray(criteria) || criteria.length < 2) {
        issues.push({ questionKey: key, message: 'Score requires at least 2 levels' });
      } else if (criteria.length > 10) {
        issues.push({ questionKey: key, message: 'Score supports at most 10 levels' });
      }
    }
  }

  return issues;
}

/** Detect whether the raw text parses as valid JSON. */
export function jsonIsValid(text: string): boolean {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
}