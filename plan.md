# Browser Routing Epic

**Status**: 📋 PLANNED
**Goal**: Add browser-based URL routing with history support for bookmarkable URLs and back button navigation

## Overview

The current flashcard app uses React state for navigation, which means URLs don't reflect the current view and users can't bookmark specific pages or use the browser back button. Adding browser routing with URL paths enables users to bookmark their study sessions, share direct links to specific decks or views, and navigate naturally with browser controls. This improves usability and makes the app feel more like a standard web application. We'll use the browser History API directly (no routing library) to keep the PoC implementation simple.

---

## Task 1: Add Browser-Based Routing with History Support

Add URL routing with browser history management to enable bookmarkable URLs and back button support.

**Requirements**:
- Given app navigation, should use browser URL paths for different views:
  - `/` - Deck selection screen
  - `/study/:deckId` - Study view for specific deck
  - `/manage/:deckId` - Card management view for specific deck
- Given URL navigation, should update browser history using History API
- Given browser back button, should navigate to previous route and restore appropriate view/deck
- Given direct URL access, should load correct view and deck based on URL path
- Given deck selection, should navigate to `/study/:deckId` route
- Given view switching, should update URL to reflect current view
- Given deck switching, should navigate to `/` (deck selection) route
- Given App component, should use browser History API (no external routing library for PoC simplicity)
- Given route changes, should sync URL with current view and deck state
