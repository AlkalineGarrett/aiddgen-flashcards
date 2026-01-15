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
 * Generate flashcards from ai knowledge base
 */
export function generateAiFlashcards(): Card[] {
  const flashcardData = getAiFlashcardData();
  const now = Date.now();
  
  return flashcardData.map((data, index) => {
    const id = `ai-${index + 1}`;
    return {
      id,
      front: data.front,
      back: data.back,
      tags: [...(data.tags || []), 'ai'],
      state: createInitialCardState(),
      createdAt: now,
    };
  });
}

/**
 * Get the flashcard generator function for a given deck
 */
export function getDeckGenerator(deckId: 'aidd' | 'aiddgen' | 'ai'): () => Card[] {
  switch (deckId) {
    case 'aidd':
      return generateAiddFlashcards;
    case 'aiddgen':
      return generateAiddgenFlashcards;
    case 'ai':
      return generateAiFlashcards;
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
 * Get flashcard data covering ai concepts
 */
function getAiFlashcardData(): FlashcardData[] {
  return [
    // Commands
    {
      front: 'What does the /help command do?',
      back: 'Lists commands from @ai/rules/please.mdc and reports them to the user without modifying files',
      tags: ['commands'],
    },
    {
      front: 'What does the /commit command do?',
      back: 'Commits changes using conventional commit format: type(scope): description',
      tags: ['commands'],
    },
    {
      front: 'What does the /discover command do?',
      back: 'Uses @ai/rules/productmanager.mdc to discover a user journey, user story, or feature',
      tags: ['commands'],
    },
    {
      front: 'What does the /execute command do?',
      back: 'Uses the task creator to execute a task epic',
      tags: ['commands'],
    },
    {
      front: 'What does the /log command do?',
      back: 'Uses @ai/rules/log.mdc to collect salient changes and log them to activity-log.md',
      tags: ['commands'],
    },
    {
      front: 'What does the /plan command do?',
      back: 'Reviews plan.md to identify priorities and suggest next steps to the user (depth 10)',
      tags: ['commands'],
    },
    {
      front: 'What does the /review command do?',
      back: 'Uses @ai/rules/review.mdc to conduct a thorough code review focusing on code quality and best practices',
      tags: ['commands'],
    },
    {
      front: 'What does the /task command do?',
      back: 'Uses the task creator to plan and execute a task epic',
      tags: ['commands'],
    },
    
    // Agent Orchestrator
    {
      front: 'What does the agent orchestrator do?',
      back: 'Coordinates specialized agents available in $projectRoot/ai/**/*.mdc files',
      tags: ['agents', 'orchestrator'],
    },
    {
      front: 'When is the "please" agent triggered?',
      back: 'When user says "please", use for general assistance, logging, committing, and proofing tasks',
      tags: ['agents', 'triggers'],
    },
    {
      front: 'When is the "stack" agent triggered?',
      back: 'When implementing NextJS + React/Redux + Shadcn UI features',
      tags: ['agents', 'triggers'],
    },
    {
      front: 'When is the "productmanager" agent triggered?',
      back: 'When planning features, user stories, user journeys, or conducting product discovery',
      tags: ['agents', 'triggers'],
    },
    {
      front: 'When is the "tdd" agent triggered?',
      back: 'When implementing code changes',
      tags: ['agents', 'triggers'],
    },
    {
      front: 'When is the "javascript" agent triggered?',
      back: 'When writing JavaScript or TypeScript code',
      tags: ['agents', 'triggers'],
    },
    {
      front: 'When is the "log" agent triggered?',
      back: 'When documenting changes',
      tags: ['agents', 'triggers'],
    },
    {
      front: 'When is the "commit" agent triggered?',
      back: 'When committing code',
      tags: ['agents', 'triggers'],
    },
    {
      front: 'When is the "autodux" agent triggered?',
      back: 'When building Redux state management',
      tags: ['agents', 'triggers'],
    },
    {
      front: 'When is the "javascript-io-network-effects" agent triggered?',
      back: 'When you need to make network requests or invoke side-effects',
      tags: ['agents', 'triggers'],
    },
    {
      front: 'When is the "ui" agent triggered?',
      back: 'When building user interfaces and user experiences',
      tags: ['agents', 'triggers'],
    },
    {
      front: 'When is the "requirements" agent triggered?',
      back: 'When writing functional requirements for a user story',
      tags: ['agents', 'triggers'],
    },
    {
      front: 'How does the orchestrator handle multiple guides?',
      back: 'Uses withCLI() when > 1 guide is needed, otherwise uses directExecution()',
      tags: ['agents', 'orchestrator'],
    },
    
    // Review Rules
    {
      front: 'What are the review criteria?',
      back: 'JavaScript/TypeScript quality, TDD coverage, stack patterns, UI/UX, Redux patterns, network effects, commit quality, security (OWASP top 10), requirements adherence, plan adherence',
      tags: ['review'],
    },
    {
      front: 'What is the review process?',
      back: '1. Analyze code structure, 2. Check coding standards, 3. Evaluate test coverage, 4. Assess performance, 5. Deep scan security, 6. Review UI/UX, 7. Validate architecture, 8. Check documentation, 9. Provide actionable feedback',
      tags: ['review'],
    },
    {
      front: 'What security issues should be flagged as CRITICAL in reviews?',
      back: 'crypto.timingSafeEqual, raw token comparisons, timing safe compare on raw values',
      tags: ['review', 'security'],
    },
    {
      front: 'What should reviews check for regarding requirements?',
      back: 'Compare completed work to functional requirements and task plan to ensure adherence',
      tags: ['review'],
    },
    
    // Task Creator Rules
    {
      front: 'What are the task statuses?',
      back: 'pending, inProgress, completed, blocked, cancelled',
      tags: ['task-creator'],
    },
    {
      front: 'What is the epic template structure?',
      back: 'Status, Goal, Overview (starting with WHY), Tasks with Requirements in "Given X, should Y" format',
      tags: ['task-creator'],
    },
    {
      front: 'What is the createTask process?',
      back: 'createPlan |> reviewEpic |> awaitApproval',
      tags: ['task-creator'],
    },
    {
      front: 'What is the executeTask process?',
      back: 'executePlan |> awaitApproval |> onComplete',
      tags: ['task-creator'],
    },
    {
      front: 'What should epic overviews start with?',
      back: 'WHY - user benefit/problem being solved',
      tags: ['task-creator'],
    },
    {
      front: 'What format should requirements use?',
      back: 'Given $situation, should $jobToDo',
      tags: ['task-creator'],
    },
    {
      front: 'What happens when an epic is completed?',
      back: 'Update status to ✅ COMPLETED, move to tasks/archive/YYYY-MM-DD-${epicName}.md, remove from plan.md',
      tags: ['task-creator'],
    },
    {
      front: 'What should task planning include?',
      back: 'Decompose, assess agent needs, order by dependencies, validate, sequence, checkpoint approval gates',
      tags: ['task-creator'],
    },
    
    // Stack Rules
    {
      front: 'What is the tech stack?',
      back: 'NextJS + React/Redux + Shadcn UI deployed on Vercel',
      tags: ['stack'],
    },
    {
      front: 'What JavaScript approach should be used?',
      back: 'Functional programming: pure functions, immutability, function composition, declarative approaches',
      tags: ['stack', 'javascript'],
    },
    {
      front: 'What React pattern should be used for persisted state?',
      back: 'Container/presentation pattern - containers wire actions/selectors, never contain UI markup or business logic',
      tags: ['stack', 'react'],
    },
    {
      front: 'What Redux approach should be used?',
      back: 'Avoid Redux Toolkit, use Autodux and redux connect instead',
      tags: ['stack', 'redux'],
    },
    {
      front: 'What should be used for side effects?',
      back: 'redux-saga',
      tags: ['stack'],
    },
    {
      front: 'What should always be separated?',
      back: 'State management, UI, and side-effects in different modules',
      tags: ['stack'],
    },
    
    // TDD Rules
    {
      front: 'What is the assert function signature?',
      back: 'assert({ given: string, should: string, actual: any, expected: any })',
      tags: ['tdd'],
    },
    {
      front: 'What 5 questions must tests answer?',
      back: '1. What is the unit under test? 2. What is the expected behavior? 3. What is the actual output? 4. What is the expected output? 5. How can we find the bug?',
      tags: ['tdd'],
    },
    {
      front: 'What are the test requirements?',
      back: 'Readable, Isolated/Integrated, Thorough, Explicit',
      tags: ['tdd'],
    },
    {
      front: 'What is the TDD process?',
      back: '1. Write test, 2. Watch it fail, 3. Implement code to pass, 4. Run test runner, 5. Get approval, 6. Repeat',
      tags: ['tdd'],
    },
    {
      front: 'What test framework is used?',
      back: 'Riteway Library + Vitest',
      tags: ['tdd'],
    },
    {
      front: 'What should be used for spies and stubs?',
      back: 'vi.fn and vi.spyOn (Vitest ships tinyspy)',
      tags: ['tdd'],
    },
    {
      front: 'What should be used for module mocking?',
      back: 'vi.mock with vi.importActual for partial mocks',
      tags: ['tdd'],
    },
    {
      front: 'When testing app state logic, how should you read state?',
      back: 'Always use selectors, NEVER read directly from state objects',
      tags: ['tdd'],
    },
    
    // Log Rules
    {
      front: 'What should be logged?',
      back: 'Only completed epics representing significant user-facing value: epic completions, user-impacting changes, architecture decisions',
      tags: ['log'],
    },
    {
      front: 'What should NOT be logged?',
      back: 'Config changes, file moves, minor bug fixes, docs updates, dependency updates, internal refactoring, test changes, meta-work',
      tags: ['log'],
    },
    {
      front: 'What is the log format?',
      back: '## $date\n\n- $emoji - $epicName - $briefDescription',
      tags: ['log'],
    },
    {
      front: 'What emojis are used for logging?',
      back: '🚀 new feature, 🐛 bug fix, 📝 documentation, 🔄 refactor, 📦 dependency update, 🎨 design, 📱 UI/UX, 📊 analytics, 🔒 security',
      tags: ['log'],
    },
    {
      front: 'What order should logs use?',
      back: 'Reverse chronological order - most recent epics at the top',
      tags: ['log'],
    },
    
    // Product Manager Rules
    {
      front: 'What is the UserStory format?',
      back: '"As a $persona, I want $jobToDo, so that $benefit"',
      tags: ['productmanager'],
    },
    {
      front: 'What is the FunctionalRequirement format?',
      back: '"Given $situation, should $jobToDo"',
      tags: ['productmanager'],
    },
    {
      front: 'How is user story priority calculated?',
      back: 'priority = painPoint.impact * painPoint.frequency',
      tags: ['productmanager'],
    },
    {
      front: 'What does a FeaturePRD include?',
      back: 'name, problem description (why), solution description (what), user journey guide, requirements (user stories + functional requirements)',
      tags: ['productmanager'],
    },
    {
      front: 'What CRUD operations are available?',
      back: 'account, project (always has one storyMap), persona, painPoint, mockup, journey, step, story',
      tags: ['productmanager'],
    },
    {
      front: 'What product manager commands are available?',
      back: '/research, /setup, /generate [persona|journey|storymaps|userStories|feature], /feature, /save, /cancel [step]',
      tags: ['productmanager'],
    },
    
    // Requirements Rules
    {
      front: 'What is the FunctionalRequirement type?',
      back: '"Given $situation, should $jobToDo"',
      tags: ['requirements'],
    },
    {
      front: 'What should requirements focus on?',
      back: 'Functional requirements to support the user journey, job the user wants to accomplish, benefits expected',
      tags: ['requirements'],
    },
    {
      front: 'What should requirements avoid?',
      back: 'Describing specific UI elements or interactions',
      tags: ['requirements'],
    },
    
    // UI Rules
    {
      front: 'What skills should UI/UX work include?',
      back: 'CSS, HTML, JavaScript, React, Animation, Motion design, Graphic design, UI/UX design, Accessibility, Responsive design, Design systems',
      tags: ['ui'],
    },
    {
      front: 'What should UI components focus on?',
      back: 'Use existing project design system and storybook components, create intuitive, accessible, visually appealing interfaces',
      tags: ['ui'],
    },
    {
      front: 'What is the UI/UX engineer role?',
      back: 'Top-tier UI/UX designer with deep skills, good taste, eye for detail, passion for beautiful and friendly interfaces, motion design expertise',
      tags: ['ui'],
    },
    
    // Please Rules
    {
      front: 'What is the RTC thinking pattern?',
      back: '🎯 restate |> 💡 ideate |> 🪞 reflectCritically |> 🔭 expandOrthogonally |> ⚖️ scoreRankEvaluate |> 💬 respond',
      tags: ['please', 'thinking'],
    },
    {
      front: 'What is the depth option for responses?',
      back: '--depth | -d [1..10] - 1 = ELIF, 10 = prep for PhD',
      tags: ['please'],
    },
    {
      front: 'What should be read before responding?',
      back: 'project README.md and @ai/rules/stack.mdc',
      tags: ['please'],
    },
    {
      front: 'What is the constraint for executing commands?',
      back: 'Do ONE THING at a time, get user approval before moving on',
      tags: ['please'],
    },
    
    // Frameworks - Autodux
    {
      front: 'What is Autodux?',
      back: 'Redux state management using Autodux dux objects instead of Redux Toolkit',
      tags: ['frameworks', 'redux', 'autodux'],
    },
    {
      front: 'What is the Autodux workflow?',
      back: '1. Build dux object as "${slice name}-dux.sudo", 2. Transpile to JavaScript as "${slice name}-dux.js"',
      tags: ['frameworks', 'redux', 'autodux'],
    },
    {
      front: 'What is the ActionObject format?',
      back: '{ type: "$slice/$actionName", payload: Any }',
      tags: ['frameworks', 'redux', 'autodux'],
    },
    {
      front: 'What is the ActionCreator format?',
      back: '(payload = {}) => ActionObject - always use arrow functions, default payload to empty object',
      tags: ['frameworks', 'redux', 'autodux'],
    },
    {
      front: 'How should selectors access state?',
      back: 'Use the `slice` variable, e.g. `state[slice].*`',
      tags: ['frameworks', 'redux', 'autodux'],
    },
    {
      front: 'What should reducer cases use?',
      back: 'actionCreator().type instead of literal string values',
      tags: ['frameworks', 'redux', 'autodux'],
    },
    {
      front: 'What format should mapDispatchToProps use?',
      back: 'Object literal form instead of function form',
      tags: ['frameworks', 'redux', 'autodux'],
    },
    {
      front: 'What is the RITE way for tests?',
      back: 'Readable, Isolated, Thorough, Explicit',
      tags: ['frameworks', 'redux', 'autodux'],
    },
    {
      front: 'How should test cases be set up?',
      back: 'Always use selectors to read from resulting state, set up initial state by calling reducer with action creators',
      tags: ['frameworks', 'redux', 'autodux'],
    },
    
    // JavaScript Rules
    {
      front: 'What principles should JavaScript code follow?',
      back: 'DOT, YAGNI, KISS, DRY, SDA (Self Describing APIs)',
      tags: ['javascript'],
    },
    {
      front: 'What is the Simplicity principle?',
      back: 'Removing the obvious and adding the meaningful - obvious stuff hidden in abstraction, meaningful stuff passed as parameters',
      tags: ['javascript'],
    },
    {
      front: 'What should functions favor?',
      back: 'Functional programming: short, pure, composable functions',
      tags: ['javascript'],
    },
    {
      front: 'What should be preferred over manual loops?',
      back: 'map, filter, reduce',
      tags: ['javascript'],
    },
    {
      front: 'What should be preferred for immutability?',
      back: 'const, spread, and rest operators instead of mutation',
      tags: ['javascript'],
    },
    {
      front: 'What should be avoided?',
      back: 'class and extends - prefer composition of functions and data structures over inheritance',
      tags: ['javascript'],
    },
    {
      front: 'What should function parameters use?',
      back: 'Options objects instead of null/undefined arguments, default parameters when it makes sense',
      tags: ['javascript'],
    },
    {
      front: 'What is the SDA principle for parameters?',
      back: 'Parameter values should be explicitly named in function signatures with defaults providing type hints',
      tags: ['javascript'],
    },
    {
      front: 'What should be used for async operations?',
      back: 'async/await or asyncPipe over raw promise chains',
      tags: ['javascript'],
    },
    {
      front: 'How should code be modularized?',
      back: 'By feature; one concern per file or function; prefer named exports',
      tags: ['javascript'],
    },
    {
      front: 'What naming should functions use?',
      back: 'Active voice, verbs (e.g. increment(), filter()), predicates as yes/no questions (e.g. isActive, hasPermission)',
      tags: ['javascript'],
    },
    
    // JavaScript IO Network Effects
    {
      front: 'What is the saga pattern?',
      back: 'Two main functions: call and put - used to isolate network I/O and effects',
      tags: ['javascript-io-network-effects'],
    },
    {
      front: 'What does call(fn, ...args) return?',
      back: '{ CALL: { fn, args } } - an effect object, not the actual function call',
      tags: ['javascript-io-network-effects'],
    },
    {
      front: 'Why use call instead of direct function calls?',
      back: 'Allows deterministic sagas with no side-effects, enabling testing without running side effects',
      tags: ['javascript-io-network-effects'],
    },
    {
      front: 'What does put(action) return?',
      back: '{ PUT: Action } - used to dispatch an action to the store',
      tags: ['javascript-io-network-effects'],
    },
    {
      front: 'What is an Action?',
      back: 'Object with type and payload properties, used in Redux to update state with observable semantic user intents',
      tags: ['javascript-io-network-effects'],
    },
    {
      front: 'What does the saga runtime do?',
      back: 'Runs sagas, handles side effects, passes data back into saga, dispatches put actions to store',
      tags: ['javascript-io-network-effects'],
    },
    {
      front: 'How do you test sagas?',
      back: 'Drive the saga by calling iterator.next(optionalValue) to step through yields',
      tags: ['javascript-io-network-effects'],
    },
    
    // Security Rules
    {
      front: 'What should NEVER be used for secret comparison?',
      back: 'crypto.timingSafeEqual, XOR accumulation tricks, any direct string compare on raw secrets',
      tags: ['security'],
    },
    {
      front: 'How should secret tokens be compared?',
      back: 'Hash both stored secret token and candidate token with SHA3, then compare the hashes',
      tags: ['security'],
    },
    {
      front: 'Why use SHA3 hashing for secret comparison?',
      back: '1. Hashing removes prefix structure - any bit change randomizes hash (no timing oracle), 2. Raw secrets never appear in logs or errors',
      tags: ['security'],
    },
    {
      front: 'What should be done if timing safe compare is detected?',
      back: 'Raise CRITICAL security bug report: "Timing safe compare on raw value detected" with justifications',
      tags: ['security'],
    },
  ];
}

/**
 * Get all available tags for a specific deck
 */
export function getAvailableTags(deckId?: 'aidd' | 'aiddgen' | 'ai'): string[] {
  const generator = deckId ? getDeckGenerator(deckId) : generateAiddgenFlashcards;
  const cards = generator();
  const tagSet = new Set<string>();
  cards.forEach((card) => {
    card.tags?.forEach((tag) => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}

