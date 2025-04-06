"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const DeepSearch_1 = require("../core/DeepSearch");
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const router = (0, express_1.Router)();
// Initialize the Google Generative AI SDK
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_KEY || '');
// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Get research parameters
router.post('/api/research/parameters', async (req, res) => {
    try {
        const { topic } = req.body;
        if (!topic) {
            return res.status(400).json({ error: 'Topic is required' });
        }
        const deepSearch = new DeepSearch_1.DeepSearch(genAI);
        const parameters = await deepSearch.determineResearchBreadthAndDepth(topic);
        res.status(200).json(parameters);
    }
    catch (error) {
        console.error('Error getting research parameters:', error);
        res.status(500).json({ error: 'Failed to determine research parameters' });
    }
});
// Generate follow-up questions
router.post('/api/research/questions', async (req, res) => {
    try {
        const { topic, parameters, parentQuery } = req.body;
        if (!topic || !parameters) {
            return res.status(400).json({ error: 'Topic and parameters are required' });
        }
        const deepSearch = new DeepSearch_1.DeepSearch(genAI);
        const questions = await deepSearch.generateFollowUpQuestions(topic, parameters, parentQuery);
        res.status(200).json(questions);
    }
    catch (error) {
        console.error('Error generating follow-up questions:', error);
        res.status(500).json({ error: 'Failed to generate follow-up questions' });
    }
});
// Perform deep research
router.post('/api/research', async (req, res) => {
    try {
        const { topic, maxDepth, maxBreadth, includeSourceLinks } = req.body;
        if (!topic) {
            return res.status(400).json({ error: 'Topic is required' });
        }
        const deepSearch = new DeepSearch_1.DeepSearch(genAI);
        const researchProgress = await deepSearch.deepResearch(topic, maxDepth || 3, maxBreadth || 3, includeSourceLinks !== false);
        res.status(200).json(researchProgress);
    }
    catch (error) {
        console.error('Error performing deep research:', error);
        res.status(500).json({ error: 'Failed to perform deep research' });
    }
});
// Generate final report
router.post('/api/research/report', async (req, res) => {
    try {
        const { researchProgress, format } = req.body;
        if (!researchProgress) {
            return res.status(400).json({ error: 'Research progress data is required' });
        }
        const deepSearch = new DeepSearch_1.DeepSearch(genAI);
        const report = await deepSearch.generateFinalReport(researchProgress, format || 'markdown');
        res.status(200).json({ report });
    }
    catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
});
exports.default = router;
