# Multi-Deck Flashcard System Epic

**Status**: 📋 PLANNED
**Goal**: Extend flashcard app to support multiple decks (aidd/ and aiddgen/) with separate card management and study sessions

## Overview

The current flashcard app only supports learning aiddgen/. To enable learning both aidd/ (the generated agent rules) and aiddgen/ (the generator framework), we need to add multi-deck support. Users should be able to choose which deck to study when they visit the page, and each deck should maintain separate card states, progress, and statistics. This requires updating the storage schema, adding deck selection UI, generating flashcards for aidd/, and updating all components to work with deck-scoped data.

---

## Task 2: Update Storage Schema for Multi-Deck Support

Extend storage schema to support multiple decks with separate card collections.

**Requirements**:
- Given storage schema, should add deckId field to track which deck cards belong to
- Given storage schema, should support storing cards for multiple decks (aidd, aiddgen)
- Given storage migration, should migrate existing cards to "aiddgen" deck
- Given storage functions, should update saveCards/loadCards to accept deckId parameter
- Given storage schema version, should increment to version 2
- Given corrupted data, should gracefully handle missing deckId (default to aiddgen for backward compatibility)

---

## Task 3: Add Deck Selection UI

Create initial deck selection screen that appears when user visits the app.

**Requirements**:
- Given app load, should show deck selection screen if no deck is selected
- Given deck selection screen, should display options for "aidd/" and "aiddgen/" decks
- Given deck selection, should show deck description and card count
- Given deck selection, should persist selected deck in localStorage
- Given deck selection, should navigate to main app view with selected deck active
- Given app with selected deck, should allow switching decks via UI

---

## Task 4: Update App Component for Deck Context

Modify App.tsx to manage deck selection and provide deck context to child components.

**Requirements**:
- Given App component, should manage current deck state
- Given App component, should load selected deck from localStorage on mount
- Given App component, should show deck selection if no deck selected
- Given App component, should pass deckId to storage hooks and components
- Given App component, should allow deck switching via header/navigation
- Given deck switch, should preserve all deck states independently

---

## Task 5: Update Storage Hook for Deck Scoping

Modify useCardStorage hook to work with deck-specific card collections.

**Requirements**:
- Given useCardStorage hook, should accept deckId parameter
- Given useCardStorage hook, should load only cards for specified deck
- Given useCardStorage hook, should save cards with deckId association
- Given useCardStorage hook, should initialize deck with generated flashcards if empty
- Given useCardStorage hook, should handle deck switching without losing state
- Given multiple decks, should maintain separate card states per deck

---

## Task 6: Update Flashcard Generator to Support Decks

Modify flashcard generator to support both aidd and aiddgen decks.

**Requirements**:
- Given flashcard generator, should export generateAiddFlashcards() function
- Given flashcard generator, should export generateAiddgenFlashcards() function (existing)
- Given flashcard generator, should export getDeckGenerator(deckId) helper
- Given card generation, should prefix IDs with deck name (aidd-1, aiddgen-1)
- Given card generation, should include deck-specific tags
- Given flashcard generator, should maintain existing aiddgen flashcards unchanged

---

## Task 7: Update Study Component for Deck Context

Modify Study component to work with current deck's cards only.

**Requirements**:
- Given Study component, should receive deckId as prop
- Given Study component, should use deck-scoped cards from storage
- Given Study component, should build review queue from current deck only
- Given Study component, should track session stats per deck
- Given Study component, should display current deck name in UI
- Given Study component, should work independently for each deck

---

## Task 8: Update Card Management for Deck Context

Modify CardManagement component to manage cards for current deck only.

**Requirements**:
- Given CardManagement component, should receive deckId as prop
- Given CardManagement component, should display only cards from current deck
- Given CardManagement component, should filter/search within current deck
- Given CardManagement component, should show statistics for current deck only
- Given CardManagement component, should allow card operations (reset, delete) within deck
- Given CardManagement component, should display deck name in header

---

## Task 9: Update Statistics and Utilities for Deck Scoping

Modify statistics and utility functions to work with deck-specific data.

**Requirements**:
- Given statistics calculation, should accept deckId and filter cards by deck
- Given review queue, should build queue from current deck only
- Given card status utilities, should work with deck-scoped cards
- Given tag utilities, should return tags for current deck only
- Given all utilities, should maintain backward compatibility where possible

---

## Task 10: Add Deck Switching and Persistence

Implement deck switching functionality with proper state management.

**Requirements**:
- Given deck switching, should save current deck selection to localStorage
- Given deck switching, should preserve all card states for both decks
- Given deck switching, should update UI to show new deck's cards
- Given deck switching, should reset study session state
- Given deck switching, should maintain separate statistics per deck
- Given app reload, should restore last selected deck

---

## Task 11: Generate Aidd Flashcards

Move the existing plan to archive and create flashcard generator for aidd/ content.

**Requirements**:
- Given aidd/ directory structure, should generate flashcards covering:
  - Core rules (thinking patterns, behaviors, lifecycle defaults)
  - Agent orchestrator (agent triggers, command mappings)
  - Commands (/help, /plan, /task, /review, /commit, /explain, /debug, /component)
  - Stack rules (React, Vite, Vitest patterns)
  - Pattern rules (component generation)
  - Review rules
  - TDD rules
  - Task creator rules
- Given generated flashcards, should use deck identifier "aidd" in card IDs
- Given flashcard generator, should export function generateAiddFlashcards() similar to generateAiddgenFlashcards()

