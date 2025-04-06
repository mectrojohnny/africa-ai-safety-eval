import { GoogleGenerativeAI, GenerativeModel, GenerationConfig } from '@google/generative-ai';
import { z } from 'zod';
import dotenv from 'dotenv';
import { ResearchProgress } from './ResearchProgress';
import { ResearchParameters } from '../types';
import { RateLimiter } from '../utils/RateLimiter';

// Load environment variables
dotenv.config();

/**
 * Research mode type
 */
export type ResearchMode = 'fast' | 'balanced' | 'comprehensive';

/**
 * Research parameters schema
 */
const ResearchParametersSchema = z.object({
  breadth: z.number().int().min(1).max(10),
  depth: z.number().int().min(1).max(5),
  explanation: z.string(),
});

/**
 * Follow-up questions schema
 */
const FollowUpQuestionsSchema = z.object({
  follow_up_queries: z.array(z.string()),
});

/**
 * Query response schema
 */
const QueryResponseSchema = z.object({
  queries: z.array(z.string()),
});

/**
 * Learning schema
 */
const LearningSchema = z.object({
  learning: z.string(),
  relevance: z.number().min(0).max(10).optional(),
  sources: z.array(
    z.object({
      url: z.string().url(),
      title: z.string().optional(),
      snippet: z.string().optional(),
    })
  ).optional(),
});

/**
 * Research response schema
 */
const ResearchResponseSchema = z.object({
  learnings: z.array(z.string()),
  sources: z.array(
    z.object({
      url: z.string(),
      title: z.string().optional(),
      snippet: z.string().optional(),
    })
  ),
});

/**
 * Source schema
 */
export interface Source {
  url: string;
  title?: string;
  snippet?: string;
}

/**
 * Research results interface
 */
export interface ResearchResults {
  learnings: string[];
  visited_urls: Record<string, Source>;
}

/**
 * Utility function to extract JSON from text that might be wrapped in markdown code blocks
 * @param text The text that may contain JSON
 * @returns Cleaned text ready for JSON parsing
 */
function extractJsonFromText(text: string): string {
  // Remove markdown code block syntax if present
  const jsonRegex = /```(?:json)?\s*(\{[\s\S]*?\})\s*```/;
  const match = text.match(jsonRegex);
  
  if (match && match[1]) {
    return match[1];
  }
  
  // If no code block found, return the original text
  return text;
}

/**
 * DeepSearch class for performing deep research on topics
 */
export class DeepSearch {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private mode: ResearchMode;
  private queryHistory: Set<string>;
  private progress: ResearchProgress | null = null;
  private rateLimiter: RateLimiter;

  /**
   * Initialize DeepSearch with a Google Generative AI instance
   * 
   * @param genAI The Google Generative AI instance
   * @param mode The research mode
   */
  constructor(genAI: GoogleGenerativeAI, mode: ResearchMode = 'balanced') {
    this.genAI = genAI;
    this.mode = mode;
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    this.queryHistory = new Set<string>();
    
    // Initialize rate limiter with mode-specific settings
    let rateLimiterDelay = 1000; // Default 1 second
    
    switch (mode) {
      case 'fast':
        rateLimiterDelay = 1000; // 1 second
        break;
      case 'balanced':
        rateLimiterDelay = 2000; // 2 seconds
        break;
      case 'comprehensive':
        rateLimiterDelay = 3000; // 3 seconds
        break;
    }
    
    this.rateLimiter = new RateLimiter(rateLimiterDelay);
  }

  /**
   * Determine the appropriate research breadth and depth based on the query complexity
   * @param query The initial query
   * @returns The research parameters (breadth, depth, explanation)
   */
  async determineResearchBreadthAndDepth(query: string): Promise<ResearchParameters> {
    const userPrompt = `
      Analyze this research query and determine the appropriate breadth (number of parallel search queries) 
      and depth (levels of follow-up questions) needed for thorough research:

      Query: ${query}

      Consider:
      1. Complexity of the topic
      2. Breadth of knowledge required
      3. Depth of expertise needed
      4. Potential for follow-up exploration

      Return a JSON object with:
      - "breadth": integer between 1-10 (number of parallel search queries)
      - "depth": integer between 1-5 (levels of follow-up questions)
      - "explanation": brief explanation of your reasoning
    `;

    const generationConfig: GenerationConfig = {
      temperature: 0.2,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 1024,
    };

    try {
      const result = await this.rateLimitedApiCall(() => this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig,
      }));

