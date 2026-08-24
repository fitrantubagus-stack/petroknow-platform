import { KnowledgeEntry, EquipmentNode } from '../types';

export interface SearchMatchResult {
  entry: KnowledgeEntry;
  score: number; // 0 - 100
  matchedKeywords: string[];
  snippet: string;
  confidenceStatus: 'verified' | 'pending' | 'unverified';
}

/**
 * Tokenizes text and removes common English/technical stopwords
 */
function tokenize(text: string): string[] {
  const stopwords = new Set([
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'about', 'into', 'through', 'during', 'before',
    'after', 'above', 'below', 'under', 'how', 'what', 'where', 'when', 'why',
    'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'can', 'should',
    'could', 'would', 'do', 'does', 'did', 'having', 'be', 'been', 'being'
  ]);

  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2 && !stopwords.has(token));
}

/**
 * Real search & scoring function against knowledge base
 */
export function searchKnowledgeBase(
  query: string,
  entries: KnowledgeEntry[],
  equipmentList: EquipmentNode[] = [],
  includePending: boolean = false
): SearchMatchResult[] {
  if (!query || query.trim().length === 0) return [];

  const queryLower = query.toLowerCase().trim();
  const queryTokens = tokenize(query);

  if (queryTokens.length === 0 && queryLower.length < 3) return [];

  // Check if any equipment code was explicitly asked (e.g., "EQ-CMP-204" or "C-204" or "compressor")
  const matchedEquipmentCodes: string[] = [];
  equipmentList.forEach(eq => {
    const eqCode = eq.code.toLowerCase();
    const shortCode = eq.code.replace('EQ-', '').toLowerCase();
    if (queryLower.includes(eqCode) || queryLower.includes(shortCode)) {
      matchedEquipmentCodes.push(eq.id);
    }
  });

  const results: SearchMatchResult[] = [];

  for (const entry of entries) {
    // If not approved and not including pending, skip
    if (entry.status !== 'verified' && !includePending) {
      continue;
    }

    let score = 0;
    const matchedKeywords: string[] = [];

    const titleLower = entry.title.toLowerCase();
    const situationLower = entry.situation.toLowerCase();
    const contentLower = entry.content.toLowerCase();
    const tagsLower = entry.tags.map(t => t.toLowerCase());

    // 1. Direct equipment ID link bonus
    if (matchedEquipmentCodes.some(code => entry.linkedEquipmentIds.includes(code))) {
      score += 35;
      matchedKeywords.push('Equipment Match');
    }

    // 2. Exact phrase bonus in title
    if (titleLower.includes(queryLower)) {
      score += 45;
      matchedKeywords.push('Title Exact Match');
    }

    // 3. Keyword token matching
    for (const token of queryTokens) {
      let tokenHit = false;

      // Title match (high weight)
      if (titleLower.includes(token)) {
        score += 18;
        tokenHit = true;
      }

      // Tag match (high weight)
      if (tagsLower.some(tag => tag.includes(token))) {
        score += 15;
        tokenHit = true;
      }

      // Situation match (medium weight)
      if (situationLower.includes(token)) {
        score += 10;
        tokenHit = true;
      }

      // Content match (regular weight)
      if (contentLower.includes(token)) {
        score += 6;
        tokenHit = true;
      }

      if (tokenHit) {
        matchedKeywords.push(token);
      }
    }

    // Key steps matching
    if (entry.keySteps && entry.keySteps.length > 0) {
      for (const step of entry.keySteps) {
        const stepLower = step.toLowerCase();
        for (const token of queryTokens) {
          if (stepLower.includes(token)) {
            score += 5;
          }
        }
      }
    }

    // Cap score at 100
    const finalScore = Math.min(100, Math.round(score));

    // Threshold to be considered relevant
    if (finalScore >= 18) {
      // Generate excerpt snippet around best keyword
      let snippet = entry.situation;
      if (entry.content) {
        const sentences = entry.content.replace(/[#*]/g, '').split('\n').filter(s => s.trim().length > 20);
        if (sentences.length > 0) {
          const matchingSentence = sentences.find(s => 
            queryTokens.some(t => s.toLowerCase().includes(t))
          );
          if (matchingSentence) {
            snippet = matchingSentence.trim().slice(0, 240) + '...';
          } else {
            snippet = sentences[0].trim().slice(0, 240) + '...';
          }
        }
      }

      let confidenceStatus: 'verified' | 'pending' | 'unverified' = 'unverified';
      if (entry.status === 'verified') {
        confidenceStatus = 'verified';
      } else if (entry.status === 'pending') {
        confidenceStatus = 'pending';
      }

      results.push({
        entry,
        score: finalScore,
        matchedKeywords: Array.from(new Set(matchedKeywords)),
        snippet,
        confidenceStatus
      });
    }
  }

  // Sort by highest score first
  return results.sort((a, b) => b.score - a.score);
}
