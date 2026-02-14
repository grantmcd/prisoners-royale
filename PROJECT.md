# Prisoners Royale - Project Status

## Overview
A Battle Royale tournament based on the Prisoner's Dilemma. Players design strategies using a visual logic builder and compete against each other.

## Current Status (as of 2026-02-14)

### ✅ COMPLETED

#### Backend (Server)
- [x] **Game Engine** (`server/game/logic.ts`)
  - Prisoner's Dilemma scoring (Temptation=5, Mutual=3, Punishment=1, Sucker=0)
  - Battle Royale elimination mechanics (lowest score each round)
  - 6 built-in strategies: AlwaysCooperate, AlwaysDefect, TitForTat, Grudger, Pavlov, Random

- [x] **Compiler** (`server/game/compiler.ts`)
  - Graph → Executable function transformation
  - Supports START, MOVE, CONDITION nodes
  - Condition types: OPPONENT_LAST, MY_LAST
  - Branching: yes/no edges

- [x] **API** (`server/routes/api.ts`)
  - GET `/api/health` - Health check
  - POST `/api/simulate` - Run tournament with custom strategies
  - Accepts strategy names and optional custom graph

#### Frontend (Client)
- [x] **LogicBuilder Component** (`client/src/components/LogicBuilder.tsx`)
  - Visual node editor with drag-and-drop
  - Node types: START, MOVE (Cooperate/Defect), CONDITION
  - Edge/connection drawing with SVG curves
  - onChange callback to parent with graph state

- [x] **Strategy Page** (`client/src/pages/Strategy.tsx`)
  - Visual builder integration
  - Simulation runner
  - Results display

#### Infrastructure
- [x] **CI/CD** - GitHub Actions builds on push
- [x] **Deployment** - ArgoCD syncing to K3s cluster
- [x] **DNS** - prisoners.tail05ac3b.ts.net (not resolving yet - needs Tailscale)

### 🚧 KNOWN ISSUES / BUGS

1. **"Upload to Terminal" button does NOTHING**
   - File: `client/src/pages/Strategy.tsx`
   - Missing `onClick` handler
   - Should compile the graph and show validation/results

2. **No visual feedback for compiled strategy**
   - Users can't see if their graph is valid
   - No preview of what the strategy will do
   - No way to test strategy in isolation

3. **Cannot name/save custom strategies**
   - All custom strategies appear as "CustomOperative"
   - No persistence between sessions
   - No strategy library/management

4. **Simulation results lack detail**
   - Doesn't show which strategies placed where
   - No breakdown of custom strategy performance
   - Round logs are text-only (no visuals)

5. **LogicBuilder UX issues**
   - No validation that graph is complete (dangling edges)
   - No indication of what the strategy logic evaluates to
   - Cannot edit/move existing connections

6. **API missing features**
   - No `/api/compile` endpoint for validation
   - No `/api/test-match` for 1v1 testing
   - No strategy leaderboard/persistence

### 📋 REMAINING TASKS (Priority Order)

#### P0 (Critical - Fix Now)
- [ ] Fix "Upload to Terminal" button (add compile functionality)
- [ ] Create `/api/compile` endpoint for strategy validation
- [ ] Add visual feedback showing compiled strategy behavior

#### P1 (Important - Next Sprint)
- [ ] Create `/api/test-match` for 1v1 quick testing
- [ ] Add strategy name input persistence
- [ ] Improve simulation results with placement breakdown
- [ ] Add "share strategy" functionality (export/import graph JSON)

#### P2 (Nice to Have)
- [ ] Visual tournament playback/animation
- [ ] Strategy marketplace (browse other players' strategies)
- [ ] ELO/ranking system
- [ ] Tournament history and replay
- [ ] Mobile-responsive UI improvements

### 🎯 DESIGN PRINCIPLES

1. **Visual First**: The logic builder is the core differentiator - make it shine
2. **Immediate Feedback**: Every action should show results (compile error, strategy preview, etc.)
3. **Learnable**: Built-in strategies serve as templates; users can remix them
4. **Battle Royale Feel**: Themed UI (terminal/cyberpunk), "survival" language, dramatic reveals

### 🔧 TECHNICAL STACK

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Express + TypeScript
- **Build**: tsup for server bundling
- **Container**: Docker multi-stage build
- **Deploy**: ArgoCD on K3s cluster
- **Ingress**: Traefik (?) - needs verification

### 📝 NOTES

- GitHub webhook configured for auto-deployment
- Strategy compiler validated with manual tests
- Built-in strategies act as benchmark/baseline
- Custom strategies need circuit breaker (no infinite loops via MAX_ITERATIONS)
