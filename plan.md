# Plan: Add Flashcard Content for New Topic from New Directory

**Status**: 📋 PLANNED
**Goal**: Add flashcard content generation for a new topic sourced from a new directory, following the established pattern from aidd/ and aiddgen/ decks.
New directory: ai/

## Overview

Based on the accumulated steps from previous epics (multi-deck system, prose conversion, flashcard generation), this plan outlines the process to add flashcard content for a new topic from a new directory. The system currently supports 'aidd' and 'aiddgen' decks with hardcoded flashcards and manually-created prose files. To add a new topic, we need to: (1) identify the new directory structure and map topics to source files, (2) generate flashcards from the directory content, (3) generate prose files for reading, (4) integrate the new content into the existing deck system or create a new deck if needed, and (5) test the integration.

---

## Task 1: Identify New Directory Structure and Topic Mapping ✅ COMPLETED

**Requirements**:
- ✅ Given a new directory path, should identify all source files (.mdc, .md, .txt, etc.)
- ✅ Given source files, should map topic IDs to file paths (similar to the mapping in convert-to-prose epic)
- ✅ Given topic mapping, should document the structure: `{topicId} → {source file paths}`
- ✅ Given directory structure, should determine if this is a new deck or additional topics for existing deck
- ✅ Given topic mapping, should identify which topics already exist vs. which are new

**Topic mapping** (ai/ directory):

### Existing Topics (also in aidd/aiddgen):
- `commands` → `ai/commands/*.md` (8 files: commit.md, discover.md, execute.md, help.md, log.md, plan.md, review.md, task.md)
- `agents` → `ai/rules/agent-orchestrator.mdc`
- `review` → `ai/rules/review.mdc`
- `task-creator` → `ai/rules/task-creator.mdc`
- `stack` → `ai/rules/stack.mdc`
- `tdd` → `ai/rules/tdd.mdc`

### New Topics (unique to ai/):
- `log` → `ai/rules/log.mdc`
- `productmanager` → `ai/rules/productmanager.mdc`
- `requirements` → `ai/rules/requirements.mdc`
- `ui` → `ai/rules/ui.mdc`
- `please` → `ai/rules/please.mdc`
- `frameworks` → `ai/rules/frameworks/redux/autodux.mdc` + `ai/rules/frameworks/redux/example.mdc`
- `javascript` → `ai/rules/javascript/javascript.mdc`
- `javascript-io-network-effects` → `ai/rules/javascript/javascript-io-network-effects.mdc`
- `security` → `ai/rules/security/timing-safe-compare.mdc`

**Deck Decision**: This is a **NEW DECK** (not extending existing)
- Different directory structure (ai/ vs aidd/ and aiddgen/)
- Different content focus (more comprehensive, enterprise-focused)
- Contains unique topics not in existing decks (log, productmanager, requirements, ui, please, frameworks, javascript, security)
- Deck ID: `ai`

---

## Task 2: Generate Flashcards from New Directory ✅ COMPLETED

**Requirements**:
- ✅ Given new directory content, should extract key concepts and generate Q&A flashcard pairs
- ✅ Given flashcard generation, should follow existing pattern in `flashcardGenerator.ts`:
  - Use `FlashcardData` interface: `{ front: string, back: string, tags: string[] }`
  - Include deck-specific tag ('ai')
  - Include topic-specific tags for grouping
  - Generate unique IDs with deck prefix: `ai-{index}`
- ✅ Given flashcard generator, should add new function `generateAiFlashcards()` for new deck
- ✅ Given flashcard generator, should update `getDeckGenerator()` to include 'ai' deck
- ✅ Given generated flashcards, should ensure all topics from mapping are covered

**Files modified**:
- `src/utils/flashcardGenerator.ts` - Added `generateAiFlashcards()` function with 100+ flashcards covering:
  - Commands (8 commands)
  - Agents (orchestrator + 11 agent triggers)
  - Review (4 cards)
  - Task-creator (8 cards)
  - Stack (6 cards)
  - TDD (8 cards)
  - Log (5 cards - new topic)
  - Productmanager (6 cards - new topic)
  - Requirements (3 cards - new topic)
  - UI (3 cards - new topic)
  - Please (4 cards - new topic)
  - Frameworks/Redux/Autodux (9 cards - new topic)
  - JavaScript (11 cards - new topic)
  - JavaScript-io-network-effects (7 cards - new topic)
  - Security (4 cards - new topic)

