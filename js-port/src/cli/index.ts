#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { DeepSearch, ResearchMode } from '../core/DeepSearch';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config();

// Create a new command line interface
const program = new Command();

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
  .action(async (topic: string, options: any) => {
    // Start the timer
    const startTime = Date.now();

    try {
      // Get API key from environment variable
      const apiKey = process.env.GEMINI_KEY;
      if (!apiKey) {
        console.error(chalk.red('Error: Please set GEMINI_KEY environment variable'));
        process.exit(1);
      }

      // Create the Google Generative AI instance
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Create the deep search instance
      const mode = options.mode as ResearchMode;
      const deepSearch = new DeepSearch(genAI, mode);

      console.log(chalk.cyan(`Starting deep research on: ${topic}`));
      console.log(chalk.cyan(`Mode: ${mode}`));
      console.log(chalk.cyan(`Depth: ${options.depth}`));
      console.log(chalk.cyan(`Breadth: ${options.breadth}`));

      console.log(chalk.yellow('\nTo better understand your research needs, please answer these follow-up questions:'));

      // Determine research parameters
      const parameters = await deepSearch.determineResearchBreadthAndDepth(topic);
      
      // Generate follow-up questions
      const followUpQuestions = await deepSearch.generateFollowUpQuestions(
        topic, 
        parameters
      );

      // Get answers to the follow-up questions
      const answers: {question: string; answer: string}[] = [];
      
      for (const question of followUpQuestions.slice(0, 3)) {
        const { answer } = await inquirer.prompt([
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

      console.log(chalk.yellow('\nStarting research... This may take a few minutes.\n'));

      // Run the deep research
      const researchProgress = await deepSearch.deepResearch(
        topic,
        parseInt(options.depth),
        parseInt(options.breadth),
        options.includeSources !== false
      );

      // Generate and print the final report
      const finalReport = await deepSearch.generateFinalReport(
        researchProgress,
        'markdown'
      );

      // Calculate elapsed time
      const elapsedTime = Date.now() - startTime;
      const minutes = Math.floor(elapsedTime / 60000);
      const seconds = Math.floor((elapsedTime % 60000) / 1000);

      console.log(chalk.green('\nFinal Research Report:'));
      console.log(chalk.green('====================='));
      console.log(finalReport);
      console.log(chalk.cyan(`\nTotal research time: ${minutes} minutes and ${seconds} seconds`));

      // Save the report to a file
      await fs.writeFile(options.output, finalReport + `\n\nTotal research time: ${minutes} minutes and ${seconds} seconds`);
      console.log(chalk.green(`Report saved to ${options.output}`));

    } catch (error) {
      console.error(chalk.red(`Error: ${error}`));
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse(); 