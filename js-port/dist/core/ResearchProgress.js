"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResearchProgress = void 0;
/**
 * ResearchProgress tracks and manages the state of an ongoing research session
 */
class ResearchProgress {
    /**
     * Initialize a new ResearchProgress
     * @param initialQuery The initial research query
     */
    constructor(initialQuery) {
        this.initialQuery = initialQuery;
        this.queries = {};
        this.learnings = [];
        this.visitedUrls = {};
        this.queryRelationships = {};
        // Initialize with the root query
        this.queries[initialQuery] = {
            query: initialQuery,
            answer: '',
            depth: 0,
            sources: [],
            childQueries: []
        };
    }
    /**
     * Add a query result to the research progress
     * @param query The query text
     * @param answer The answer to the query
     * @param depth The depth level of the query
     * @param sources The sources for the answer
     * @param parentQuery The optional parent query
     */
    addQueryResult(query, answer, depth, sources = [], parentQuery) {
        // Add the query result if it doesn't exist
        if (!this.queries[query]) {
            this.queries[query] = {
                query,
                answer,
                depth,
                sources,
                childQueries: []
            };
            // Extract learnings from the answer
            this.extractLearnings(answer);
            // Add sources to visited URLs
            this.addSources(sources);
        }
        // If there's a parent query, establish the relationship
        if (parentQuery && this.queries[parentQuery]) {
            // Add as child to parent
            if (!this.queryRelationships[parentQuery]) {
                this.queryRelationships[parentQuery] = [];
            }
            if (!this.queryRelationships[parentQuery].includes(query)) {
                this.queryRelationships[parentQuery].push(query);
                // Update the child queries array in the parent
                const childQuery = this.queries[query];
                this.queries[parentQuery].childQueries.push(childQuery);
            }
        }
    }
    /**
     * Extract learnings from an answer
     * @param answer The answer to extract learnings from
     */
    extractLearnings(answer) {
        // Split the answer into paragraphs
        const paragraphs = answer.split('\n\n').filter(p => p.trim().length > 0);
        // Add non-duplicate, substantive paragraphs as learnings
        for (const paragraph of paragraphs) {
            const cleaned = paragraph.trim();
            // Skip short paragraphs, likely not substantive
            if (cleaned.length < 40)
                continue;
            // Skip if it's a duplicate or near-duplicate of existing learnings
            if (!this.isDuplicateLearning(cleaned)) {
                this.learnings.push(cleaned);
            }
        }
    }
    /**
     * Check if a learning is a duplicate
     * @param learning The learning to check
     * @returns Whether the learning is a duplicate
     */
    isDuplicateLearning(learning) {
        // Simple duplicate check - can be enhanced with similarity detection
        return this.learnings.some(existing => {
            // Exact match
            if (existing === learning)
                return true;
            // Significant overlap (contained within each other)
            if (existing.includes(learning) || learning.includes(existing))
                return true;
            return false;
        });
    }
    /**
     * Add sources to the visited URLs
     * @param sources The sources to add
     */
    addSources(sources) {
        for (const source of sources) {
            if (!this.visitedUrls[source.url]) {
                this.visitedUrls[source.url] = source;
            }
        }
    }
    /**
     * Get the research tree starting from the initial query
     * @returns The research tree
     */
    getResearchTree() {
        return this.queries[this.initialQuery];
    }
}
exports.ResearchProgress = ResearchProgress;
