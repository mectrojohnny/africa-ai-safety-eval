/**
 * Interface for a source of information
 */
export interface Source {
    url: string;
    title?: string;
}
/**
 * Interface for query result in the research tree
 */
export interface QueryResult {
    query: string;
    answer: string;
    depth: number;
    sources: Source[];
    childQueries: QueryResult[];
}
/**
 * ResearchProgress tracks and manages the state of an ongoing research session
 */
export declare class ResearchProgress {
    initialQuery: string;
    queries: Record<string, QueryResult>;
    learnings: string[];
    visitedUrls: Record<string, Source>;
    queryRelationships: Record<string, string[]>;
    /**
     * Initialize a new ResearchProgress
     * @param initialQuery The initial research query
     */
    constructor(initialQuery: string);
    /**
     * Add a query result to the research progress
     * @param query The query text
     * @param answer The answer to the query
     * @param depth The depth level of the query
     * @param sources The sources for the answer
     * @param parentQuery The optional parent query
     */
    addQueryResult(query: string, answer: string, depth: number, sources?: Source[], parentQuery?: string): void;
    /**
     * Extract learnings from an answer
     * @param answer The answer to extract learnings from
     */
    private extractLearnings;
    /**
     * Check if a learning is a duplicate
     * @param learning The learning to check
     * @returns Whether the learning is a duplicate
     */
    private isDuplicateLearning;
    /**
     * Add sources to the visited URLs
     * @param sources The sources to add
     */
    private addSources;
    /**
     * Get the research tree starting from the initial query
     * @returns The research tree
     */
    getResearchTree(): QueryResult;
}
