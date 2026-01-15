# Unexpected Behavior Catalog

This document catalogs tests that check for behavior that seems odd or buggy, and cases where tests don't match the intent of plans in the archive.

## 1. Tests Adapted to Buggy Behavior

### 1.1 Quiz Tracking: Card Can Be in Both Correct and Incorrect Sets ✅ FIXED

**File**: `src/utils/quizTracking.test.ts`  
**Test**: "should handle same card answered multiple times" (lines 140-155)

**Issue**: When a card is answered multiple times with different correctness values, it can end up in both `correctCardIds` and `incorrectCardIds` sets simultaneously.

**Expected Behavior**: If a card is first answered correctly, then incorrectly, it should be removed from `correctCardIds` and added to `incorrectCardIds` (or vice versa). A card should only be in one set at a time.

**Current Behavior**: The implementation doesn't remove cards from the opposite set when tracking a new answer. The test comment acknowledges this: "Note: Implementation doesn't remove from previous set, so card can be in both. This is a limitation - card remains in correctCardIds from first answer."

**Code Location**: `src/utils/quizTracking.ts:31-44`

**Impact**: This could lead to incorrect statistics or confusion when determining which cards were actually correct vs incorrect in a quiz session.

**Status**: ✅ **FIXED** - `trackQuizAnswer` now removes the card from the opposite set when re-answering.

---

### 1.2 Review Queue: Negative New Cards Available ✅ FIXED

**File**: `src/utils/reviewQueue.test.ts`  
**Test**: "should not return negative remaining slots" (lines 405-425)

**Issue**: The `newCardsAvailable` statistic can return negative values when `newCardsStudiedToday` exceeds `maxNewCardsPerDay`.

**Expected Behavior**: `newCardsAvailable` should never be negative. It should be clamped to 0 or at least return a meaningful value.

**Current Behavior**: The calculation `queue.newCards.length + (config.maxNewCardsPerDay - config.newCardsStudiedToday)` can result in negative values. The test explicitly expects `-5` in one case, with a comment: "newCardsAvailable can be negative when studied > limit (implementation behavior)".

**Code Location**: `src/utils/reviewQueue.ts:170`

**Impact**: Negative values for "available" cards don't make semantic sense and could confuse users or break UI displays that assume non-negative values.

**Note**: `remainingNewCardSlots` is correctly clamped with `Math.max(0, ...)`, but `newCardsAvailable` is not.

**Status**: ✅ **FIXED** - `newCardsAvailable` is now clamped to 0 minimum using `Math.max(0, ...)`.

---

### 1.3 Storage: Schema Migration Not Persisted Automatically ✅ FIXED

**File**: `src/utils/storage.test.ts`  
**Tests**: "should migrate from version 0 (array format) to version 2" and "should migrate from version 1 (cards array) to version 2" (lines 335-379)

**Issue**: Schema migration happens in memory during `loadCards()`, but the migrated data is not automatically persisted back to localStorage.

**Expected Behavior**: When old schema data is detected and migrated, it should be automatically saved back to localStorage so the migration persists across page reloads.

**Current Behavior**: Migration only occurs in memory. The tests require explicitly calling `saveCards()` after `loadCards()` to persist the migration. The test comments acknowledge this: "Migration happens in memory - save to persist it".

**Code Location**: `src/utils/storage.ts:67-92` (loadAllDecks and migrateSchema)

**Impact**: 
- Users with old schema data will have their data migrated every time they load, but it won't persist
- This could cause performance issues if migration is expensive
- The migration logic runs repeatedly instead of once

**Workaround**: The codebase likely handles this elsewhere by saving after loading, but it's not guaranteed and creates a potential data consistency issue.

**Status**: ✅ **FIXED** - `loadAllDecks` now automatically persists migrated data back to localStorage when migration occurs.

---

## 2. Tests That Don't Match Original Intent

### 2.1 Quiz Mode: Single Chance Per Card ✅ ADDRESSED

**Archive Plan**: `archive/2026-01-15-quiz-mode.md`  
**Task 2**: "Given user rates a card, should mark as answered and move to next card (no retries)"

**Test Coverage**: The tests in `quizTracking.test.ts` don't explicitly verify that a card can only be answered once in quiz mode. The test "should handle same card answered multiple times" actually documents that the same card CAN be answered multiple times, which contradicts the original intent.