---

## Task 3: Generate Prose Files for New Topics ✅ COMPLETED

**Requirements**:
- ✅ Given new directory content, should generate prose explanations for each topic
- ✅ Given prose generation, should create files in `src/config/topicProse/` with pattern: `{deckId}-{topicId}.txt`
- ✅ Given prose content, should:
  - Flow naturally in paragraph form (not just lists)
  - Cover all concepts from corresponding flashcards
  - Use transitions between topics
  - Vary grammatical structure (avoid choppy repetition)
  - Convert lists of 4+ items into bulleted lists for readability
- ✅ Given prose files, should handle missing topics gracefully (return default message)
- ✅ Given prose generation, should follow manual review process (generate → review → refine)

**Files created**:
- `src/config/topicProse/ai-commands.txt` - Commands overview
- `src/config/topicProse/ai-agents.txt` - Agent orchestrator and triggers
- `src/config/topicProse/ai-review.txt` - Code review process and criteria
- `src/config/topicProse/ai-task-creator.txt` - Task planning and execution
- `src/config/topicProse/ai-stack.txt` - Tech stack (NextJS + React/Redux + Shadcn)
- `src/config/topicProse/ai-tdd.txt` - Test-driven development
- `src/config/topicProse/ai-log.txt` - Change logging (new topic)
- `src/config/topicProse/ai-productmanager.txt` - Product management (new topic)
- `src/config/topicProse/ai-requirements.txt` - Functional requirements (new topic)
- `src/config/topicProse/ai-ui.txt` - UI/UX design (new topic)
- `src/config/topicProse/ai-please.txt` - Main assistant guide (new topic)
- `src/config/topicProse/ai-frameworks.txt` - Redux/Autodux (new topic)
- `src/config/topicProse/ai-javascript.txt` - JavaScript best practices (new topic)
- `src/config/topicProse/ai-javascript-io-network-effects.txt` - Saga pattern (new topic)
- `src/config/topicProse/ai-security.txt` - Security guidelines (new topic)

---

## Task 4: Verify Content Coverage ✅ COMPLETED

**Requirements**:
- ✅ Given generated flashcards, should verify all topics from mapping are covered
- ✅ Given prose files, should verify all flashcard Q&A pairs are explained in prose
- ✅ Given content coverage, should test with new deck (or existing deck if extending)
- ✅ Given missing content, should document gaps and create follow-up tasks
- ✅ Given content quality, should ensure prose flows naturally and flashcards are accurate

**Verification approach**:
- ✅ Compare flashcard topics with prose file topics - All 15 topics match
- ✅ Check that each flashcard concept appears in corresponding prose - All 100+ flashcards covered
- ✅ Test reading experience for completeness - Prose flows naturally with transitions
- ✅ Verify topic extraction works correctly - Ready for system integration

**Verification Results**:
- ✅ All 15 topics have prose files (commands, agents, review, task-creator, stack, tdd, log, productmanager, requirements, ui, please, frameworks, javascript, javascript-io-network-effects, security)
- ✅ All 100+ flashcards have corresponding prose explanations
- ✅ Key concepts comprehensively covered in prose
- ✅ Prose quality verified: natural flow, transitions, varied structure, bullets for long lists
- ✅ No gaps identified - coverage is complete

---

## Task 5: Update Topic Prose Loading (if new deck) ✅ COMPLETED

**Requirements**:
- ✅ Given new deck, should update `topicProse.ts` to handle new deck ID in `getProseFileKey()`
- ✅ Given topic prose loading, should support new deck ID in `generateTopicProse()`
- ✅ Given topic ID normalization, should handle variations (e.g., 'agent' → 'agents')
- ✅ Given missing prose files, should return helpful error message indicating which file is missing

**Files modified**:
- `src/utils/topicProse.ts` - Updated `getProseFileKey()` to:
  - Try normalized topic ID first, then try original topic ID (handles compound IDs like 'javascript-io-network-effects')
  - Works generically with any deck ID including 'ai'
- `src/utils/topicContent.ts` - Updated `extractPrimaryTopic()` and `getCardPrimaryTopic()` to:
  - Ignore 'ai' as a deck tag
  - Return full tag name for compound topic IDs (not just first part) to match prose file names

