# Plan for converting reading view into prose

**Status**: 🚧 IN PROGRESS
**Goal**: Allow users to read content in prose form

## Overview

Replace the current flashcard-based reading approach with prose/paragraph form explanations for each topic, sourced from the original files in `aidd/` and `aiddgen/`.

### Task 1: AI agent task - Generate Prose

**Requirements**:
- Given a topic ID and deck ID, read corresponding source files from `aidd/` and `aiddgen/`
- map topic IDs to correct source file paths
- parse source files and extract relevant content
- compose prose explanations in paragraph form
- handle missing or incomplete source files gracefully

**Topic-to-source file mapping**:
- `commands` → `aidd/commands/*.md` + `aiddgen/commands/*.md`
- `agents` → `aidd/rules/agent-orchestrator.mdc` + `aiddgen/rules/generator/agents.mdc`
- `choice-hierarchy` → `aiddgen/rules/choices/choice-hierarchy.mdc`
- `lifecycle` → `aiddgen/rules/choices/lifecycle.mdc`
- `core` → `aidd/rules/core.mdc`
- `stack` → `aidd/rules/stack/*.mdc`
- `patterns` → `aidd/rules/patterns/*.mdc`
- `review` → `aidd/rules/review.mdc`
- `tdd` → `aidd/rules/tdd.mdc`
- `task-creator` → `aidd/rules/task-creator.mdc`
- `generator` → `aiddgen/rules/generator.mdc` + `aiddgen/rules/generator/*.mdc`

---

### Task 2: Verify Content Coverage

**Requirements**:
- Should make sure prose flows naturally
- Should make sure prose explains concepts sufficiently
- Should verify all flashcard Q&A pairs are covered in prose explanations
- Should test with both 'aidd' and 'aiddgen' decks
- Should ensure no information is lost in transition from flashcards to prose
- Should document any gaps or missing content

**Verification approach**:
- Compare flashcard content from `flashcardGenerator.ts` with generated prose
- Ensure all topics have complete prose explanations
- Test reading experience for completeness

---

### Task 2b: Manually fix up content

**Actions**:
- Make sure prose flows naturally
- Make sure prose explains concepts sufficiently
- Close coverage gaps in prose explanations w.r.t. flashcard Q&A pairs
- Fix both 'aidd' and 'aiddgen' decks
- Modify the files under config/topicProse only for this task

---

### Task 2c: Manually make text in config/topicProse/* more natural

**Actions**:
- Convert any prose that is a list of 4+ items into a bulleted list, which is easier to read than long prose lists.
- Vary the grammatical structure of adjacent sentences so that the text doesn't feel choppy.
- Add transitions between topics.

---

### Task 3: Update Data Structures and Content Generation

**Requirements**:
- Should add `prose: string` (required) field to `Topic` interface
- Should update `generateTopicContent` to include prose for each topic
- Should ensure prose generation works for both 'aidd' and 'aiddgen' decks
- Don't maintain backward compability, delete obsolete things

---

### Task 4: Update Read UI to Display Prose

**Requirements**:
- Should display prose paragraphs instead of individual flashcards
- Should maintain same navigation and confirmation flow
- Should preserve topic selection and progress tracking
- Should ensure prose is readable and well-formatted

**Files to modify**:
- `src/components/TopicReader.tsx` - Replace flashcard display with prose display