      const response = result.response;
      const text = response.text();
      // Extract JSON from the text in case it's wrapped in markdown code blocks
      const cleanedText = extractJsonFromText(text);
      const parsed = JSON.parse(cleanedText);
      
      // Validate the parsed response
      const validated = ResearchParametersSchema.parse(parsed);
      return {
        breadth: validated.breadth,
        depth: validated.depth
      };
    } catch (error) {
      console.error(`Error determining research parameters: ${error}`);
      
      // Default values based on mode
      const defaults: Record<ResearchMode, ResearchParameters> = {
        fast: { breadth: 3, depth: 1 },
        balanced: { breadth: 5, depth: 2 },
        comprehensive: { breadth: 7, depth: 3 },
      };
      
      return defaults[this.mode] || defaults.balanced;
    }
  }

  /**
   * Generate follow-up questions based on the query
   * @param query The initial query
   * @param parameters The research parameters
   * @param parentQuery The optional parent query for context
   * @returns An array of follow-up questions
   */
  async generateFollowUpQuestions(
    query: string, 
    parameters: ResearchParameters,
    parentQuery?: string
  ): Promise<string[]> {
    const maxQuestions = parameters.breadth || 3;
    const contextPrompt = parentQuery 
      ? `\nThis is a follow-up to the parent query: "${parentQuery}"`
      : '';

    const userPrompt = `
      Based on the following user query, generate ${maxQuestions} follow-up questions that would help explore this topic in more depth.
      These questions should:
      1. Explore different aspects of the topic
      2. Investigate causes, effects, and relationships
      3. Consider multiple perspectives
      4. Examine specific examples or case studies
      5. Look for connections to related topics${contextPrompt}

      Main Query: ${query}

      Format your response as a JSON object with a single key "follow_up_queries" containing an array of strings.
      Example:
      \`\`\`json
      {
        "follow_up_queries": [
          "Could you specify what aspects of electric vehicles you're most interested in learning about?",
          "Are you looking for information about a specific brand or type of electric vehicle?",
          "Would you like to know about the technical details, environmental impact, or consumer aspects?"
        ]
      }
      \`\`\`
    `;

    const generationConfig: GenerationConfig = {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 1024,
    };

    try {
      const result = await this.rateLimitedApiCall(() => this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig,
      }));

      const response = result.response;
      const text = response.text();
      
      try {
        // Extract JSON from the text in case it's wrapped in markdown code blocks
        const cleanedText = extractJsonFromText(text);
        const parsed = JSON.parse(cleanedText);
        const validated = FollowUpQuestionsSchema.parse(parsed);
        return validated.follow_up_queries;
      } catch (parseError) {
        console.error(`Error parsing follow-up questions: ${parseError}`);
        
        // Try to extract questions from the text if JSON parsing fails
        const questions = text.split('\n')
          .filter(line => line.trim().length > 0)
          .filter(line => line.includes('?'))
          .map(line => line.trim())
          .slice(0, maxQuestions);
        
        return questions.length > 0 ? questions : [`More information about ${query}?`];
      }
    } catch (error) {
      console.error(`Error generating follow-up questions: ${error}`);
      return [`More information about ${query}?`];
    }
  }

  /**
   * Generate queries based on a query and learnings
   * @param query The query to generate sub-queries from
   * @param numQueries The number of queries to generate
   * @param previousQueries The previous queries to avoid duplicating
   * @returns An array of generated queries
   */
  async generateQueries(
    query: string,
    numQueries: number,
    previousQueries: string[] = []
  ): Promise<string[]> {
    const prompt = `
      Based on the research topic: "${query}"
      
      Generate ${numQueries} specific search queries that would help gather comprehensive information on this topic.
      These queries should:
      1. Be diverse and cover different aspects of the topic
      2. Be specific enough to get relevant results
      3. Be phrased as questions or clear search terms
      4. Not repeat information from each other
      
      Format your response as a JSON object with a "queries" array containing the generated queries.
      Example:
      {
        "queries": [
          "What are the environmental impacts of electric vehicles?",
          "How do electric vehicle batteries affect carbon footprint?",
          "Compare electric vehicle vs. gasoline vehicle lifecycle emissions"
        ]
      }
    `;
    
    const generationConfig: GenerationConfig = {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 1024,
    };
    
    try {
      const result = await this.rateLimitedApiCall(() => this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
      }));
      
      const response = result.response;
      const text = response.text();
      
      try {
        // Fix: Extract JSON from the text in case it's wrapped in markdown code blocks
        const cleanedText = extractJsonFromText(text);
        const parsed = JSON.parse(cleanedText);
        const validated = QueryResponseSchema.parse(parsed);
        
        // Filter out queries that are too similar to previous ones
        const filteredQueries = validated.queries.filter(
          q => !this.isSimilarToExistingQueries(q, previousQueries)
        );
        
        return filteredQueries.slice(0, numQueries);
      } catch (parseError) {
        console.error(`Error parsing generated queries: ${parseError}`);
        
        // Extract queries from text if JSON parsing fails
        const queries = text.split('\n')
          .filter(line => line.includes('?') || (line.length > 15 && !line.startsWith('{')))
          .map(line => line.replace(/^\d+\.\s*|"/g, '').trim())
          .filter(line => line.length > 10);
        
        return queries.slice(0, numQueries);
      }
    } catch (error) {
      console.error(`Error generating queries: ${error}`);
      return [];
    }
  }

  /**
   * Check if two queries are similar
   * @param query1 The first query to compare
   * @param query2 The second query to compare
   * @returns True if the queries are similar, false otherwise
   */
  private areQueriesSimilar(query1: string, query2: string): boolean {
    // Normalize the queries
    const normalize = (q: string): string => {
      return q.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    };
    
    const normalizedQuery1 = normalize(query1);
    const normalizedQuery2 = normalize(query2);
    
    // Check for exact match
    if (normalizedQuery1 === normalizedQuery2) {
      return true;
    }
    
    // Check if one query is contained in the other
    if (normalizedQuery1.includes(normalizedQuery2) || normalizedQuery2.includes(normalizedQuery1)) {
      return true;
    }
    
    // Check for significant word overlap
    const words1 = new Set(normalizedQuery1.split(' ').filter(w => w.length > 3));
    const words2 = new Set(normalizedQuery2.split(' ').filter(w => w.length > 3));
    
    if (words1.size === 0 || words2.size === 0) {
      return false;
    }
    
    // Count matching significant words
    let matchCount = 0;
    for (const word of words1) {
      if (words2.has(word)) {
        matchCount++;
      }
    }
    
    // Calculate overlap ratio
    const overlapRatio = matchCount / Math.min(words1.size, words2.size);
    
    // If more than 70% of words overlap, consider them similar
    return overlapRatio > 0.7;
  }

  /**
   * Get the maximum concurrent queries based on mode
   * @returns The maximum number of concurrent queries
   */
  private getMaxConcurrentQueries(): number {
    const concurrencyByMode: Record<ResearchMode, number> = {
      fast: 5,
      balanced: 3,
      comprehensive: 2
    };
    
    return concurrencyByMode[this.mode] || 3;
  }

  /**
   * Research a single query
   * @param query The query to research
   * @param includeSourceLinks Whether to include source links
   * @returns The research result
   */
  private async researchSingleQuery(
    query: string,
    includeSourceLinks: boolean
  ): Promise<{ answer: string; sources?: { url: string; title: string }[] }> {
    const prompt = `
      Provide a thorough answer to the following research question:
      
      "${query}"
      
      Your answer should:
      1. Be comprehensive and informative
      2. Include relevant facts, data, and examples
      3. Consider multiple perspectives if applicable
      4. Be well-structured and clear
      5. Cite any specific sources of information
      
      If sources are mentioned, include them in a structured format at the end.
    `;
    
    const generationConfig: GenerationConfig = {
      temperature: 0.2,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 2048,
    };
    
    try {
      const result = await this.rateLimitedApiCall(() => this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
      }));
      
      const response = result.response;
      const answerText = response.text();
      
      // Extract sources if needed
      let sources: { url: string; title: string }[] | undefined;
      
      if (includeSourceLinks) {
        sources = this.extractSourcesFromText(answerText);
      }
      
      return {
        answer: answerText,
        sources,
      };
    } catch (error) {
      console.error(`Error researching query "${query}":`, error);
      return {
        answer: `Failed to research: ${error}`,
      };
    }
  }

  /**
   * Extract sources from text
   * @param text The text to extract sources from
   * @returns The extracted sources
   */
  private extractSourcesFromText(text: string): { url: string; title: string }[] {
    const sources: { url: string; title: string }[] = [];
    
    // Look for URLs in the text
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = text.match(urlRegex) || [];
    
    // Extract titles for URLs if possible
    urls.forEach(url => {
      // Try to find a title before the URL
      const titleMatch = new RegExp(`([^.!?\\r\\n]+)[.!?\\r\\n]*\\s*${url.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}`).exec(text);
      let title = titleMatch ? titleMatch[1].trim() : 'Source';
      
      // Clean up the title
      title = title.replace(/^[\s-]*|[\s-]*$/g, '');
      
      // Add the source if it's not already in the list
      if (!sources.some(s => s.url === url)) {
        sources.push({ url, title });
      }
    });
    
    return sources;
  }

  /**
   * Check if a query is similar to existing queries
   * @param query The query to check
   * @param existingQueries The existing queries to check against
   * @returns True if the query is similar to any existing query, false otherwise
   */
  private isSimilarToExistingQueries(query: string, existingQueries: string[] | Set<string>): boolean {
    const queries = Array.isArray(existingQueries) ? existingQueries : Array.from(existingQueries);
    return queries.some(existingQuery => this.areQueriesSimilar(query, existingQuery));
  }

  /**
   * Process a query at a specific depth
   * @param query The query to process
   * @param currentDepth The current depth
   * @param maxDepth The maximum depth
   * @param maxBreadth The maximum breadth
   * @param includeSourceLinks Whether to include source links
   */
  private async processQuery(
    query: string,
    currentDepth: number,
    maxDepth: number,
    maxBreadth: number,
    includeSourceLinks: boolean
  ): Promise<void> {
    if (!this.progress) {
      this.progress = new ResearchProgress(query);
    }

    // Add the query to the history to avoid duplicates
    if (this.queryHistory.has(query)) {
      return;
    }
    this.queryHistory.add(query);

    // Research the current query
    const result = await this.researchSingleQuery(query, includeSourceLinks);
    
    // Update the progress with the result
    this.progress.addQueryResult(query, result.answer, currentDepth, result.sources || []);
    
    // If we've reached the maximum depth, stop here
    if (currentDepth >= maxDepth) {
      return;
    }
    
    // Generate follow-up questions for the next level
    const params: ResearchParameters = { breadth: maxBreadth, depth: maxDepth };
    const followUpQuestions = await this.generateFollowUpQuestions(query, params);
    
    // Process each follow-up question
    const followUpPromises = followUpQuestions
      .slice(0, maxBreadth)
      .map(question => this.processQuery(question, currentDepth + 1, maxDepth, maxBreadth, includeSourceLinks));
    
    await Promise.all(followUpPromises);
  }

  /**
   * Perform deep research on a topic
   * @param topic The topic to research
   * @param maxDepth The maximum depth of research
   * @param maxBreadth The maximum breadth of research
   * @param includeSourceLinks Whether to include source links in the research
   * @returns The research progress with results
   */
  async deepResearch(
    topic: string, 
    maxDepth: number = 3, 
    maxBreadth: number = 3,
    includeSourceLinks: boolean = true
  ): Promise<ResearchProgress> {
    this.progress = new ResearchProgress(topic);
    
    // Start with the initial query
    await this.processQuery(topic, 0, maxDepth, maxBreadth, includeSourceLinks);
    
    return this.progress;
  }

  /**
   * Generate a final report from the research progress
   * @param researchProgress The research progress
   * @param format The desired output format
   * @returns The final report
   */
  async generateFinalReport(
    researchProgress: ResearchProgress,
    format: 'text' | 'markdown' | 'html' = 'markdown'
  ): Promise<string> {
    const { initialQuery, learnings, visitedUrls } = researchProgress;
    
    const prompt = `
      Create a comprehensive research report on the topic: "${initialQuery}"
      
      Based on the following research findings:
      ${learnings.map((learning, i) => `${i + 1}. ${learning}`).join('\n')}
      
      ${Object.keys(visitedUrls).length > 0 ? `
      Sources:
      ${Object.values(visitedUrls).map((source, i) => 
        `${i + 1}. ${source.title || 'Source'} - ${source.url}`
      ).join('\n')}
      ` : ''}
      
      Your report should:
      1. Start with an executive summary
      2. Include an introduction to the topic
      3. Organize findings by themes or categories
      4. Present balanced perspectives when there are differing viewpoints
      5. Include a conclusion with key takeaways
      6. Provide properly formatted citations for all sources
      
      Format the report in ${format} format.
    `;
    
    const generationConfig: GenerationConfig = {
      temperature: 0.2,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 4096,
    };
    
    try {
      const result = await this.rateLimitedApiCall(() => this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
      }));
      
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error(`Error generating final report: ${error}`);
      return `Failed to generate report: ${error}`;
    }
  }

  private async rateLimitedApiCall<T>(fn: () => Promise<T>): Promise<T> {
    return this.rateLimiter.execute(fn);
  }
} 