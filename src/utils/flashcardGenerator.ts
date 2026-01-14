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
      tags: [...(data.tags || []), 'aiddgen'],
      state: createInitialCardState(),
      createdAt: now,
    };
  });
}

/**
 * Generate flashcards from aidd knowledge base
 */
export function generateAiddFlashcards(): Card[] {
  const flashcardData = getAiddFlashcardData();
  const now = Date.now();
  
  return flashcardData.map((data, index) => {
    const id = `aidd-${index + 1}`;
    return {
      id,
      front: data.front,
      back: data.back,
      tags: [...(data.tags || []), 'aidd'],
      state: createInitialCardState(),
      createdAt: now,
    };
  });
}

/**
 * Get the flashcard generator function for a given deck
 */
export function getDeckGenerator(deckId: 'aidd' | 'aiddgen'): () => Card[] {
  switch (deckId) {
    case 'aidd':
      return generateAiddFlashcards;
    case 'aiddgen':
      return generateAiddgenFlashcards;
    default:
      return () => [];
  }
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
 * Get flashcard data covering aidd concepts
 */
function getAiddFlashcardData(): FlashcardData[] {
  return [
    // Core Rules - Thinking Pattern
    {
      front: 'What is the RTC thinking pattern?',
      back: '🎯 restate |> 💡 ideate |> 🪞 reflectCritically |> 🔭 expandOrthogonally |> ⚖️ scoreRankEvaluate |> 💬 respond',
      tags: ['core', 'thinking'],
    },
    {
      front: 'What does the restate step do in RTC?',
      back: 'Clarify the problem/request in own words',
      tags: ['core', 'thinking'],
    },
    {
      front: 'What does the ideate step do in RTC?',
      back: 'Generate initial approaches',
      tags: ['core', 'thinking'],
    },
    {
      front: 'What does the reflectCritically step do in RTC?',
      back: 'Examine weaknesses, assumptions',
      tags: ['core', 'thinking'],
    },
    {
      front: 'What does the expandOrthogonally step do in RTC?',
      back: 'Consider alternatives, different angles',
      tags: ['core', 'thinking'],
    },
    {
      front: 'What does the scoreRankEvaluate step do in RTC?',
      back: 'Compare options, pick best',
      tags: ['core', 'thinking'],
    },
    {
      front: 'When should you use the RTC thinking pattern?',
      back: 'ComplexTask, AmbiguousRequest, ArchitecturalDecision',
      tags: ['core', 'thinking'],
    },
    
    // Core Rules - Behaviors
    {
      front: 'What are the behaviors for PoC lifecycle?',
      back: 'Simplest implementation, push back on concerns, no tests unless asked',
      tags: ['core', 'behaviors'],
    },
    {
      front: 'What is the DOT principle level for PoC?',
      back: 'relaxed',
      tags: ['core', 'principles'],
    },
    {
      front: 'What is the YAGNI principle level for PoC?',
      back: 'maximum',
      tags: ['core', 'principles'],
    },
    {
      front: 'What is the KISS principle level for PoC?',
      back: 'maximum',
      tags: ['core', 'principles'],
    },
    {
      front: 'What is the DRY principle level for PoC?',
      back: 'wait for patterns',
      tags: ['core', 'principles'],
    },
    {
      front: 'What is the error handling approach for PoC?',
      back: 'Minimal - basic errors, skip comprehensive handling',
      tags: ['core', 'behaviors'],
    },
    {
      front: 'What is the testing approach for PoC?',
      back: 'Skip - no tests unless explicitly requested',
      tags: ['core', 'behaviors'],
    },
    {
      front: 'What is the security approach for PoC?',
      back: 'Skip - trust inputs, simple errors, relaxed about local state',
      tags: ['core', 'behaviors'],
    },
    {
      front: 'What is the documentation approach for PoC?',
      back: 'None - skip docs unless complex logic',
      tags: ['core', 'behaviors'],
    },
    {
      front: 'What is the refactoring approach for PoC?',
      back: 'Never - skip refactors, focus on working code',
      tags: ['core', 'behaviors'],
    },
    
    // Core Rules - Commit Process
    {
      front: 'What is the commit format for PoC?',
      back: 'Conventional commit format: type(scope): description',
      tags: ['core', 'commit'],
    },
    {
      front: 'What are the commit types?',
      back: 'feat, fix, refactor, docs, style, test, chore',
      tags: ['core', 'commit'],
    },
    
    // Agent Orchestrator
    {
      front: 'What does the agent orchestrator do?',
      back: 'Coordinates specialized agents in rules/**/*.mdc',
      tags: ['agents', 'orchestrator'],
    },
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
    {
      front: 'What commands does helpProcess list?',
      back: '/help, /plan, /task, /review, /commit, /explain, /debug',
      tags: ['agents', 'orchestrator'],
    },
    {
      front: 'What agents does helpProcess list?',
      back: 'stack, patterns, tdd, review, task',
      tags: ['agents', 'orchestrator'],
    },
    
    // Commands
    {
      front: 'What does the /help command do?',
      back: 'Lists available commands and agents',
      tags: ['commands'],
    },
    {
      front: 'What does the /plan command do?',
      back: 'Reviews plan.md if exists, suggests next steps based on current state, identifies next task to execute',
      tags: ['commands'],
    },
    {
      front: 'What does the /task command do?',
      back: 'Creates epic and decomposes into tasks',
      tags: ['commands'],
    },
    {
      front: 'What does the /review command do?',
      back: 'Performs code review against stack rules and patterns',
      tags: ['commands'],
    },
    {
      front: 'What does the /commit command do?',
      back: 'Commits with conventional format',
      tags: ['commands'],
    },
    {
      front: 'What does the /explain command do?',
      back: 'Explains code or concept clearly',
      tags: ['commands'],
    },
    {
      front: 'What does the /debug command do?',
      back: 'Identifies problem, locates relevant code, suggests fix, explains root cause',
      tags: ['commands'],
    },
    {
      front: 'What does the /component command do?',
      back: 'Generates component from spec',
      tags: ['commands'],
    },
    
    // Stack Rules - React
    {
      front: 'What component structure should be used for PoC?',
      back: 'Functional components with React hooks (useState, useEffect, useContext)',
      tags: ['stack', 'react'],
    },
    {
      front: 'What state management pattern should be used for PoC?',
      back: 'useState for local state, useContext for shared state, wait for pattern before extracting',
      tags: ['stack', 'react'],
    },
    {
      front: 'What is the React principle for PoC?',
      back: 'Simplicity over patterns, inline over extraction until pattern clear, working code over ideal structure',
      tags: ['stack', 'react'],
    },
    {
      front: 'What should you prefer: class components or function components?',
      back: 'Function components',
      tags: ['stack', 'react'],
    },
    
    // Pattern Rules - Component
    {
      front: 'What is the ComponentSpec format?',
      back: 'name: string, props: { [key: string]: Type }, state?: { [key: string]: Type }, behaviors: string[], constraints?: string[]',
      tags: ['patterns', 'component'],
    },
    {
      front: 'What are the steps in generateComponent?',
      back: '1. Create TypeScript interface for props, 2. Generate function component structure, 3. Add state hooks if needed, 4. Implement behaviors, 5. Return JSX structure',
      tags: ['patterns', 'component'],
    },
    
    // Review Rules
    {
      front: 'What are the review criteria?',
      back: 'StackRules (@rules/stack/*.mdc), Patterns (@rules/patterns/*.mdc), Core (@rules/core.mdc)',
      tags: ['review'],
    },
    {
      front: 'What is the review process?',
      back: '1. Check against stack-specific rules, 2. Verify patterns followed, 3. Suggest improvements, 4. Flag critical issues only',
      tags: ['review'],
    },
    {
      front: 'What is the review focus for PoC?',
      back: 'Working code over perfect code, flag only critical issues, suggest improvements but don\'t require',
      tags: ['review'],
    },
    
    // TDD Rules
    {
      front: 'What is the testing approach for PoC?',
      back: 'Skip - no tests unless explicitly requested',
      tags: ['tdd'],
    },
    {
      front: 'What test runner is used when testing is requested?',
      back: 'Vitest',
      tags: ['tdd'],
    },
    {
      front: 'What is the test structure format?',
      back: 'describe(\'[Unit Under Test]\', () => { it(\'[scenario]\', () => { // given: [context], // should: [behavior], expect(actual).toBe(expected) }) })',
      tags: ['tdd'],
    },
    
    // Task Creator Rules
    {
      front: 'What are the task statuses?',
      back: 'pending, in_progress, completed, blocked, cancelled',
      tags: ['task-creator'],
    },
    {
      front: 'What is the Epic structure?',
      back: 'name, status, goal, overview, tasks[]',
      tags: ['task-creator'],
    },
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
    {
      front: 'What is the createTask process?',
      back: 'gatherContext |> decompose |> createEpic |> reviewEpic |> awaitApproval',
      tags: ['task-creator'],
    },
    {
      front: 'What is the executeTask process?',
      back: 'loadEpic |> identifyNext |> executeSingle |> validate |> report |> awaitApproval',
      tags: ['task-creator'],
    },
    {
      front: 'What is the planProcess?',
      back: 'Review plan.md if exists, suggest next steps based on current state, identify next task to execute',
      tags: ['task-creator'],
    },
    {
      front: 'What are the planning rules?',
      back: 'Atomic (~50 lines each), Sequenced (ordered by dependencies), Informal (PoC allows informal planning)',
      tags: ['task-creator'],
    },
    {
      front: 'What format should requirements use?',
      back: 'Given/Should format',
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
 * Get all available tags for a specific deck
 */
export function getAvailableTags(deckId?: 'aidd' | 'aiddgen'): string[] {
  const generator = deckId ? getDeckGenerator(deckId) : generateAiddgenFlashcards;
  const cards = generator();
  const tagSet = new Set<string>();
  cards.forEach((card) => {
    card.tags?.forEach((tag) => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}

