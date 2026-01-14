# Read-Before-Quiz Feature Plan

**Status**: 📋 PLANNED
**Goal**: Allow users to read content topic by topic before being quizzed with flashcards

## Overview

Currently, users jump straight into flashcards without reading the underlying content. This feature adds a reading mode where users can read organized content by topic, confirm they've read it, and then generate flashcards for that topic. This improves learning by providing context before testing knowledge.

---

## Task 1: Extract Topic Content Structure ✅

Create a utility to organize flashcard data by topics (primary tags) and generate readable content summaries.

**Requirements**:
- ✅ Given flashcard data with tags, should group cards by primary topic tag
- ✅ Given a topic tag, should generate a readable summary of that topic's content
- ✅ Should identify primary tags vs secondary tags (e.g., 'commands' is primary, 'choice-hierarchy' extracts 'choice')
- ✅ Should work for both 'aidd' and 'aiddgen' decks

**Files created**:
- ✅ `src/utils/topicContent.ts` - Extract and organize topic content
- ✅ `src/types/topic.ts` - Topic type definitions

---

## Task 2: Create Topic Reading Component ✅

Build a component that displays topics one at a time with readable content.

**Requirements**:
- ✅ Given a list of topics, should display one topic at a time
- ✅ Should show topic name and organized content (all cards for that topic)
- ✅ Should have navigation (next/previous topic)
- ✅ Should show progress (e.g., "Topic 2 of 5")
- ✅ Should have a "Mark as Read" or "I've Read This" button
- ✅ Should track which topics have been read

**Files created**:
- ✅ `src/components/TopicReader.tsx` - Main reading interface component
- ✅ `src/types/topic.ts` - Topic type definitions (created in Task 1)

---

## Task 3: Add Topic Confirmation and Flashcard Generation ✅

Allow users to confirm they've read a topic and generate flashcards for confirmed topics.

**Requirements**:
- ✅ Given a confirmed topic, should generate flashcards for that topic
- ✅ Should only generate flashcards that don't already exist in storage
- ✅ Should provide feedback when flashcards are added
- ✅ Should allow users to review which topics are confirmed vs unconfirmed
- ✅ Should persist confirmation state (localStorage)

**Files created/modified**:
- ✅ `src/utils/topicConfirmation.ts` - Track topic confirmations and generate flashcards
- ✅ `src/components/TopicReader.tsx` - Added confirmation logic and flashcard generation

---

## Task 4: Integrate Reading Mode into Navigation ✅

Add reading mode as a new route/view option in the app.

**Requirements**:
- ✅ Given a deck selection, should offer "Read Topics" option alongside "Study" and "Manage Cards"
- ✅ Should add new route type: `{ type: 'read'; deckId: DeckId }`
- ✅ Should update App.tsx routing to handle read route
- ✅ Should add navigation button in header to access reading mode
- ✅ Should allow users to switch between read, study, and manage views

**Files modified**:
- ✅ `src/App.tsx` - Added read route, navigation button, and routing logic
- ✅ `src/components/TopicReader.tsx` - Already integrated (created in Task 2)

---

## Task 5: Topic Selection and Progress Tracking ✅

Allow users to see which topics are available, which they've read, and resume reading.

**Requirements**:
- ✅ Given a deck, should show list of all available topics
- ✅ Should indicate which topics have been read/confirmed
- ✅ Should allow users to jump to specific topics
- ✅ Should show overall progress (e.g., "3 of 10 topics read")
- ✅ Should allow resuming from last read topic

**Files modified**:
- ✅ `src/components/TopicReader.tsx` - Enhanced topic selection view with progress tracking and resume functionality
- ✅ `src/utils/topicConfirmation.ts` - Already tracks reading progress (created in Task 3)

---

## Next Steps

1. Start with Task 1 to establish the data structure
2. Then Task 2 to build the reading interface
3. Follow with Task 3 to enable confirmation
4. Integrate with Task 4
5. Polish with Task 5

