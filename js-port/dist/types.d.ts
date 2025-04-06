/**
 * Types for the Gemini Deep Research project
 */
/**
 * Research parameters for determining research breadth and depth
 */
export interface ResearchParameters {
    /**
     * The number of branches at each level of the research tree
     */
    breadth: number;
    /**
     * The depth of the research tree
     */
    depth: number;
}
/**
 * Research mode for controlling the research approach
 */
export type ResearchMode = 'fast' | 'balanced' | 'comprehensive';
/**
 * Information about a visited URL
 */
export interface UrlInfo {
    /**
     * The URL that was visited
     */
    url: string;
    /**
     * The title of the page that was visited
     */
    title: string;
}
/**
 * A mapping of URLs to their information
 */
export interface VisitedUrls {
    [url: string]: UrlInfo;
}
/**
 * A research query and its answer
 */
export interface QueryResult {
    /**
     * The query that was asked
     */
    query: string;
    /**
     * The answer to the query
     */
    answer: string;
    /**
     * URLs that were visited to answer the query
     */
    sources?: UrlInfo[];
}
/**
 * Format options for report generation
 */
export type ReportFormat = 'markdown' | 'plain' | 'html';
