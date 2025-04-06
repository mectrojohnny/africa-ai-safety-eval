import { GoogleGenerativeAI } from '@google/generative-ai';
import { ResearchProgress } from './ResearchProgress';
import { ResearchParameters } from '../types';
/**
 * Research mode type
 */
export type ResearchMode = 'fast' | 'balanced' | 'comprehensive';
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
 * DeepSearch class for performing deep research on topics
 */
export declare class DeepSearch {
    private genAI;
    private model;
    private mode;
    private queryHistory;
    private progress;
    private rateLimiter;
    /**
     * Initialize DeepSearch with a Google Generative AI instance
     *
     * @param genAI The Google Generative AI instance
     * @param mode The research mode
     */
    constructor(genAI: GoogleGenerativeAI, mode?: ResearchMode);
    /**
     * Determine the appropriate research breadth and depth based on the query complexity
     * @param query The initial query
     * @returns The research parameters (breadth, depth, explanation)
     */
    determineResearchBreadthAndDepth(query: string): Promise<ResearchParameters>;
    /**
     * Generate follow-up questions based on the query
     * @param query The initial query
     * @param parameters The research parameters
     * @param parentQuery The optional parent query for context
     * @returns An array of follow-up questions
     */
    generateFollowUpQuestions(query: string, parameters: ResearchParameters, parentQuery?: string): Promise<string[]>;
    /**
     * Generate queries based on a query and learnings
     * @param query The query to generate sub-queries from
     * @param numQueries The number of queries to generate
     * @param previousQueries The previous queries to avoid duplicating
     * @returns An array of generated queries
     */
    generateQueries(query: string, numQueries: number, previousQueries?: string[]): Promise<string[]>;
    /**
     * Check if two queries are similar
     * @param query1 The first query to compare
     * @param query2 The second query to compare
     * @returns True if the queries are similar, false otherwise
     */
    private areQueriesSimilar;
    /**
     * Get the maximum concurrent queries based on mode
     * @returns The maximum number of concurrent queries
     */
    private getMaxConcurrentQueries;
    /**
     * Research a single query
     * @param query The query to research
     * @param includeSourceLinks Whether to include source links
     * @returns The research result
     */
    private researchSingleQuery;
    /**
     * Extract sources from text
     * @param text The text to extract sources from
     * @returns The extracted sources
     */
    private extractSourcesFromText;
    /**
     * Check if a query is similar to existing queries
     * @param query The query to check
     * @param existingQueries The existing queries to check against
     * @returns True if the query is similar to any existing query, false otherwise
     */
    private isSimilarToExistingQueries;
    /**
     * Process a query at a specific depth
     * @param query The query to process
     * @param currentDepth The current depth
     * @param maxDepth The maximum depth
     * @param maxBreadth The maximum breadth
     * @param includeSourceLinks Whether to include source links
     */
    private processQuery;
    /**
     * Perform deep research on a topic
     * @param topic The topic to research
     * @param maxDepth The maximum depth of research
     * @param maxBreadth The maximum breadth of research
     * @param includeSourceLinks Whether to include source links in the research
     * @returns The research progress with results
     */
    deepResearch(topic: string, maxDepth?: number, maxBreadth?: number, includeSourceLinks?: boolean): Promise<ResearchProgress>;
    /**
     * Generate a final report from the research progress
     * @param researchProgress The research progress
     * @param format The desired output format
     * @returns The final report
     */
    generateFinalReport(researchProgress: ResearchProgress, format?: 'text' | 'markdown' | 'html'): Promise<string>;
    private rateLimitedApiCall;
}
