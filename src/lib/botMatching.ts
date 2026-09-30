import type { ChatbotFAQ } from '@/types';

/**
 * Normalizes Thai text for fuzzy matching by removing common particles,
 * spaces, and special symbols.
 */
export function normalizeThaiText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[\s\?\!\.\,\-\_\:\;\'\"()\[\]{}~`@#$%^&*+=/\\]/g, '')
    // Remove polite / conversational ending particles
    .replace(/(ครับ|ค่ะ|นะคะ|คะ|จ้า|คับ|ฮะ|นะคับ|นะจ๊ะ|จ๊ะ|จ้ะ|หน่อยครับ|หน่อยค่ะ|หน่อย|มั้ย|ไหม|เอ่ย|อ่ะ|อะ|หวัดดี|สวัสดี)/g, '');
}

/**
 * Result of matching a query against FAQs
 */
export interface MatchResult {
  matched: ChatbotFAQ | null;
  score: number;
  matchedKeyword?: string;
  confidence: 'high' | 'medium' | 'low' | 'none';
}

/**
 * Intelligent FAQ Matcher for Thai woodwork chatbot.
 * Uses exact match, substring match, normalized particle-stripped match,
 * and semantic keyword intersection scoring.
 */
export function matchFaq(rawQuery: string, faqs: ChatbotFAQ[]): MatchResult {
  if (!rawQuery || !rawQuery.trim() || !faqs || faqs.length === 0) {
    return { matched: null, score: 0, confidence: 'none' };
  }

  const queryLower = rawQuery.toLowerCase().trim();
  const queryNorm = normalizeThaiText(rawQuery);

  let bestFaq: ChatbotFAQ | null = null;
  let highestScore = 0;
  let bestKeyword = '';

  const activeFaqs = faqs.filter((f) => f.is_active !== false);

  for (const faq of activeFaqs) {
    let faqScore = 0;
    let localBestKw = '';

    // Check FAQ title if present
    if (faq.title) {
      const titleLower = faq.title.toLowerCase();
      const titleNorm = normalizeThaiText(faq.title);
      if (queryLower === titleLower || queryNorm === titleNorm) {
        faqScore += 90;
        localBestKw = faq.title;
      } else if (queryLower.includes(titleLower) || (titleNorm.length >= 3 && queryNorm.includes(titleNorm))) {
        faqScore += 45;
        localBestKw = faq.title;
      }
    }

    // Check each question pattern
    for (const pattern of faq.question_pattern) {
      const pat = pattern.trim();
      if (!pat) continue;

      const patLower = pat.toLowerCase();
      const patNorm = normalizeThaiText(pat);

      // 1. Exact match (High Priority)
      if (queryLower === patLower || queryNorm === patNorm) {
        const score = 100 + pat.length * 2;
        if (score > faqScore) {
          faqScore = score;
          localBestKw = pat;
        }
        continue;
      }

      // 2. Query contains exact pattern substring
      if (queryLower.includes(patLower)) {
        const score = 60 + patLower.length * 3;
        if (score > faqScore) {
          faqScore = score;
          localBestKw = pat;
        }
        continue;
      }

      // 3. Normalized query contains normalized pattern
      if (patNorm.length >= 2 && queryNorm.includes(patNorm)) {
        const score = 50 + patNorm.length * 3;
        if (score > faqScore) {
          faqScore = score;
          localBestKw = pat;
        }
        continue;
      }

      // 4. Pattern contains query (user typed short keyword like "ปลวก", "พิกัด", "ราคา")
      if (patLower.includes(queryLower) && queryLower.length >= 3) {
        const score = 40 + queryLower.length * 2;
        if (score > faqScore) {
          faqScore = score;
          localBestKw = pat;
        }
        continue;
      }

      // 5. Special token / multi-word intersection (e.g. "โรงงาน" + "ที่ไหน" in "โรงงานอยู่ที่ไหน")
      const words = pat.split(/\s+/).filter(Boolean);
      if (words.length > 1) {
        const allWordsPresent = words.every((w) => queryLower.includes(w.toLowerCase()));
        if (allWordsPresent) {
          const score = 65 + pat.length * 2;
          if (score > faqScore) {
            faqScore = score;
            localBestKw = pat;
          }
        }
      }
    }

    // Dynamic synonym / conceptual associations for Thai woodwork
    // Location association
    if (faq.category === 'location') {
      const hasLocNoun = queryLower.includes('โรงงาน') || queryLower.includes('ร้าน') || queryLower.includes('ที่ตั้ง') || queryLower.includes('พิกัด') || queryLower.includes('สถานที่');
      const hasLocWhere = queryLower.includes('ไหน') || queryLower.includes('อยู่') || queryLower.includes('เดินทาง') || queryLower.includes('แผนที่') || queryLower.includes('เพชรบุรี') || queryLower.includes('ตั้งอยู่');
      if (hasLocNoun && hasLocWhere) {
        faqScore += 45;
        if (!localBestKw) localBestKw = 'ที่ตั้ง/พิกัดโรงงาน';
      }
    }

    // Price association
    if (faq.category === 'pricing') {
      const hasPriceWord = queryLower.includes('ราคา') || queryLower.includes('เท่าไหร่') || queryLower.includes('กี่บาท') || queryLower.includes('ตีราคา') || queryLower.includes('แพง');
      if (hasPriceWord) {
        faqScore += 35;
        if (!localBestKw) localBestKw = 'สอบถามราคา';
      }
    }

    // Own wood association
    if (faq.category === 'wood_quality' && (faq.id.includes('1') || faq.title?.includes('มีไม้มาเอง') || faq.answer.includes('นำมาเอง'))) {
      const hasOwnWood = (queryLower.includes('ไม้') && (queryLower.includes('ตัวเอง') || queryLower.includes('มาเอง'))) || queryLower.includes('ค่าแรง');
      if (hasOwnWood) {
        faqScore += 50;
        if (!localBestKw) localBestKw = 'มีไม้มาเอง';
      }
    }

    if (faqScore > highestScore) {
      highestScore = faqScore;
      bestFaq = faq;
      bestKeyword = localBestKw;
    }
  }

  // Threshold evaluation: score >= 35 considered a match
  if (highestScore >= 60) {
    return { matched: bestFaq, score: highestScore, matchedKeyword: bestKeyword, confidence: 'high' };
  } else if (highestScore >= 35) {
    return { matched: bestFaq, score: highestScore, matchedKeyword: bestKeyword, confidence: 'medium' };
  } else if (highestScore > 0) {
    return { matched: bestFaq, score: highestScore, matchedKeyword: bestKeyword, confidence: 'low' };
  }

  return { matched: null, score: 0, confidence: 'none' };
}
