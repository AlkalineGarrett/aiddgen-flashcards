# Test Coverage Plan

**Status**: 📋 PLANNED  
**Goal**: Add comprehensive test coverage for TypeScript utility functions

## Overview

The codebase currently has minimal test coverage - only one test file (`fsrs.test.ts`) that isn't using Vitest properly. This plan outlines adding proper Vitest tests for all utility functions to ensure reliability and catch regressions.

---

## Task 1: Setup Vitest Infrastructure ✅

**Priority**: High  
**Estimated Effort**: ~30 minutes  
**Status**: COMPLETED

**Requirements**:
- ✅ Given the project uses Vite, should install Vitest and configure it
- ✅ Given tests need to run, should add test script to package.json
- ✅ Given tests need proper structure, should configure vite.config.ts for Vitest

**Tasks**:
1. ✅ Install Vitest and related dependencies (`vitest`)
2. ✅ Update `vite.config.ts` to include Vitest configuration
3. ✅ Add `test` script to `package.json`
4. ✅ Convert existing `fsrs.test.ts` to proper Vitest format (8 tests passing)

---

## Core Utility Tests (Priority: High)

### Task 2: cardStatus.ts Tests ✅

**Priority**: High  
**Estimated Effort**: ~45 minutes  
**Status**: COMPLETED

**Requirements**:
- ✅ Given a new card (reviewCount === 0), should return 'new' status
- ✅ Given a learning card (reviewCount < 3), should return 'learning' status
- ✅ Given a mastered card (stability >= 30), should return 'mastered' status
- ✅ Given a review card (reviewCount >= 3, stability < 30), should return 'review' status
- ✅ Given any status, should return correct color and label
- ✅ Given cards array and status filter, should filter correctly
- ✅ Given cards array and tag filter, should filter by tag
- ✅ Given cards array and search text, should search front and back

**Test File**: `src/utils/cardStatus.test.ts` (24 tests passing)

---

### Task 3: cardUtils.ts Tests ✅

**Priority**: High  
**Estimated Effort**: ~60 minutes  
**Status**: COMPLETED

**Requirements**:
- ✅ Given a card, should reset state to initial values
- ✅ Given a timestamp, should format to localized date string
- ✅ Given a timestamp, should calculate days since correctly
- ✅ Given a card, should calculate days since creation
- ✅ Given a reviewed card, should calculate days since last review
- ✅ Given an unreviewed card, should return null for days since last review
- ✅ Given a card, should correctly identify if it's new
- ✅ Given cards array and topicId, should filter by topic
- ✅ Given cards array and incorrect card IDs, should filter correctly
- ✅ Given a card review, should process and return correct metadata
- ✅ Given card index and quiz mode, should calculate next index correctly
- ✅ Given card index in normal mode, should loop back to start

**Test File**: `src/utils/cardUtils.test.ts` (32 tests passing)

---

### Task 4: reviewQueue.ts Tests ✅

**Priority**: High  
**Estimated Effort**: ~75 minutes  
**Status**: COMPLETED

**Requirements**:
- ✅ Given no stored config, should return default config
- ✅ Given stored config, should load correctly
- ✅ Given new day, should reset daily count
- ✅ Given config, should save to localStorage
- ✅ Given cards array, should build queue with new and review cards
- ✅ Given daily limit, should limit new cards in queue
- ✅ Given due cards, should prioritize overdue review cards
- ✅ Given queue, should increment new cards studied
- ✅ Given new day, should reset daily count on increment
- ✅ Given max cards setting, should update config
- ✅ Given queue and config, should calculate stats correctly

**Test File**: `src/utils/reviewQueue.test.ts` (17 tests passing)  
**Note**: Uses localStorage mocking for Node.js environment

---

### Task 5: statistics.ts Tests ✅

**Priority**: Medium  
**Estimated Effort**: ~45 minutes  
**Status**: COMPLETED

