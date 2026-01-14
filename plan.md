# Aiddgen Flashcard App Epic

**Status**: 📋 PLANNED
**Goal**: Build a web-based flashcard app using FSRS algorithm to learn how aiddgen/ works

## Overview

Learning aiddgen/ requires understanding its architecture, command system, rule generation, and choice hierarchy. A spaced repetition flashcard app will help internalize these concepts efficiently. The app will be browser-only (no backend) storing progress locally, using the FSRS (Free Spaced Repetition Scheduler) algorithm for optimal review timing. Flashcards will be auto-generated from the aiddgen/ codebase structure and documentation.

---

## Task 1: Project Setup

Set up a React + TypeScript + Vite project with basic structure.

**Requirements**:
- Given a new project directory, should initialize Vite with React + TypeScript template
- Given the project, should configure basic folder structure (components, utils, types)
- Given the project, should install dependencies (React, TypeScript, Vite)
- Given the project, should verify dev server runs and displays a basic page

---

## Task 2: FSRS Algorithm Implementation

Implement the FSRS algorithm core logic for calculating next review intervals.

**Requirements**:
- Given a card with current state (difficulty, stability, last review), should calculate next review date using FSRS
- Given a review result (quality 0-5), should update card state (difficulty, stability, last review)
- Given card state, should determine if card is due for review
- Given multiple cards, should sort by priority (most due first)

---

## Task 3: Local Storage Persistence

Implement browser localStorage for saving card progress and user state.

**Requirements**:
- Given card review results, should persist to localStorage
- Given app load, should restore card state from localStorage
- Given localStorage data, should handle migration if schema changes
- Given corrupted localStorage, should gracefully fallback to defaults

---

## Task 4: Flashcard Generation from Aiddgen

Scan aiddgen/ directory structure and generate flashcards from rules, commands, and documentation.

**Requirements**:
- Given aiddgen/ directory, should scan for .mdc files and extract key concepts
- Given rule files, should generate flashcards for agent triggers, mappings, and processes
- Given command files, should generate flashcards for command descriptions and usage
- Given choice hierarchy, should generate flashcards for lifecycle stages and defaults
- Given generated flashcards, should store in app state with initial FSRS parameters

---

## Task 5: Study Interface

Build the main study interface for reviewing flashcards.

**Requirements**:
- Given a study session, should display one card at a time (front side)
- Given user clicks "Show Answer", should reveal back side of card
- Given user rates quality (0-5), should update card state and show next card
- Given no cards due, should show completion message
- Given study session, should track session statistics (cards reviewed, time spent)

---

## Task 6: Card Management UI

Create interface for viewing, filtering, and managing flashcards.

**Requirements**:
- Given card collection, should display list of all cards with status (new, learning, review, mastered)
- Given card list, should filter by status, tag, or search text
- Given card selection, should show detailed card view with history
- Given card management, should allow manual reset of card state
- Given card collection, should show statistics (total cards, due count, retention rate)

---

## Task 7: Review Queue and Scheduling

Implement review queue that prioritizes cards based on FSRS calculations.

**Requirements**:
- Given card collection, should identify all due cards
- Given due cards, should sort by priority (overdue first, then by stability)
- Given review queue, should limit daily new cards (configurable)
- Given review session, should mix new and review cards appropriately
- Given review completion, should update next review dates

---

## Next Steps

1. Start with Task 1: Project Setup
2. Implement FSRS core (Task 2) before building UI
3. Add persistence (Task 3) early to preserve progress
4. Generate flashcards (Task 4) to populate the app
5. Build study interface (Task 5) for core functionality
6. Add management UI (Task 6) for better UX
7. Polish scheduling (Task 7) for optimal learning

