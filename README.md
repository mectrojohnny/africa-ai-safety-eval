# African AI Safety Evaluation Pilot

**A Nigerian-based pilot project to map, evaluate, and mitigate AI safety risks in real-world African use cases.**

## What this project is

AI systems used across Africa are mostly built and trained outside African contexts. This means they can hallucinate facts about African realities, give biased or harmful advice to African users, exclude local languages, and be weaponised for fraud and disinformation with little oversight or accountability.

This project builds a focused evaluation and tracking initiative that:
- Maps real AI use cases among students, youth, and SMEs in Nigeria
- Measures safety failures: hallucinations, harmful advice, cultural bias, language exclusion, and misuse risk
- Tests practical low-cost mitigations that local builders and deployers can adopt
- Translates findings into governance-relevant tools and briefs for African AI policy stakeholders

Nigeria is the pilot testbed. All outputs, rubrics, and guidelines are designed to generalise across Africa.

## Use cases under evaluation

| # | Use Case | Target Users | Primary Risk |
|---|----------|-------------|-------------|
| 1 | AI tutors and educational assistants | Students, learners | Hallucination, harmful academic advice |
| 2 | AI writing and communication tools | SMEs, entrepreneurs | Bias, misuse for fraud/fake reviews |
| 3 | AI chatbots for general youth advice | Young professionals | Harmful life/career/health-adjacent advice |
| 4 | Image and video generation tools | General users | Deepfakes, impersonation, disinformation |
| 5 | AI used informally for sensitive advice | Vulnerable users | Unsafe mental health, financial, legal guidance |

## Models being evaluated

- OpenAI (GPT-4o and variants)
- Anthropic (Claude 3.x)
- Google Gemini (1.5 Pro and variants)

## Repository structure

- `/src` - Evaluation scripts: prompt runners, response loggers, and rubric scorers
- `/gemini_research` - Test prompt bank and annotated use case data
- `evaluation-framework.md` - Full evaluation rubric, scoring dimensions, and mitigation strategies

## Current status

> Pre-funding phase. This project has been in the pipeline since early 2026, awaiting funding to move from framework design into active data collection, model evaluation, and mitigation testing.

## About the researcher

**John Akalagboro** is a Mechatronics Engineer, AI/ML practitioner, TEDx speaker, and founder of Kadosh Mechatronics and the Kadosh Innovation Hub based in Akure, Nigeria.

With over 7 years of experience building at the intersection of hardware, software, and AI, John has trained 100+ students per year in hands-on robotics, IoT, and machine learning through the Kadosh Innovation Hub. His applied research spans CNN, LSTM, and computer vision systems deployed in resource-constrained African environments.

John is also building a low-internet education platform for underserved learners in Nigeria, giving him direct access to the populations and use cases at the centre of this evaluation project. His work sits at the intersection of technical AI research and social impact, with a focus on making AI safer and more relevant for African users.

- LinkedIn: [linkedin.com/in/akalagboro-john-5552aa105](https://www.linkedin.com/in/akalagboro-john-5552aa105)
- Organisation: [kadoshmechatronics.com](https://www.kadoshmechatronics.com)
- Location: Akure, Ondo State, Nigeria

## License

MIT License - open for reuse and adaptation by other African AI safety researchers.