**Requirements**:
- ✅ Given empty cards array, should return zero statistics
- ✅ Given cards array, should count total cards correctly
- ✅ Given cards array, should count due cards correctly
- ✅ Given cards array, should count by status (new, learning, review, mastered)
- ✅ Given cards array, should calculate average stability
- ✅ Given cards array, should calculate average difficulty
- ✅ Given cards array, should sum total reviews
- ✅ Given cards array, should calculate retention rate (stability > 0.4)

**Test File**: `src/utils/statistics.test.ts` (16 tests passing)

---

## Secondary Utility Tests (Priority: Medium)

### Task 6: quizUtils.ts Tests ✅

**Priority**: Medium  
**Estimated Effort**: ~30 minutes  
**Status**: COMPLETED

**Requirements**:
- ✅ Given correct and total counts, should calculate score percentage
- ✅ Given zero total, should return 0 score
- ✅ Given counts, should create quiz result object correctly
- ✅ Given quiz result, should save to localStorage with deck and topic keys
- ✅ Given all correct cards, should clear incorrect card IDs
- ✅ Given saved result, should load from localStorage
- ✅ Given no saved result, should return null
- ✅ Given deck and topic, should get incorrect card IDs from saved result

**Test File**: `src/utils/quizUtils.test.ts` (20 tests passing)  
**Note**: Uses localStorage mocking for Node.js environment

---

### Task 7: studySession.ts Tests ✅

**Priority**: Medium  
**Estimated Effort**: ~20 minutes  
**Status**: COMPLETED

**Requirements**:
- ✅ Given start time, should create session with correct initial values
- ✅ Given session and current time, should update time spent correctly
- ✅ Given session, should increment cards reviewed count

**Test File**: `src/utils/studySession.test.ts` (12 tests passing)

---

### Task 8: quizTracking.ts Tests ✅

**Priority**: Medium  
**Estimated Effort**: ~25 minutes  
**Status**: COMPLETED

**Requirements**:
- ✅ Given no state, should create initial tracking state
- ✅ Given state, should reset to initial state
- ✅ Given card answer, should track in answered cards set
- ✅ Given correct answer, should add to correct set
- ✅ Given incorrect answer, should add to incorrect set
- ✅ Given tracking state and total cards, should detect completion

**Test File**: `src/utils/quizTracking.test.ts` (17 tests passing)

---

## Storage Utility Tests (Priority: Low)

### Task 9: storage.ts Tests ✅

**Priority**: Low  
**Estimated Effort**: ~90 minutes  
**Status**: COMPLETED

**Requirements**:
- ✅ Given deck ID and cards, should save to localStorage
- ✅ Given deck ID, should load cards from localStorage
- ✅ Given invalid card data, should filter out invalid cards
- ✅ Given old schema version, should migrate correctly
- ✅ Given version 0 data (array), should migrate to version 1
- ✅ Given version 1 data, should migrate to version 2 (decks)
- ✅ Given clearStorage call, should remove all data
- ✅ Given deck ID, should clear only that deck
- ✅ Given multiple decks, should get all deck IDs
- ✅ Given multiple decks, should get all cards across decks
- ✅ Given storage available, should detect availability
- ✅ Given stored data, should estimate storage size

**Test File**: `src/utils/storage.test.ts` (24 tests passing)  
**Note**: Uses localStorage mocking for Node.js environment, tests schema migration

---

## Test Execution Strategy

**Approach**: 
1. Start with infrastructure setup
2. Test core utilities first (cardStatus, cardUtils, reviewQueue, statistics)
3. Test secondary utilities (quizUtils, studySession, quizTracking)
4. Test storage utilities last (most complex, requires extensive mocking)

**Testing Philosophy** (per PoC lifecycle):
- Keep tests simple and focused
- Test happy paths and critical edge cases
- Skip comprehensive coverage for PoC
- Use Vitest patterns per @rules/stack/vitest.mdc
