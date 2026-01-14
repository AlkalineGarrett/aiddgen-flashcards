import { Card } from '../types/card';
import { createInitialCardState } from './fsrs';

interface FlashcardData {
  front: string;
  back: string;
  tags: string[];
}

/**
 * Generate flashcards from aiddgen knowledge base
 */
export function generateAiddgenFlashcards(): Card[] {
  const flashcardData = getAiddgenFlashcardData();
  const now = Date.now();
  
  return flashcardData.map((data, index) => {
    const id = `aiddgen-${index + 1}`;
    return {
      id,
      front: data.front,
      back: data.back,
      tags: data.tags,
      state: createInitialCardState(),
      createdAt: now,
    };
  });
}

/**
 * Get flashcard data covering aiddgen concepts
 */
function getAiddgenFlashcardData(): FlashcardData[] {
  return [
    // Commands
    {
      front: 'What does the /help command do?',
      back: 'Lists available commands and agents',
      tags: ['commands'],
    },
    {
      front: 'What does the /plan command do?',
      back: 'Reviews plan and suggests next steps',
      tags: ['commands'],
    },
    {
      front: 'What does the /task command do?',
      back: 'Creates epic and decomposes into tasks',
      tags: ['commands'],
    },
    {
      front: 'What does the /review command do?',
      back: 'Performs code review',
      tags: ['commands'],
    },
    {
      front: 'What does the /commit command do?',
      back: 'Commits with conventional format',
      tags: ['commands'],
    },
    {
      front: 'What does the /explain command do?',
      back: 'Explains code or concept',
      tags: ['commands'],
    },
    {
      front: 'What does the /debug command do?',
      back: 'Debugs an issue',
      tags: ['commands'],
    },
    
    // Agent Triggers
    {
      front: 'When is the "stack" agent triggered?',
      back: 'When implementing features using the tech stack',
      tags: ['agents', 'triggers'],
    },
    {
      front: 'When is the "patterns" agent triggered?',
      back: 'When generating from spec (store, component, api-route, model)',
      tags: ['agents', 'triggers'],
    },
    {
      front: 'When is the "tdd" agent triggered?',
      back: 'When implementing code changes',
      tags: ['agents', 'triggers'],
    },
    {
      front: 'When is the "review" agent triggered?',
      back: 'When performing code review',
      tags: ['agents', 'triggers'],
    },
    {
      front: 'When is the "task" agent triggered?',
      back: 'When doing task/epic planning',
      tags: ['agents', 'triggers'],
    },
    
    // Agent-Rule Mapping
    {
      front: 'Which rule file does the "stack" agent use?',
      back: 'rules/stack/*.mdc',
      tags: ['agents', 'mapping'],
    },
    {
      front: 'Which rule file does the "patterns" agent use?',
      back: 'rules/patterns/*.mdc',
      tags: ['agents', 'mapping'],
    },
    {
      front: 'Which rule file does the "tdd" agent use?',
      back: 'rules/tdd.mdc',
      tags: ['agents', 'mapping'],
    },
    {
      front: 'Which rule file does the "review" agent use?',
      back: 'rules/review.mdc',
      tags: ['agents', 'mapping'],
    },
    {
      front: 'Which rule file does the "task" agent use?',
      back: 'rules/task-creator.mdc',
      tags: ['agents', 'mapping'],
    },
    
    // Choice Hierarchy
    {
      front: 'What is L1 in the choice hierarchy?',
      back: 'Problem Domain - What problem are you solving?',
      tags: ['choice-hierarchy'],
    },
    {
      front: 'What is L2 in the choice hierarchy?',
      back: 'Lifecycle - PoC, TeamTool, MVP, EarlyProduction, MatureProduction',
      tags: ['choice-hierarchy'],
    },
    {
      front: 'What is L3 in the choice hierarchy?',
      back: 'Architecture',
      tags: ['choice-hierarchy'],
    },
    {
      front: 'What is L4 in the choice hierarchy?',
      back: 'Ecosystem - language/runtime',
      tags: ['choice-hierarchy'],
    },
    {
      front: 'What is L5 in the choice hierarchy?',
      back: 'Tech Stack',
      tags: ['choice-hierarchy'],
    },
    
    // Lifecycle Defaults
    {
      front: 'What are the default lifecycle params for PoC?',
      back: 'Personal, Solo, Rapid, Local',
      tags: ['lifecycle', 'defaults'],
    },
    {
      front: 'What are the default lifecycle params for TeamTool?',
      back: 'Internal, Small, Active, Team',
      tags: ['lifecycle', 'defaults'],
    },
    {
      front: 'What are the default lifecycle params for MVP?',
      back: 'Business, Small, Active, Users',
      tags: ['lifecycle', 'defaults'],
    },
    {
      front: 'What are the default lifecycle params for EarlyProduction?',
      back: 'Business, Multiple, Active, Users',
      tags: ['lifecycle', 'defaults'],
    },
    {
      front: 'What are the default lifecycle params for MatureProduction?',
      back: 'Business+, Multiple, Measured, Organization',
      tags: ['lifecycle', 'defaults'],
    },
    
    // Cascade Rules
    {
      front: 'How do higher levels in choice hierarchy affect lower levels?',
      back: 'Higher levels inform lower-level defaults',
      tags: ['choice-hierarchy', 'cascade'],
    },
    {
      front: 'What takes precedence: explicit user choice or inferred defaults?',
      back: 'Explicit user choice beats cascade defaults',
      tags: ['choice-hierarchy', 'cascade'],
    },
    {
      front: 'How should explicit and inferred choices be stored?',
      back: 'Record both explicit AND inferred separately',
      tags: ['choice-hierarchy', 'cascade'],
    },
    
    // Command Rules
    {
      front: 'Which rule does /task command reference?',
      back: 'rules/task-creator.mdc#createTask',
      tags: ['commands', 'rules'],
    },
    {
      front: 'Which rule does /review command reference?',
      back: 'rules/review.mdc#reviewProcess',
      tags: ['commands', 'rules'],
    },
    {
      front: 'Which rule does /plan command reference?',
      back: 'rules/task-creator.mdc#planProcess',
      tags: ['commands', 'rules'],
    },
    {
      front: 'Which rule does /help command reference?',
      back: 'rules/agent-orchestrator.mdc#helpProcess',
      tags: ['commands', 'rules'],
    },
    
    // Command Structure
    {
      front: 'What commands are always included?',
      back: '/help, /plan, /task, /review, /commit, /explain, /debug',
      tags: ['commands'],
    },
    {
      front: 'What commands are added for TeamTool+ lifecycle?',
      back: '/discover, /execute, /log',
      tags: ['commands', 'lifecycle'],
    },
    {
      front: 'What commands are added for MVP+ lifecycle?',
      back: '/feature, /journey',
      tags: ['commands', 'lifecycle'],
    },
    {
      front: 'What commands are added for Business+ risk?',
      back: '/security-review',
      tags: ['commands', 'risk'],
    },
    
    // Command Template
    {
      front: 'What is the structure of a command file?',
      back: 'Ultra-thin: frontmatter + title + rule reference only, max 7 lines',
      tags: ['commands', 'structure'],
    },
    {
      front: 'Where should command process logic live?',
      back: 'In rule files, not in command files. Commands delegate entirely to rules.',
      tags: ['commands', 'structure'],
    },
    
    // Generation Process
    {
      front: 'What is the output directory for aiddgen?',
      back: './aidd/ (default)',
      tags: ['generator'],
    },
    {
      front: 'What is the generation process order?',
      back: 'generateChoices → generateCore → generateStackRules → generatePatterns → generateEffectRules → generateSupportingRules → generateCommands → generateAgentOrchestrator',
      tags: ['generator', 'process'],
    },
    
    // Agent Orchestrator
    {
      front: 'What does the agent orchestrator do?',
      back: 'Coordinates specialized agents in rules/**/*.mdc',
      tags: ['agents', 'orchestrator'],
    },
    {
      front: 'How does the orchestrator handle multiple domains?',
      back: 'Composes prompt with relevant guides',
      tags: ['agents', 'orchestrator'],
    },
    {
      front: 'How does the orchestrator handle single domain?',
      back: 'Dispatches to matching agent',
      tags: ['agents', 'orchestrator'],
    },
    
    // File Locations
    {
      front: 'Where are epics stored?',
      back: 'tasks/[epic-name].md',
      tags: ['task-creator'],
    },
    {
      front: 'Where are archived epics stored?',
      back: 'tasks/archive/YYYY-MM-DD-[epic-name].md',
      tags: ['task-creator'],
    },
    {
      front: 'Where is the plan stored?',
      back: 'plan.md',
      tags: ['task-creator'],
    },
  ];
}

/**
 * Generate flashcards for a specific tag
 */
export function generateFlashcardsByTag(tag: string): Card[] {
  const allCards = generateAiddgenFlashcards();
  return allCards.filter((card) => card.tags?.includes(tag));
}

/**
 * Get all available tags
 */
export function getAvailableTags(): string[] {
  const cards = generateAiddgenFlashcards();
  const tagSet = new Set<string>();
  cards.forEach((card) => {
    card.tags?.forEach((tag) => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}