---

## Task 6: Update Deck Storage (if new deck) ✅ COMPLETED

**Requirements**:
- ✅ Given new deck, should add deck ID to `DeckId` type union
- ✅ Given new deck, should add deck info to `DECK_INFO` record with name and description
- ✅ Given deck storage, should update `getSelectedDeck()` to recognize new deck ID
- ✅ Given deck storage, should ensure all deck utilities work with new deck

**Files modified**:
- `src/utils/deckStorage.ts` - Added 'ai' deck:
  - Updated `DeckId` type to include 'ai': `'aidd' | 'aiddgen' | 'ai'`
  - Added ai deck info to `DECK_INFO`: name 'ai/', description 'Learn the AI assistant system rules and workflows'
  - Updated `getSelectedDeck()` to recognize 'ai' as valid deck ID
  - Updated `getDeckCardCounts()` to include 'ai' in counts record
  - All other functions work automatically with the updated type

---

## Task 7: Update Topic Content Generation ✅ COMPLETED

**Requirements**:
- ✅ Given topic content generation, should work with new deck ID
- ✅ Given topic extraction, should correctly identify topics from new flashcards
- ✅ Given topic grouping, should group cards by primary topic tag correctly
- ✅ Given prose loading, should load prose files for new topics
- ✅ Given topic display, should format topic names correctly (kebab-case → Title Case)

**Files verified**:
- `src/utils/topicContent.ts` - Works automatically with ai deck:
  - `generateTopicContent()` uses `getDeckGenerator('ai')` which returns `generateAiFlashcards`
  - `getCardPrimaryTopic()` correctly filters out 'ai' deck tag and preserves compound topic IDs
  - `groupCardsByTopic()` groups cards correctly by primary topic
  - `generateTopicProse()` loads prose files for all topics (verified: commands, agents, javascript-io-network-effects, frameworks all extract correctly)
  - `formatTopicName()` converts kebab-case to Title Case (e.g., 'javascript-io-network-effects' → 'Javascript Io Network Effects')

**Verification Results**:
- ✅ Simple topics extract correctly: 'commands', 'agents'
- ✅ Compound topics preserve full name: 'javascript-io-network-effects'
- ✅ Deck tag 'ai' is properly filtered out
- ✅ All 15 topics from ai deck will be correctly extracted and grouped

---

## Task 8: Update UI Components (if new deck) ✅ COMPLETED

**Requirements**:
- ✅ Given new deck, should update `DeckSelection` component to show new deck option
- ✅ Given deck selection, should display new deck name and description
- ✅ Given deck switching, should work with new deck
- ✅ Given study interface, should work with new deck's cards
- ✅ Given card management, should display new deck's cards correctly

**Files modified**:
- `src/components/DeckSelection.tsx` - Updated initial cardCounts state to include 'ai: 0'
  - Uses `getAllDecks()` which automatically includes ai deck
  - Uses `getDeckCardCounts()` which includes ai deck
  - Displays deck name 'ai/' and description 'Learn the AI assistant system rules and workflows'
- `src/App.tsx` - Updated route parsing regex patterns to include 'ai':
  - `/study/(aidd|aiddgen|ai)` - study route
  - `/manage/(aidd|aiddgen|ai)` - manage route
  - `/read/(aidd|aiddgen|ai)` - read route

**Files verified (work automatically)**:
- `src/components/Study.tsx` - Uses `DeckId` type and `getDeckInfo(deckId)` - works automatically
- `src/components/CardManagement.tsx` - Uses `DeckId` type and `getDeckInfo(deckId)` - works automatically
- `src/components/TopicReader.tsx` - Uses `DeckId` type and `getDeckInfo(deckId)` - works automatically
- `src/components/Quiz.tsx` - Uses `DeckId` type - works automatically

**Integration Complete**: All UI components now support the 'ai' deck. Users can select, study, manage, and read topics from the ai deck.

**Key patterns to follow**:
- Flashcard IDs: `{deckId}-{index}` format
- Prose files: `{deckId}-{topicId}.txt` in `src/config/topicProse/`
- Topic extraction: From card tags (first non-deck tag)
- Deck support: Extend `DeckId` type and `DECK_INFO` if new deck

