#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const server_1 = __importDefault(require("./server"));
// Load environment variables
dotenv_1.default.config();
// Get port from environment or use default
const PORT = process.env.PORT || 3001;
/**
 * Starts the API server
 */
const startServer = () => {
    // Start listening
    server_1.default.listen(PORT, () => {
        console.log(`API server running on port ${PORT}`);
        console.log(`API endpoints available:`);
        console.log(`- GET /health - Check API health`);
        console.log(`- POST /api/research/parameters - Get research parameters for a topic`);
        console.log(`- POST /api/research/questions - Generate follow-up questions`);
        console.log(`- POST /api/research - Perform deep research`);
        console.log(`- POST /api/research/report - Generate final report`);
    });
};
// Execute server start
startServer();
// Export the app for testing purposes
exports.default = server_1.default;
