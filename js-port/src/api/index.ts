#!/usr/bin/env node

import dotenv from 'dotenv';
import app from './server';

// Load environment variables
dotenv.config();

// Get port from environment or use default
const PORT = process.env.PORT || 3001;

/**
 * Starts the API server
 */
const startServer = () => {
  // Start listening
  app.listen(PORT, () => {
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
export default app; 