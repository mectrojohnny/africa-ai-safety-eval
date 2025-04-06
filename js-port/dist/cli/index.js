#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const inquirer_1 = __importDefault(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
const dotenv_1 = __importDefault(require("dotenv"));
const promises_1 = __importDefault(require("fs/promises"));
const DeepSearch_1 = require("../core/DeepSearch");
const generative_ai_1 = require("@google/generative-ai");
// Load environment variables
dotenv_1.default.config();
// Create a new command line interface
const program = new commander_1.Command();
// Define the program
program
    .name('gemini-research')
    .description('A powerful research assistant powered by Google\'s Gemini AI')
    .version('0.1.0');
// Add the research command
program
    .argument('<topic>', 'The research topic')
    .option('-d, --depth <depth>', 'Maximum depth of research', '3')
    .option('-b, --breadth <breadth>', 'Maximum breadth of research', '3')
    .option('-m, --mode <mode>', 'Research mode (fast, balanced, comprehensive)', 'balanced')
    .option('-o, --output <file>', 'Output file for the report', 'final_report.md')
    .option('--include-sources', 'Include source links in the report', true)
    .action(async (topic, options) => {
    // Start the timer
    const startTime = Date.now();
    try {
        // Get API key from environment variable
        const apiKey = process.env.GEMINI_KEY;
        if (!apiKey) {
            console.error(chalk_1.default.red('Error: Please set GEMINI_KEY environment variable'));
            process.exit(1);
        }
        // Create the Google Generative AI instance
        const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        // Create the deep search instance
        const mode = options.mode;
        const deepSearch = new DeepSearch_1.DeepSearch(genAI, mode);
        console.log(chalk_1.default.cyan(`Starting deep research on: ${topic}`));
        console.log(chalk_1.default.cyan(`Mode: ${mode}`));
        console.log(chalk_1.default.cyan(`Depth: ${options.depth}`));
        console.log(chalk_1.default.cyan(`Breadth: ${options.breadth}`));
        console.log(chalk_1.default.yellow('\nTo better understand your research needs, please answer these follow-up questions:'));
        // Determine research parameters
        const parameters = await deepSearch.determineResearchBreadthAndDepth(topic);
        // Generate follow-up questions
        const followUpQuestions = await deepSearch.generateFollowUpQuestions(topic, parameters);
        // Get answers to the follow-up questions
        const answers = [];
        for (const question of followUpQuestions.slice(0, 3)) {
            const { answer } = await inquirer_1.default.prompt([
                {
                    type: 'input',
                    name: 'answer',
                    message: question,
                }
            ]);
            answers.push({
                question,
                answer
            });
        }
        console.log(chalk_1.default.yellow('\nStarting research... This may take a few minutes.\n'));
        // Run the deep research
        const researchProgress = await deepSearch.deepResearch(topic, parseInt(options.depth), parseInt(options.breadth), options.includeSources !== false);
        // Generate and print the final report
        const finalReport = await deepSearch.generateFinalReport(researchProgress, 'markdown');
        // Calculate elapsed time
        const elapsedTime = Date.now() - startTime;
        const minutes = Math.floor(elapsedTime / 60000);
        const seconds = Math.floor((elapsedTime % 60000) / 1000);
        console.log(chalk_1.default.green('\nFinal Research Report:'));
        console.log(chalk_1.default.green('====================='));
        console.log(finalReport);
        console.log(chalk_1.default.cyan(`\nTotal research time: ${minutes} minutes and ${seconds} seconds`));
        // Save the report to a file
        await promises_1.default.writeFile(options.output, finalReport + `\n\nTotal research time: ${minutes} minutes and ${seconds} seconds`);
        console.log(chalk_1.default.green(`Report saved to ${options.output}`));
    }
    catch (error) {
        console.error(chalk_1.default.red(`Error: ${error}`));
        process.exit(1);
    }
});
// Parse command line arguments
program.parse();
