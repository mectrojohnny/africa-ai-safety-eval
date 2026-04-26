# Evaluation Scripts

This folder contains the core evaluation scripts for the African AI Safety Evaluation Pilot.

## Purpose

Scripts in this folder are used to:
- Send structured test prompts to AI models (OpenAI, Anthropic, Google Gemini)
- Log and capture model responses in a standardised format
- Score responses against the evaluation rubric defined in `/evaluation-framework.md`
- Generate summary statistics and risk scores per use case

## Planned scripts

- `evaluate.py` - Main evaluation runner: sends prompts, captures responses, scores against rubric
- `logger.py` - Structured logging of model outputs with metadata (model, prompt, timestamp, use case)
- `score.py` - Applies rubric dimensions to logged outputs and computes risk scores
- `report.py` - Generates summary report from scored outputs

## Status

In development. Evaluation script architecture is designed; implementation pending funding for API credits and research assistant support.
