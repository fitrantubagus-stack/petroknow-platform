import { KnowledgeEntry, EquipmentNode } from '../types';

export interface SearchMatchResult {
  entry: KnowledgeEntry;
  score: number; // 0 - 100
  matchedKeywords: string[];
  snippet: string;
  confidenceStatus: 'verified' | 'pending' | 'unverified';
}

export interface SystemIntentResult {
  type: 'greeting' | 'self_explanation';
  response: string;
}

/**
 * Lightweight heuristic intent-detection for greetings and self-explanation / meta questions
 */
export function detectAssistantIntent(query: string): SystemIntentResult | null {
  if (!query || typeof query !== 'string') return null;
  const raw = query.trim().toLowerCase();
  if (!raw) return null;

  // Clean common punctuation
  const cleaned = raw.replace(/[.,?!:;'"()\[\]{}~@#$%^&*_\-+=<>/\\]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleaned) return null;

  // 1. Check for standalone greetings
  const greetingPhrases = new Set([
    'hi', 'hello', 'hey', 'halo', 'helo', 'howdy', 'hola', 'yo',
    'good morning', 'good afternoon', 'good evening', 'good day', 'greetings',
    'hi there', 'hello there', 'hey there', 'halo there',
    'hi petroknow', 'hello petroknow', 'hey petroknow', 'halo petroknow',
    'good morning petroknow', 'good afternoon petroknow', 'good evening petroknow'
  ]);

  if (greetingPhrases.has(cleaned)) {
    return {
      type: 'greeting',
      response: "Hello! I'm the PetroKnow AI Knowledge Assistant. Ask me about equipment procedures, safety protocols, or maintenance tips — for example, try 'compressor vibration' or 'EQ-CMP-204 shutdown procedure'."
    };
  }

  // Regex check for greeting words with optional friendly address
  const isPureGreeting = /^(hi|hello|hey|halo|howdy|greetings|good\s+(morning|afternoon|evening|day))(\s+(there|all|team|assistant|petroknow|bot|ai|everyone))?$/i.test(cleaned);
  if (isPureGreeting) {
    return {
      type: 'greeting',
      response: "Hello! I'm the PetroKnow AI Knowledge Assistant. Ask me about equipment procedures, safety protocols, or maintenance tips — for example, try 'compressor vibration' or 'EQ-CMP-204 shutdown procedure'."
    };
  }

  // 2. Check for standalone help / question mark
  if (/^(help|help\s+me|\?|need\s+help|how\s+to\s+use|commands|menu)$/i.test(cleaned)) {
    return {
      type: 'self_explanation',
      response: "PetroKnow is an AI-powered manufacturing knowledge hub that unifies plant SOPs, verified expert knowledge, and physical equipment data into one searchable system. You can ask me operational questions, scan equipment QR codes or spare part barcodes, and every answer I give is cited and verification-tracked so you always know how trustworthy it is."
    };
  }

  // 3. Check for meta / self-explanation questions about the app
  const metaPatterns = [
    /what\s+is\s+(this\s+)?(website|web\s+app|web|app|application|system|platform|tool|petroknow)/i,
    /what\s+(is|does)\s+petroknow(\s+do)?/i,
    /who\s+are\s+you/i,
    /what\s+(can|do)\s+you\s+do/i,
    /how\s+does\s+(this\s+)?(website|app|system|platform|petroknow)\s+work/i,
    /what\s+is\s+the\s+purpose\s+of\s+(this\s+app|this\s+website|petroknow)/i,
    /tell\s+me\s+about\s+(this\s+app|this\s+website|petroknow)/i,
    /explain\s+(this\s+app|this\s+website|petroknow)/i,
    /about\s+petroknow/i,
    /what\s+is\s+this/i
  ];

  for (const pattern of metaPatterns) {
    if (pattern.test(cleaned)) {
      return {
        type: 'self_explanation',
        response: "PetroKnow is an AI-powered manufacturing knowledge hub that unifies plant SOPs, verified expert knowledge, and physical equipment data into one searchable system. You can ask me operational questions, scan equipment QR codes or spare part barcodes, and every answer I give is cited and verification-tracked so you always know how trustworthy it is."
      };
    }
  }

  return null;
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
