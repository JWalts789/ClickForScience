# Click, For Science! -- Game Design Document

## Concept
A normal guy ("Gary") in his garage becomes a mad scientist based on the player's upgrade choices. Humorous/satirical idle/incremental game. Web-based, deep systems, infinite play.

## Core Loop
Click "Experiment" -> Earn Research Points (RP) -> Buy Generators -> Auto-produce RP -> Buy Upgrades (with hidden Madness Tags) -> Shift dominant archetype -> Hit soft cap -> Prestige ("Snap Out of It") -> Earn Breakthrough Points (BP) -> Repeat faster + weirder

## Tech Stack
- Svelte 5 + TypeScript + Vite
- break_eternity.js (big numbers)
- lz-string (save compression)
- Plain CSS with custom properties
- Hosted on Netlify + itch.io

## Architecture Principles
1. Game logic = pure TypeScript (no Svelte deps, fully testable)
2. Svelte components = thin (read state, dispatch actions)
3. Single source of truth (one GameState object)
4. Deterministic ticks (state + deltaTime = next state)
5. All game numbers are Decimal (break_eternity.js)

## Implementation Phases
- Phase 1: Core loop MVP (click, 4 generators, save/load)
- Phase 2: Upgrades + all 10 generators
- Phase 3: Madness system + lab notes + UI themes
- Phase 4: Prestige system
- Phase 5: Events + dilemmas + world reactions
- Phase 6: Polish + deployment

See mad_scientist_clicker_research.md for full design details.