**Expected Behavior**: In quiz mode, once a card is answered, it should not be answerable again in the same quiz session.

**Current Behavior**: The tracking system allows the same card to be tracked multiple times, which could allow retries if the UI doesn't prevent it.

**Status**: ✅ **ADDRESSED** - Added integration test in `quizIntegration.test.ts` that documents:
- `getNextCardIndex` in quiz mode doesn't loop back (prevents re-answering)
- `answeredCards` Set prevents duplicate entries (Set behavior)
- Single-chance enforcement happens at the component level via navigation logic

---

### 2.2 Quiz Mode: Filter Incorrect Cards on Re-quiz ✅ ADDRESSED

**Archive Plan**: `archive/2026-01-15-quiz-mode.md`  
**Task 5**: "Given user is re-quizzing a topic, should filter to only cards answered incorrectly in previous quiz"

**Test Coverage**: The `filterCardsForQuiz` function in `cardUtils.test.ts` tests filtering by incorrect card IDs, but there's no test that verifies the integration with quiz results storage and loading.

**Expected Behavior**: When starting a quiz for a topic that was previously quizzed, the system should:
1. Load previous quiz results for that topic
2. Filter to only show cards that were incorrect
3. If all cards were correct, show a success message instead of quiz

**Current Test Coverage**: Tests exist for:
- `filterCardsForQuiz` with incorrect card IDs (cardUtils.test.ts:235-253)
- Loading quiz results (quizUtils.test.ts:216-300)
- Getting incorrect card IDs from quiz (quizUtils.test.ts:303-377)

**Status**: ✅ **ADDRESSED** - Added integration tests in `quizIntegration.test.ts` that verify:
- Full flow: save quiz results → load results → get incorrect IDs → filter cards
- Filtering to only incorrect cards when re-quizzing
- Handling case when all cards were correct
- Combining topic filtering with incorrect card filtering

---

### 2.3 Multi-Deck: Deck-Scoped Statistics ✅ ADDRESSED

**Archive Plan**: `archive/2026-01-14-multi-deck-flashcard-system-epic.md`  
**Task 9**: "Given statistics calculation, should accept deckId and filter cards by deck"

**Test Coverage**: `statistics.test.ts` tests the `calculateStatistics` function, but it doesn't test deck filtering. The function doesn't accept a `deckId` parameter.

**Expected Behavior**: Statistics should be calculated per deck, not across all decks.

**Current Behavior**: The `calculateStatistics` function accepts a `cards` array but doesn't filter by deck. It's assumed that the caller has already filtered to the correct deck.

**Status**: ✅ **ADDRESSED** - 
- Added JSDoc comment to `calculateStatistics` documenting that deck filtering is the caller's responsibility
- Added test in `statistics.test.ts` that demonstrates:
  - Function operates on whatever cards array it receives
  - If caller doesn't filter, statistics include all decks
  - If caller filters by deck, statistics are deck-specific
- This design keeps the function pure and allows it to work with any subset of cards

---

## 3. Summary

### Bugs/Issues Identified:
1. **Quiz tracking allows cards in both correct/incorrect sets** - Should remove from opposite set when re-answering
2. **Review queue can return negative "available" cards** - Should clamp to 0 minimum
3. **Schema migration not persisted automatically** - Should save migrated data back to storage

### Missing Test Coverage:
1. **Quiz mode single-chance enforcement** - No test verifying cards can't be re-answered
2. **Re-quiz filtering integration** - No end-to-end test for incorrect-card filtering flow
3. **Deck-scoped statistics** - Statistics function doesn't filter by deck as planned

### Recommendations:
1. ✅ Fix `trackQuizAnswer` to remove card from opposite set when re-answering - **COMPLETED**
2. ✅ Clamp `newCardsAvailable` to 0 minimum in `getQueueStats` - **COMPLETED**
3. ✅ Auto-persist schema migrations in `loadAllDecks` or add explicit migration persistence step - **COMPLETED**
4. ✅ Add integration tests for quiz mode single-chance and re-quiz filtering - **COMPLETED**
5. ✅ Either add deck filtering to `calculateStatistics` or document that filtering happens at caller level - **COMPLETED**

