# Gemini Deep Research Tool (JavaScript Port)

A JavaScript/TypeScript port of the Gemini Deep Research Tool that helps you conduct deep, multi-layered research on any topic using Google's Gemini AI model.

## Features

- **Semantic Question Generation**: Automatically creates relevant follow-up questions based on your initial query
- **Multi-layered Research**: Explores topics in depth with a tree-based approach
- **Smart Source Management**: Tracks and organizes sources to avoid repetition
- **Customizable Research Parameters**: Control the breadth and depth of your research
- **Markdown Report Generation**: Creates well-formatted research reports with proper citations
- **Command-line Interface**: Easy to use CLI for research tasks
- **REST API**: Simple REST API for integration with web applications (no authentication required)

## Prerequisites

- Node.js 16.x or higher
- NPM 7.x or higher
- A Google Gemini API key

## Installation

```bash
# Install from npm
npm install -g gemini-research

# Or clone and build from source
git clone https://github.com/yourusername/gemini-research-js.git
cd gemini-research-js
npm install
npm run build
```

## Configuration

Create a `.env` file in the project root with the following:

```
GEMINI_KEY=your_api_key_here
PORT=3001
# NODE_ENV=development
# LOG_LEVEL=info
```

## Usage

### Command Line Interface

```bash
# Basic research
gemini-research "quantum computing applications in healthcare"

# With custom parameters
gemini-research --depth 3 --breadth 3 "impact of climate change on agriculture"

# Export to file
gemini-research --output report.md "history of artificial intelligence"
```

### REST API

Start the API server:

```bash
# Development mode
npm run dev:api

# Production mode
npm run start:api
```

The API server will be available at http://localhost:3001 with the following endpoints:

- `GET /health` - Health check endpoint
- `POST /api/research/parameters` - Get research parameters for a topic
- `POST /api/research/questions` - Generate follow-up questions
- `POST /api/research` - Perform deep research
- `POST /api/research/report` - Generate final report

##### Example Requests

Get research parameters:
```json
POST /api/research/parameters
{
  "topic": "quantum computing applications in healthcare"
}
```

Generate follow-up questions:
```json
POST /api/research/questions
{
  "topic": "quantum computing applications in healthcare",
  "parameters": {
    "breadth": 3,
    "depth": 2
  },
  "parentQuery": "How are quantum computers used in drug discovery?"
}
```

Perform deep research:
```json
POST /api/research
{
  "topic": "quantum computing applications in healthcare",
  "maxDepth": 3,
  "maxBreadth": 3,
  "includeSourceLinks": true
}
```

Generate final report:
```json
POST /api/research/report
{
  "researchProgress": {
    "initialQuery": "quantum computing applications in healthcare",
    "queries": {...},
    "learnings": [...],
    "visitedUrls": {...}
  },
  "format": "markdown"
}
```

### As a Library

```typescript
import { DeepSearch } from 'gemini-research';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI SDK
const genAI = new GoogleGenerativeAI('YOUR_API_KEY');

// Create a new DeepSearch instance
const deepSearch = new DeepSearch(genAI);

// Perform research
const research = await deepSearch.deepResearch(
  'quantum computing applications in healthcare',
  3, // depth
  3, // breadth
  true // include source links
);

// Generate a report
const report = await deepSearch.generateFinalReport(research, 'markdown');
console.log(report);
```

## Directory Structure

```
js-port/
├── src/
│   ├── api/                # API server code
│   ├── cli/                # Command-line interface code
│   ├── DeepSearch.ts       # Core deep research functionality
│   ├── ResearchProgress.ts # Research progress tracking
│   ├── types.ts            # TypeScript type definitions
│   └── utils/              # Utility functions
├── dist/                   # Compiled JavaScript files
├── tests/                  # Test files
├── .env.example            # Example environment variables
├── package.json            # Project dependencies
└── tsconfig.json           # TypeScript configuration
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run linter
npm run lint

# Build the package
npm run build

# Start the API server in development mode
npm run dev:api
```

## License

MIT

## Acknowledgements

This project is a JavaScript/TypeScript port of the [original Python Gemini Deep Research Tool](https://github.com/google/generative-ai-docs/tree/main/gemini/use-cases/deep-research-tool).