# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Development (hot reload)
npm run dev

# Build TypeScript
npm run build

# Type checking only
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Format code
npm run format
npm run format:check

# Run tests (vitest)
npx vitest run                    # All tests
npx vitest run mcp-tools.test.ts  # Single file

# Database migrations
npm run migrate

# Clean build artifacts
npm run clean

# Production start (requires build first)
npm start
```

There's also a Makefile with additional commands: `make help` lists all targets.

## Architecture Overview

This is a full-featured Discord bot powered by the pi-mono agent framework. It provides 89+ MCP tools, bash execution, file operations, voice channels, and persistent memory.

### Core Dependencies

- **@mariozechner/pi-agent-core**: Agent runtime and event handling
- **@mariozechner/pi-ai**: AI model abstraction layer (AgentTool, Model types)
- **discord.js**: Discord API client
- **better-sqlite3**: SQLite database (WAL mode enabled)

### Key Source Files

**`src/main.ts`** (2500+ lines) - Main entry point containing:
- Discord client setup with intents and slash command registration
- Multi-provider model configuration (OpenRouter, Cerebras, Groq, Z.ai, Ollama)
- Message handling and agent execution loop
- Rate limiting and bot statistics
- All slash command implementations

**`src/mcp-tools.ts`** - 89+ MCP tools organized by category:
- Web search/scrape, GitHub, HuggingFace integrations
- Memory (knowledge graph), skills, task management
- Voice (TTS/STT), code sandbox, file processing
- Each tool follows the `AgentTool` interface with `execute()` method

**`src/database.ts`** - SQLite persistence layer:
- Tables: users, alerts, command_history, settings, scheduled_tasks, semantic_memories
- Singleton pattern via `initDatabase()` / `getDatabase()`
- All queries use prepared statements
- Vector embedding storage with BLOB support

**`src/agents/embeddings.ts`** - Vector embeddings with Xenova Transformers:
- Model: all-MiniLM-L6-v2 (384-dimensional embeddings)
- Functions: `generateEmbedding()`, `cosineSimilarity()`, `generateEmbeddingsBatch()`
- Singleton pattern for efficient model reuse

**`src/agents/semantic-search.ts`** - Semantic memory search:
- `SemanticSearchService` class for vector-based memory retrieval
- Search by natural language queries with similarity scoring
- Metadata filtering and memory management
- Singleton via `getSemanticSearchService(db)`

### Module Organization

```
src/
├── main.ts              # Entry point, Discord client, slash commands
├── mcp-tools.ts         # 89+ MCP tool implementations
├── database.ts          # SQLite layer (BotDatabase class)
├── scheduler.ts         # Cron-based task scheduling (node-cron)
├── analytics.ts         # Usage tracking and metrics
├── dashboard-integration.ts  # Express server for monitoring dashboard
├── webhook-server.ts    # External alert/signal endpoints
├── trading/             # Multi-agent trading system
│   ├── orchestrator.ts  # Coordinates all trading agents
│   ├── consensus.ts     # Signal consensus engine
│   ├── base-agent.ts    # Base class for trading agents
│   └── agents/          # PriceAgent, SentimentAgent, WhaleAgent
├── voice/               # Voice channel support
│   ├── vibevoice.ts     # Microsoft TTS integration
│   ├── whisper-local.ts # Local Whisper STT
│   └── voice-session.ts # Per-channel voice state
├── agents/              # AI agent integrations (Claude, OpenHands)
│   ├── expertise/       # Agent Experts learning files (per mode)
│   ├── hooks/           # pi-coding-agent compatible hook system
│   │   ├── checkpoint-hook.ts   # Git-based state snapshots
│   │   ├── lsp-hook.ts          # Language server diagnostics
│   │   ├── expert-hook.ts       # Act-Learn-Reuse integration
│   │   ├── discord-integration.ts # Per-channel lifecycle hooks
│   │   └── hook-manager.ts      # Event coordination
│   ├── skills/          # Agent Skills spec loader and sync
│   │   ├── loader.ts    # SKILL.md parsing and validation
│   │   ├── sync.ts      # Import/export from aitmpl.com catalog
│   │   ├── types.ts     # AgentSkill, SkillFrontmatter types
│   │   └── index.ts     # Skills exports
│   ├── claude-agent.ts  # Claude Code subagent spawning
│   ├── openhands-agent.ts   # OpenHands SDK TypeScript wrapper
│   ├── openhands-runner.py  # OpenHands Python runner (GLM via Z.ai)
│   ├── self-debug.ts    # Autonomous error detection and repair
│   ├── dependency-inference.ts  # NLP-based task dependency detection
│   ├── agent-persona.ts  # Structured agent personality system
│   ├── agent-swarm.ts    # Multi-agent swarm coordination
│   ├── twitter-connector.ts  # Twitter/X cross-platform integration
│   └── index.ts         # Agent exports
├── music/               # AI music generation
│   └── suno-service.ts  # Suno API integration (sunoapi.org)
├── knowledge/           # RAG knowledge base
├── cross-platform-hub.ts # Unified Discord/Slack/Telegram/GitHub messaging
└── news/                # News feed integration
```

### Cross-Platform Hub

Unified messaging layer that connects Discord, Slack, Telegram, and GitHub Actions:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Discord   │     │    Slack    │     │  Telegram   │     │   GitHub    │
│    Bot      │     │    (MOM)    │     │    Bot      │     │   Action    │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         CROSS-PLATFORM HUB                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  Event Bus  │  │   Router    │  │   Context   │  │  Webhooks   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘     │
└──────────────────────────────────────────────────────────────────────────┘
```

**Files:**
- `src/cross-platform-hub.ts` - Core hub with event routing, platform adapters
- `src/webhook-server.ts` - Hub webhook endpoints (`/hub/*`)

**Hub Endpoints:**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/hub/message` | POST | Ingest cross-platform message |
| `/hub/broadcast` | POST | Broadcast to all platforms |
| `/hub/github` | POST | GitHub webhook handler |
| `/hub/stats` | GET | Hub statistics |
| `/hub/routes` | GET/POST/DELETE | Manage routing rules |

**TypeScript API:**
```typescript
import { getHub, CrossPlatformHub } from "./cross-platform-hub.js";

// Get singleton hub instance
const hub = getHub();

// Register platforms
hub.registerDiscord(discordClient, reportChannelId);
hub.registerTelegram(telegramBot, chatId);
hub.registerSlack(slackWebClient, channelId);
hub.registerGitHub(webhookUrl, token);

// Ingest a message (triggers routing rules)
await hub.ingest({
  id: "msg-123",
  timestamp: new Date(),
  source: "discord",
  sourceId: "channel-123",
  sourceUser: "user123",
  content: "Trading signal: BUY BTC",
});

// Broadcast to all connected platforms
await hub.broadcast("System alert: New deployment", {
  platforms: ["discord", "telegram"],
  priority: "high",
});

// Add custom routing rule
hub.addRoute({
  id: "trading-alerts",
  from: "discord",
  to: ["telegram", "slack"],
  toIds: { telegram: "123456789", slack: "C0123456" },
  filter: (msg) => msg.content.includes("signal"),
  enabled: true,
});
```

### Agent Mail System (MCP Agent Mail Pattern)

Email-like coordination layer for multi-agent communication with human oversight:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AGENT MAIL BUS                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  Threading   │  │  Importance  │  │   Contacts   │  │ Reservations │   │
│  │  & Replies   │  │  & Priority  │  │   & Policies │  │ (File Locks) │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
         │                    │                    │                    │
         ▼                    ▼                    ▼                    ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Agent A   │      │   Agent B   │      │   Agent C   │      │  Human API  │
│  (Trading)  │      │  (Coding)   │      │  (Research) │      │  Oversight  │
└─────────────┘      └─────────────┘      └─────────────┘      └─────────────┘
```

**Files:**
- `src/agents/agent-messaging.ts` - Enhanced messaging with email semantics
- `src/agents/file-reservations.ts` - Advisory file leases
- `src/agents/agent-mail-mcp.ts` - MCP server integration
- `src/webhook-server.ts` - Human oversight API (`/agent-mail/*`)

**Agent Mail Endpoints:**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/agent-mail/stats` | GET | Messaging statistics |
| `/agent-mail/inbox/:agentId` | GET | View agent inbox |
| `/agent-mail/threads/:agentId` | GET | List agent threads |
| `/agent-mail/thread/:threadId` | GET | View specific thread |
| `/agent-mail/send` | POST | Human overseer message |
| `/agent-mail/search` | GET | Search messages |
| `/agent-mail/contacts` | GET | Pending contact requests |
| `/agent-mail/contacts/:id/approve` | POST | Approve contact |
| `/agent-mail/contacts/:id/block` | POST | Block contact |

**TypeScript API:**
```typescript
import {
  getAgentMessageBus,
  createAgentMessagingTools,
  getFileReservationManager,
} from "./agents/index.js";

// Get singleton message bus
const bus = getAgentMessageBus();

// Register an agent with handler
bus.registerAgent(
  { id: "trading-agent", name: "Trading", tags: ["trading", "worker"] },
  async (message) => {
    console.log("Received:", message.subject);
    return "Acknowledged";
  }
);

// Send email-like message
await bus.sendEnhanced({
  from: "orchestrator",
  to: ["trading-agent", "risk-agent"],
  cc: ["monitoring-agent"],
  subject: "New Trading Signal",
  content: "BTC bullish pattern detected",
  importance: "high",
  ackRequired: true,
});

// Reply to thread
await bus.reply({
  from: "trading-agent",
  threadId: "thread_123",
  content: "Position opened at $42,000",
});

// File reservations (prevent edit conflicts)
const reservations = getFileReservationManager();
const result = reservations.reserve(
  "agent-id",
  "Agent Name",
  "project-id",
  "src/trading/**/*.ts",
  { exclusive: true, ttlMinutes: 30, reason: "Refactoring trading module" }
);

// Get messaging tools for agent
const tools = createAgentMessagingTools(bus, "my-agent-id");
// Tools: send_enhanced_message, reply_to_thread, get_inbox, list_threads, etc.
```

**MCP Server Usage:**
```bash
# Run as standalone MCP server
AGENT_ID=my-agent PROJECT_ID=my-project node dist/agents/agent-mail-mcp.js

# Add to MCP config
{
  "mcpServers": {
    "agent-mail": {
      "command": "node",
      "args": ["dist/agents/agent-mail-mcp.js"],
      "env": { "AGENT_ID": "claude", "PROJECT_ID": "default" }
    }
  }
}
```

### OpenHands Software Agent Integration

The bot integrates OpenHands SDK for expert-level software development tasks via `/openhands` command:

```
Discord /openhands <subcommand>
    └── TypeScript (openhands-agent.ts)
            └── Python subprocess (openhands-runner.py)
                    └── OpenHands SDK with Expert Modes
                            └── Z.ai API (GLM-4.6 via LiteLLM)
```

**Files:**
- `src/agents/openhands-runner.py` - Python runner with expert modes, security analyzer, persistence
- `src/agents/openhands-agent.ts` - TypeScript wrapper with all expert presets
- `src/main.ts` - `/openhands` slash command handlers

**Expert Modes (9 total):**

| Mode | Description | Use Case |
|------|-------------|----------|
| `developer` | General development | Coding, debugging, file operations |
| `vulnerability_scan` | Security scanning | OWASP Top 10, secrets, CVE detection |
| `code_review` | Code quality analysis | Quality, performance, best practices |
| `test_generation` | Test creation | Unit, integration, edge cases |
| `documentation` | Doc generation | README, API docs, architecture |
| `refactor` | Code improvement | Complexity reduction, DRY, patterns |
| `debug` | Issue fixing | Root cause analysis, regression tests |
| `migrate` | Dependency upgrades | Breaking changes, migration plans |
| `optimize` | Performance tuning | Profiling, bottleneck fixes |

**Slash Commands:**

| Command | Description |
|---------|-------------|
| `/openhands run` | Run with any mode (developer, security, etc.) |
| `/openhands security <path>` | Security vulnerability scan |
| `/openhands review <path>` | Thorough code review |
| `/openhands tests <path>` | Generate comprehensive tests |
| `/openhands docs <path>` | Generate documentation |
| `/openhands refactor <path>` | Refactor for quality |
| `/openhands debug <path> <issue>` | Debug and fix issues |
| `/openhands optimize <path>` | Performance optimization |
| `/openhands status` | Check SDK availability |
| `/openhands modes` | List all expert modes |

**Advanced Features:**

1. **Security Analyzer** - Blocks dangerous operations (rm -rf, fork bombs, etc.)
2. **Session Persistence** - Resume interrupted tasks with `--persist` flag
3. **Sub-Agent Delegation** - Parallel specialist agents for complex tasks
4. **Multi-Provider LLM** - GLM primary, Groq/OpenRouter for sub-agents
5. **Agent Experts (Act-Learn-Reuse)** - Agents that learn and improve over time

**Agent Experts Pattern:**

The OpenHands integration implements self-improving agents that accumulate expertise:

```
ACT     → Load expertise file, inject into context, execute task
LEARN   → Extract learnings from output, update expertise file
REUSE   → Next execution loads accumulated knowledge
```

- **Expertise Files:** `src/agents/expertise/*.md` (one per mode)
- **Self-Improve Prompts:** Each mode has prompts that teach the agent HOW to learn
- **Session Insights:** Last 5 learnings kept to prevent unbounded growth
- **Enable/Disable:** `--no-learning` flag or `enableLearning: false` option

**TypeScript Presets:**
```typescript
OpenHandsPresets.vulnerabilityScan(path)  // Security scan
OpenHandsPresets.codeReview(path, focus)  // Code review
OpenHandsPresets.testGeneration(path, 90) // 90% coverage
OpenHandsPresets.documentation(path)       // All docs
OpenHandsPresets.refactor(path, target)   // Refactoring
OpenHandsPresets.debug(path, issue)       // Debug + fix
OpenHandsPresets.optimize(path, focus)    // Performance
OpenHandsPresets.persistent(task)         // Resumable session
OpenHandsPresets.multiAgent(task)         // Sub-agent delegation
OpenHandsPresets.fullAudit(path)          // Security + review + docs
```

### OpenCode Agent (Free Grok Access)

The bot integrates OpenCode SDK for **free** Grok model access (`grok-code-fast-1`):

**File:** `src/agents/opencode-agent.ts`

**TypeScript API:**
```typescript
import { runOpenCodeAgent, OpenCodePresets } from "./agents/index.js";

// Simple usage - always uses free grok-code-fast-1
const result = await runOpenCodeAgent({
  prompt: "Write a function to sort an array",
});

// Using presets
await runOpenCodeAgent(OpenCodePresets.code("implement binary search"));
await runOpenCodeAgent(OpenCodePresets.fast("what is 2+2"));
await runOpenCodeAgent(OpenCodePresets.trading("BTC", marketData));
```

**Note:** OpenCode SDK spawns a local server on first use. Server is reused (singleton).

### GEPA Agent (Prompt Optimization)

GEPA (Genetic-Pareto) optimizer for self-improving agent prompts using reflective text evolution:

**Paper:** [GEPA: Reflective Prompt Evolution Can Outperform Reinforcement Learning](https://arxiv.org/abs/2507.19457)

**Files:**
- `src/agents/gepa-agent.ts` - TypeScript wrapper
- `src/agents/gepa-runner.py` - Python runner

**Installation:**
```bash
pip install gepa
```

**TypeScript API:**
```typescript
import {
  optimizePrompt,
  evaluatePrompt,
  runGEPA,
  GEPAPresets,
  isGEPAAvailable,
} from "./agents/index.js";

// Check availability
const available = await isGEPAAvailable();

// Quick optimization
const result = await runGEPA(
  "You are a helpful assistant...",
  [{ input: "What is 2+2?", expected: "4", keywords: ["math"] }],
  "coding"
);
console.log(result.optimizedPrompt);

// Using presets
await optimizePrompt(GEPAPresets.coding(prompt, examples));
await optimizePrompt(GEPAPresets.trading(prompt, examples));
await optimizePrompt(GEPAPresets.security(prompt, examples));

// Evaluate without optimization
const evalResult = await evaluatePrompt({
  prompt: "...",
  examples: [...],
  agentType: "coding",
});
console.log(evalResult.avgScore, evalResult.passing);
```

**Presets:**
| Preset | Description |
|--------|-------------|
| `quick` | 20 iterations, minimal optimization |
| `thorough` | 100 iterations, deep optimization |
| `coding` | Coding agent with expertise save |
| `trading` | Trading agent with expertise save |
| `security` | Security expert with expertise save |

**Integration with Agent Experts:**
```typescript
import { optimizeExpertise, loadExpertisePrompt } from "./agents/index.js";

// Load existing expertise
const currentPrompt = loadExpertisePrompt("trading");

// Optimize with new examples and save
const result = await optimizeExpertise("trading", newExamples);
console.log(result.improvement); // % improvement
```

### 24/7 Autonomous Research System

Continuous research system combining CTM, DGM, OpenEvolve, and GEPA for autonomous self-improving research:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     24/7 RESEARCH ORCHESTRATOR                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │    CTM      │  │    DGM      │  │  OpenEvolve │  │    GEPA     │       │
│  │ (Thinking)  │  │ (Improving) │  │ (Evolving)  │  │(Optimizing) │       │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘       │
│                                 ↓                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  Semantic Memory  │  History Capture  │  Agent Experts  │  Learning │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Components:**
- **CTM (Continuous Thought Machine)**: Extended reasoning with neuron-level timing
- **DGM (Darwin Gödel Machine)**: Self-improving code modification
- **OpenEvolve**: Evolutionary prompt/code optimization with MAP-Elites
- **GEPA**: Genetic-Pareto prompt optimization

**Files:**
- `src/agents/research-orchestrator.ts` - Main orchestrator
- `src/agents/ctm-agent.ts` - Continuous Thought Machine
- `src/agents/dgm-agent.ts` - Darwin Gödel Machine
- `src/agents/openevolve-agent.ts` - Evolutionary optimizer
- `src/agents/openevolve-runner.py` - Python evolution runner
- `src/agents/dgm-runner.py` - Python self-improvement runner

**TypeScript API:**
```typescript
import {
  // Research Orchestrator
  getResearchOrchestrator,
  startResearch,
  stopResearch,
  getResearchStatus,
  // CTM - Extended Thinking
  think,
  deepThink,
  quickThink,
  CTMPresets,
  // DGM - Self-Improvement
  improve,
  quickImprove,
  improveAgentExpertise,
  DGMPresets,
  // OpenEvolve - Evolution
  evolve,
  quickEvolve,
  evolveAgentPrompt,
  OpenEvolvePresets,
} from "./agents/index.js";

// Start 24/7 research
const orchestrator = startResearch({
  minCycleInterval: 5 * 60 * 1000,  // 5 minutes minimum
  maxCycleInterval: 60 * 60 * 1000, // 1 hour maximum
  enableNotifications: true,
});

// Add custom research topic
orchestrator.addTopic({
  id: "market-analysis",
  name: "Crypto Market Analysis",
  question: "What emerging patterns could indicate trading opportunities?",
  domain: "trading",
  priority: 10,
  tags: ["crypto", "trading"],
  enableSelfImprovement: true,
  enableEvolution: true,
});

// Listen for events
orchestrator.on("cycleCompleted", (result) => {
  console.log(`Findings: ${result.findings}`);
  console.log(`Insights: ${result.insights}`);
});

// Manual trigger
await orchestrator.triggerCycle("market-analysis");

// Stop when done
stopResearch();
```

**CTM (Continuous Thought Machine):**
```typescript
// Quick thinking
const result = await quickThink("What patterns exist in this data?");

// Deep domain-specific thinking
const research = await deepThink(
  "How can neural networks improve trading signals?",
  "trading"
);
console.log(research.answer, research.confidence);

// Using presets
await think(CTMPresets.research("Novel hypothesis about...")); // 5 min, high confidence
await think(CTMPresets.trading("Analyze BTC price action")); // 1 min
await think(CTMPresets.security("Evaluate attack vectors")); // 3 min
await think(CTMPresets.math("Prove this theorem")); // 2 min
```

**DGM (Darwin Gödel Machine):**
```typescript
// Quick improvement
const result = await quickImprove(
  "src/agents/trading-agent.ts",
  "Optimize for better signal accuracy"
);

// Improve agent expertise
await improveAgentExpertise("trading", "Enhance pattern recognition");

// Using presets
await improve(DGMPresets.tradingStrategy("path/to/strategy.ts"));
await improve(DGMPresets.errorHandling("path/to/file.ts"));
await improve(DGMPresets.utilityFunction("path/to/utils.ts", "parseData"));
```

**OpenEvolve (Evolutionary Optimization):**
```typescript
// Quick evolution
const result = await quickEvolve(
  "You are a trading assistant...",
  "Maximize signal accuracy",
  10 // generations
);

// Evolve agent prompt
await evolveAgentPrompt("trading", currentPrompt, [
  { input: "BTC analysis", expectedOutput: "Bullish signal with reasoning" },
]);

// Using presets
await evolve(OpenEvolvePresets.tradingStrategy("...", )); // 100 gens, 6 islands
await evolve(OpenEvolvePresets.researchHypothesis("...", "AI")); // Novel hypotheses
await evolve(OpenEvolvePresets.agentPrompt("...", "coding")); // Prompt evolution
```

**Research Presets:**

| Preset | Domain | Duration | Use Case |
|--------|--------|----------|----------|
| `CTMPresets.quick` | any | 10s | Fast answers |
| `CTMPresets.deep` | any | 2min | Complex analysis |
| `CTMPresets.research` | research | 5min | Academic-grade |
| `DGMPresets.safeMinimal` | any | quick | Safe small changes |
| `DGMPresets.tradingStrategy` | trading | thorough | Strategy improvement |
| `OpenEvolvePresets.quickPrompt` | any | 10 gens | Fast optimization |
| `OpenEvolvePresets.thoroughCode` | coding | 50 gens | Deep code evolution |

**Slash Commands:**

| Command | Description |
|---------|-------------|
| `/research start` | Start 24/7 autonomous research orchestrator |
| `/research stop` | Stop research orchestrator |
| `/research status` | View research status, cycles, and topics |
| `/research cycle [topic]` | Manually trigger a research cycle |
| `/research topics` | List all research topics with priorities |
| `/ctm think <problem>` | Quick continuous thinking (10s, 5 steps) |
| `/ctm deep <problem> [domain]` | Deep analysis (2min, 50 steps, trace) |
| `/ctm research <question>` | Research-grade thinking (5min, 100 steps) |
| `/ctm status` | Check CTM availability |
| `/evolve prompt <seed> <criteria>` | Evolve a prompt through generations |
| `/evolve code <seed> <criteria>` | Evolve code with MAP-Elites |
| `/evolve agent <expertise>` | Evolve agent expertise file |
| `/evolve status` | Check OpenEvolve availability |
| `/dgm improve <file> <objective>` | AI-guided code improvement |
| `/dgm expertise <domain>` | Improve agent expertise file |
| `/dgm quick <file> <objective>` | Quick safe improvement |
| `/dgm status` | Check DGM availability |
| `/dgm history` | View improvement history |

**Research Webhook Endpoints:**

External systems can subscribe to receive discovery notifications via webhooks:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/research/status` | GET | Get orchestrator status and stats |
| `/research/topics` | GET | List all research topics |
| `/research/recent` | GET | Get recent research results |
| `/research/subscribers` | GET | List webhook subscribers |
| `/research/subscribe` | POST | Add webhook subscriber |
| `/research/subscribe/:id` | DELETE | Remove subscriber |
| `/research/subscribe/:id/toggle` | POST | Enable/disable subscriber |
| `/research/trigger` | POST | Manually trigger research cycle |

**Webhook Subscription API:**
```typescript
// Add webhook subscriber via API
const response = await fetch("http://localhost:3001/research/subscribe", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    url: "https://your-server.com/webhook",
    topicIds: ["trading-patterns", "whale-behavior"], // Optional filter
    domains: ["trading"],  // Optional filter
    minConfidence: 0.7,    // Only notify if confidence >= 0.7
    secret: "your-hmac-secret", // Optional for signature verification
  }),
});
const { subscriberId } = await response.json();

// Add subscriber programmatically
import { getResearchOrchestrator } from "./agents/index.js";

const orchestrator = getResearchOrchestrator();
const subId = orchestrator.addWebhookSubscriber({
  url: "https://your-server.com/webhook",
  topicIds: ["trading-patterns"],
  domains: ["trading"],
  minConfidence: 0.7,
  enabled: true,
  secret: "your-hmac-secret",
});
```

**Discovery Notification Payload:**
```json
{
  "type": "discovery",
  "timestamp": 1703123456789,
  "cycleId": "cycle_1703123456789_abc123",
  "topic": {
    "id": "trading-patterns",
    "name": "Trading Pattern Discovery",
    "domain": "trading"
  },
  "confidence": 0.85,
  "findings": ["BTC showing bullish divergence..."],
  "insights": ["Pattern correlates with historical..."],
  "improvements": ["Enhanced pattern recognition..."],
  "duration": 45000
}
```

**Signature Verification (if secret configured):**
```typescript
import { createHmac } from "crypto";

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expected = `sha256=${createHmac("sha256", secret).update(payload).digest("hex")}`;
  return signature === expected;
}

// In your webhook handler
app.post("/webhook", (req, res) => {
  const signature = req.headers["x-signature"];
  const payload = JSON.stringify(req.body);

  if (!verifySignature(payload, signature, SECRET)) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  // Process notification
  const { topic, findings, insights } = req.body;
  console.log(`Discovery: ${topic.name}`, findings);
  res.json({ received: true });
});
```

### SDK-Compatible Session Factory

Abstraction layer that mirrors the upcoming pi SDK's `createAgentSession()` API. When the SDK releases, this can be swapped out with minimal changes to consuming code.

**Key SDK concepts implemented:**
- "Omit to discover, provide to override" philosophy
- Event-based streaming (message_update, tool_execution_*, etc.)
- Session management (in-memory, persistent)
- Custom tools/hooks support

**Files:**
- `src/agents/session-factory.ts` - Session factory implementation

**TypeScript API:**
```typescript
import {
  createSession,
  runPrompt,
  streamPrompt,
  SessionManager,
  type AgentSession,
  type SessionFactoryEvent,
} from "./agents/index.js";

// Create a session with SDK-compatible API
const { session, sessionId } = await createSession({
  model: myModel,
  getApiKey: async (model) => process.env.API_KEY,
  systemPrompt: "You are a helpful assistant",
  tools: [myTool1, myTool2],
  thinkingLevel: "medium",
  debug: true,
});

// Subscribe to streaming events
session.subscribe((event: SessionFactoryEvent) => {
  if (event.type === "message_update") {
    process.stdout.write(event.data?.assistantMessageEvent?.delta || "");
  }
});

// Run a prompt
await session.prompt("Hello!");
console.log(session.getOutput());
console.log(session.getUsage()); // { prompt, completion, total }

// Convenience: Single prompt execution
const output = await runPrompt({
  model: myModel,
  getApiKey: async () => "key",
  prompt: "What is 2 + 2?",
  timeout: 30000,
});

// Convenience: Streaming generator
for await (const chunk of streamPrompt({
  model: myModel,
  getApiKey: async () => "key",
  prompt: "Tell me a story",
})) {
  process.stdout.write(chunk);
}

// Session management
const inMemoryConfig = SessionManager.inMemory();
const persistentConfig = SessionManager.create("/project", "/custom/sessions");
const continueConfig = SessionManager.continueRecent("/project");
```

**Session Events:**
| Event Type | Description |
|------------|-------------|
| `message_start` | Message generation started |
| `message_update` | Text delta received |
| `message_end` | Message complete with usage |
| `tool_execution_start` | Tool call initiated |
| `tool_execution_end` | Tool call completed |
| `turn_start` | Agent turn started |
| `turn_end` | Agent turn completed |
| `agent_start` | Prompt processing started |
| `agent_end` | Prompt processing complete |
| `error` | Error occurred |

### Lightweight Learning Agent (TypeScript)

In addition to OpenHands, there's a pure TypeScript learning agent for quick tasks:

```
/agent command
    └── lightweight-agent.ts (runLearningAgent)
            └── expertise-manager.ts (Act-Learn-Reuse)
                    └── src/agents/expertise/*.md (shared with OpenHands)
```

**Available Modes:**
| Mode | Description |
|------|-------------|
| `general` | General purpose tasks |
| `coding` | Code generation, review |
| `research` | Web research, analysis |
| `trading` | Market analysis, signals |

**TypeScript API:**
```typescript
import { runLearningAgent, LearningPresets, actLearnReuse } from "./agents/index.js";

// Quick learning-enabled task
const result = await runLearningAgent({
  prompt: "Review this code",
  mode: "coding",
  enableLearning: true,
});
console.log(result.learned); // { learned: true, insight: "...", expertiseFile: "..." }

// Using presets
await runLearningAgent(LearningPresets.codeReview(code));
await runLearningAgent(LearningPresets.research(topic));
await runLearningAgent(LearningPresets.tradingAnalysis(symbol, data));

// Manual Act-Learn-Reuse cycle
const { success, output, learned } = await actLearnReuse("trading", task, executor);
```

**Shared Expertise Directory:**
Both OpenHands (Python) and lightweight-agent (TypeScript) share `src/agents/expertise/`:
- OpenHands modes: developer, vulnerability_scan, code_review, test_generation, etc.
- Lightweight modes: general, coding, research, trading
- All accumulated learnings are persisted and reused

### Agent Experts (TAC Lesson 13)

Advanced codebase experts implementing the Act-Learn-Reuse pattern via `/expert` command:

**Slash Commands:**

| Command | Description |
|---------|-------------|
| `/expert run` | Execute task with auto-selected domain expert |
| `/expert list` | List all codebase and product experts |
| `/expert view` | View accumulated expertise for a domain |
| `/expert create` | Create new expert via meta-agentic pattern |

**Codebase Experts (High-Risk Domains):**

| Domain | Risk Level | Description |
|--------|------------|-------------|
| `security` | critical | Authentication, authorization, encryption |
| `database` | critical | Schema, migrations, query optimization |
| `trading` | critical | Financial transactions, market analysis |
| `billing` | critical | Payment processing, subscriptions |
| `api_integration` | high | External API contracts, error handling |
| `performance` | high | Optimization, profiling, caching |

**Product Experts:**
- `user_experience` - UX patterns, preferences, friction points
- `error_recovery` - Error patterns, recovery strategies
- `workflow_optimization` - Process improvements, automation

**TypeScript API:**
```typescript
import {
  executeWithAutoExpert,
  createCodebaseExpert,
  CODEBASE_EXPERTS
} from "./agents/index.js";

// Auto-select expert and execute with learning
const { success, output, learned, expert } = await executeWithAutoExpert(
  "Review authentication flow for security issues",
  async (enhancedTask) => runLearningAgent({ prompt: enhancedTask })
);

// Create new expert (meta-agentic: agents building agents)
const result = await createCodebaseExpert("websockets", "Real-time communication", executor);
```

### Two-Phase Agent Workflow

Two-Agent Pattern (from TAC autonomous-coding) via `/task` command:

**Slash Commands:**

| Command | Description |
|---------|-------------|
| `/task create` | Initialize task with feature breakdown (Phase 1) |
| `/task execute` | Execute next feature (Phase 2) |
| `/task status` | Check task progress |
| `/task resume` | Resume interrupted task |
| `/task run` | Run full workflow end-to-end |
| `/task list` | List all tasks |

**Workflow:**
```
Phase 1: Initializer Agent    Phase 2: Coding Agent
┌─────────────────────┐      ┌────────────────────────┐
│ Analyze task        │      │ Implement feature      │
│ Create feature list │ ───► │ Update expertise       │
│ Define priorities   │      │ Mark complete/failed   │
└─────────────────────┘      └────────────────────────┘
```

**TypeScript API:**
```typescript
import {
  initializeClaudeTask,
  executeClaudeFeature,
  runTwoAgentWorkflow
} from "./agents/index.js";

// Full workflow (recommended for most tasks)
const result = await runTwoAgentWorkflow({
  prompt: "Add user authentication with JWT",
  workingDir: process.cwd(),
});

// Manual two-phase approach
const init = await initializeClaudeTask({ prompt: task });
while (getClaudeTaskStatus(init.taskId).nextFeature) {
  await executeClaudeFeature(init.taskId);
}
```

**Task Persistence:**
Tasks are saved to `.tasks/{taskId}.json` and can be resumed across sessions.

### Suno AI Music Generation

The bot integrates Suno AI for music generation via `/suno` command using sunoapi.org:

**Slash Commands:**

| Command | Description |
|---------|-------------|
| `/suno generate` | Quick generation from text prompt (AI handles lyrics) |
| `/suno custom` | Full control: custom lyrics, style, title, model |
| `/suno instrumental` | Generate instrumental tracks |
| `/suno status` | Check service status and remaining credits |

**Features:**
- Multiple model versions (V4, V4.5, V4.5+, V4.5 All, V5)
- Vocal/instrumental toggle
- Custom lyrics support (up to 5000 chars)
- Style customization (e.g., rock, jazz, electronic, doom metal)
- Returns 2 tracks per generation
- Stream and download URLs provided

**Service Module:** `src/music/suno-service.ts`
```typescript
import { sunoService } from "./music/suno-service.js";

// Simple generation
const { taskId } = await sunoService.generateSimple("upbeat electronic dance track", false);
const result = await sunoService.waitForCompletion(taskId);

// Custom lyrics
await sunoService.generateCustom(lyrics, "doom metal", "Cosmic Void", "V4_5ALL");

// Instrumental
await sunoService.generateInstrumental("ambient synthwave", "Night Drive");

// Check credits
const { remaining } = await sunoService.getCredits();
```

**Environment Variable:** `SUNO_API_KEY` (from sunoapi.org)

### Self-Debug Service

Autonomous error detection and repair system. The bot monitors its own errors and attempts to diagnose and fix them using AI.

**Slash Commands:**

| Command | Description |
|---------|-------------|
| `/selfdebug status` | Show service status (enabled, error counts) |
| `/selfdebug errors` | List captured errors with resolution status |
| `/selfdebug diagnose <error_id>` | Manually trigger AI diagnosis for an error |
| `/selfdebug clear` | Clear error history |
| `/selfdebug toggle <enabled>` | Enable/disable self-debugging |

**Architecture:**
```
Error Capture → Diagnosis (AI) → Safety Check → Git Checkpoint → Apply Fix → Validate → Commit
                     ↓                              ↓
               Stack trace analysis           Type check
               Code context extraction        Rollback on failure
```

**Safety Features:**
- Git checkpoint before any code changes
- Whitelist of safe-to-modify files (src/**/*.ts)
- Dangerous pattern detection (process.exit, eval, etc.)
- Maximum fix attempts per error (default: 3)
- Cooldown between attempts (default: 60s)
- Type check validation before commit
- Automatic rollback on validation failure

**TypeScript API:**
```typescript
import { getSelfDebugService, SelfDebugService } from "./agents/index.js";

// Get singleton service
const selfDebug = getSelfDebugService({
  cwd: process.cwd(),
  debugLog: true,
  autoRestart: false,
});

// Install error handlers
selfDebug.install();

// Manual error capture
selfDebug.captureError("agentError", new Error("Something failed"), {
  channelId: "123",
  context: "processing message",
});

// Manual diagnosis
const diagnosis = await selfDebug.manualDiagnose(errorId);
console.log(diagnosis.rootCause, diagnosis.proposedFix);

// Get status
const status = selfDebug.getStatus();
// { enabled: true, totalErrors: 5, unresolvedErrors: 2, isProcessing: false }
```

**Files:**
- `src/agents/self-debug.ts` - Main service implementation

### Autonomous Daemon

24/7 self-improving agent system that operates continuously with minimal human oversight. Integrates self-improvement, research, healing, and optimization cycles.

**Slash Commands:**

| Command | Description |
|---------|-------------|
| `/daemon start [preset]` | Start daemon with preset (autonomous/trader/researcher/conservative) |
| `/daemon stop` | Stop the autonomous daemon |
| `/daemon status` | View metrics, learnings, performance stats |
| `/daemon trigger <cycle>` | Manually trigger improvement/research/healing/optimization/task |
| `/daemon pause` | Pause daemon execution |
| `/daemon resume` | Resume paused daemon |
| `/daemon history` | View learning statistics |

**Cycle Types:**

| Cycle | Description |
|-------|-------------|
| `improvement` | Analyzes expertise files, generates insights, updates expertise |
| `research` | Uses research orchestrator for autonomous discovery |
| `healing` | Integrates with self-debug for automatic error repair |
| `optimization` | Performance monitoring and tuning |
| `task` | Autonomous goal pursuit using learning agent |

**Presets:**

| Preset | Autonomy | Focus | Interval |
|--------|----------|-------|----------|
| `autonomous` | 95% | All domains | 3-15 min |
| `trader` | 80% | Trading, research | 5-20 min |
| `researcher` | 90% | Discovery | 10-30 min |
| `conservative` | 60% | Safe mode | 30-60 min |

**TypeScript API:**
```typescript
import {
  startDaemon,
  stopDaemon,
  getDaemonStatus,
  getAutonomousDaemon,
  DaemonPresets,
} from "./agents/index.js";

// Start with preset
const daemon = await startDaemon(DaemonPresets.autonomous);

// Get status
const state = getDaemonStatus();
console.log(state.cyclesCompleted, state.performance.successRate);

// Manual trigger
await daemon.triggerCycle("improvement");

// Pause/resume
daemon.pause();
daemon.resume();

// Stop
stopDaemon("Maintenance");

// Listen to events
daemon.on("event", (event) => {
  if (event.type === "improvement") {
    console.log(`Improved ${event.domain}: ${event.insight}`);
  }
});
```

**State Properties:**
- `cyclesCompleted` - Total cycles run
- `performance.successRate` - Success rate (0-1)
- `performance.improvementsApplied` - Number of expertise updates
- `performance.researchDiscoveries` - Research discoveries made
- `performance.errorsFixed` - Errors auto-fixed via self-debug
- `learnings` - Array of accumulated insights

**Files:**
- `src/agents/autonomous-daemon.ts` - Main daemon implementation

### Agent Hooks System

The bot includes a pi-coding-agent compatible hook system that provides safety and quality features:

**Slash Commands:**

| Command | Description |
|---------|-------------|
| `/hooks status` | Show hook system health, session ID, turn count |
| `/hooks checkpoints` | List last 10 git checkpoints with timestamps |
| `/hooks restore <id>` | Restore code to a specific checkpoint |
| `/hooks metrics` | Show hook execution metrics (events, timing, errors) |
| `/hooks tag <checkpoint_id> <name>` | Tag a checkpoint with a friendly name |
| `/hooks tags` | List all checkpoint tags |
| `/hooks debug <enabled>` | Toggle debug logging for hooks |

**Active Hooks:**

| Hook | Trigger | Effect |
|------|---------|--------|
| **Checkpoint** | `turn_start` | Creates git ref snapshot (`refs/pi-checkpoints/`) |
| **LSP** | `tool_result` (write/edit) | Appends language diagnostics to tool output |
| **Expert** | `turn_start/end` | Detects domain, injects expertise, captures learnings |

**Supported LSP Languages:**
- TypeScript/JavaScript (typescript-language-server)
- Python (pyright-langserver)
- Go (gopls)
- Rust (rust-analyzer)
- Dart/Flutter, Vue, Svelte

**Event Flow per Discord Message:**
```
User message → turn_start → checkpoint created
              ↓
Agent runs tools → LSP diagnostics injected after write/edit
              ↓
Response sent → turn_end → expert learning captured
```

**TypeScript API:**
```typescript
import {
  createDiscordHookIntegration,
  CheckpointUtils,
  wrapToolWithHooks,
} from "./agents/index.js";

// Create per-channel hook integration
const hooks = createDiscordHookIntegration({
  cwd: channelDir,
  channelId,
  checkpoint: true,
  lsp: true,
  expert: true,
});

// Emit lifecycle events
await hooks.emitSession('start', sessionId);
await hooks.emitTurnStart(turnIndex);
await hooks.emitTurnEnd(turnIndex, messages);

// Wrap tools with hook events
const hookedWriteTool = wrapToolWithHooks(createWriteTool(), () => hooks);

// List and restore checkpoints
const checkpoints = await CheckpointUtils.loadAllCheckpoints(cwd);
await CheckpointUtils.restoreCheckpoint(cwd, checkpoint);
```

**Files:** `src/agents/hooks/` - See `README.md` in that directory for full API documentation.

### Skills Sync System

Import/export skills from aitmpl.com catalog (244+ Claude Code skills). Fully compatible with the [Agent Skills specification](https://agentskills.io/specification).

**Files:**
- `src/agents/skills/loader.ts` - SKILL.md parsing and validation
- `src/agents/skills/sync.ts` - Import/export functions
- `src/agents/skills/types.ts` - TypeScript interfaces

**Discovery Paths (in priority order):**
1. `~/.claude/skills` (claude-user)
2. `./.claude/skills` (claude-project)
3. `~/.pi/agent/skills` (pi-user)
4. `./.pi/skills` (pi-project)
5. Custom directories

**TypeScript API:**
```typescript
import {
  // Loading
  loadSkills,
  parseSkillFile,
  formatSkillsForPrompt,
  // Sync
  importSkill,
  importSkillFromUrl,
  exportSkill,
  createSkill,
  // Catalog
  listCatalog,
  searchCatalog,
  getInstalledSkills,
  batchImport,
} from "./agents/skills/index.js";

// Browse the 244+ skills catalog
const catalog = await listCatalog();
console.log(`Found ${catalog.total} skills`);

// Search for skills
const results = await searchCatalog("git", { limit: 5 });

// Import a skill from aitmpl.com
await importSkill("skill-creator", {
  category: "development",
  installDir: ".claude/skills",
});

// Import from any URL
await importSkillFromUrl("https://raw.githubusercontent.com/.../SKILL.md");

// Create your own skill
createSkill("my-skill", "Does something useful", "# Instructions\n...", {
  allowedTools: ["Read", "Write", "Bash"],
  license: "MIT",
});

// Export existing skill
const skill = parseSkillFile("./my-skill/SKILL.md");
exportSkill(skill.skill!, "./export");

// Load all installed skills
const { skills, warnings } = loadSkills({
  enableClaudeUser: true,
  enableClaudeProject: true,
  ignoredSkills: ["deprecated-*"],
});

// Format for system prompt injection
const prompt = formatSkillsForPrompt(skills);
```

**SKILL.md Format (Agent Skills spec):**
```yaml
---
name: my-skill
description: What this skill does and when to use it
license: MIT
allowed-tools: Read, Write, Bash
---

# My Skill Instructions

Detailed instructions for the AI agent...
```

**Skill Categories (from aitmpl.com):**
- `development` - Code generation, debugging, skill creation
- `utilities` - File operations, shell commands
- `documentation` - README, API docs
- `testing` - Unit tests, integration tests
- `devops` - CI/CD, deployment
- `security` - Vulnerability scanning
- `data` - Data processing, analysis
- `ai` - AI/ML workflows
- `web` - Web development
- `mobile` - Mobile development

### Stateful Agent System

Persistent agent state with checkpoint/restore capabilities:

**Files:**
- `src/agents/stateful-agent.ts` - StatefulAgent class with persistent state
- `src/agents/workflow-chains.ts` - Multi-step workflow orchestration

**StatefulAgent:**
```typescript
import { getStatefulAgent, StatefulAgent } from "./agents/index.js";

// Get or create stateful agent
const agent = getStatefulAgent({
  id: "trading-agent",
  cwd: process.cwd(),
  autoCheckpoint: true,
});

// Lifecycle
await agent.start("Analyze market patterns");
await agent.setProgress(50);
await agent.setData("signals", [...]);
await agent.pause();
await agent.resume();
await agent.complete({ result: "..." });

// Checkpointing
const { checkpointId } = await agent.checkpoint("before-trade");
await agent.restore({ checkpointId });
await agent.tagCheckpoint(checkpointId, "stable-state", "Production ready");

// State access
console.log(agent.state);    // Current state
console.log(agent.status);   // "running" | "paused" | "completed" | ...
console.log(agent.isActive); // true if running or paused
```

**WorkflowChains:**
```typescript
import { createWorkflow, workflow, Workflow } from "./agents/index.js";

// Create workflow with steps
const wf = createWorkflow("trading-analysis", [
  { agent: "data-collector", output: "market_data" },
  { agent: "pattern-analyzer", input: "market_data", output: "patterns" },
  { agent: "signal-generator", input: "patterns", output: "signals" },
  { agent: "risk-assessor", input: "signals", output: "trade_plan" },
]);

// Run with executor
await wf.run(async (step, input, context) => {
  // Execute step logic
  return result;
});

// Control flow
await wf.pause();
await wf.resume();
await wf.restartFrom("pattern-analyzer");
wf.cancel();

// Fluent builder API
const wf2 = workflow("analysis")
  .step({ agent: "collector", output: "data" })
  .when(ctx => ctx.data.hasSignals, { agent: "analyzer" })
  .autoCheckpoint(true)
  .timeout(60000)
  .build();
```

**Workflow Features:**
- Sequential and parallel step execution
- State persists across failures (resume from any step)
- Auto-checkpoint between steps
- Conditional step execution
- Retry with exponential backoff
- EventEmitter for progress tracking

### Learning Activation System

Self-improving agent learning via `/agentlearn` command (Novel PI Agent Architectures - Track A):

**Slash Commands:**

| Command | Description |
|---------|-------------|
| `/agentlearn stats` | Show learning statistics and domain coverage |
| `/agentlearn domains` | List all domains with active/empty status |
| `/agentlearn seed <domain>` | Seed a domain with initial expertise |
| `/agentlearn trigger <output>` | Manually trigger learning from output |
| `/agentlearn view <domain>` | View expertise content for a domain |

**Critical Domains (seedable):**
- `security` - Authentication, authorization, encryption
- `database` - Schema, migrations, query optimization
- `trading` - Financial transactions, market analysis
- `api_integration` - External API contracts, error handling
- `performance` - Optimization, profiling, caching
- `error_handling` - Error patterns, recovery strategies

**Files:**
- `src/trading/learning-service.ts` - LearningActivationService with processOutput()
- `src/agents/expertise/*.md` - Per-domain expertise accumulation files

### Universal Output Capture System (UOCS)

Automatic history capture for all agent outputs with semantic categorization via `/history` command:

**Slash Commands:**

| Command | Description |
|---------|-------------|
| `/history stats` | Show history statistics (total captures, by type, by status) |
| `/history recent [type] [limit]` | Get recent history entries with optional filtering |
| `/history search <query>` | Search history entries by content |
| `/history capture <content> <type>` | Manually capture content with specified type |
| `/history view <id>` | View a specific history entry |

**Capture Types:**
- `FEATURE` - Feature implementations
- `BUG` - Bug fixes and debugging sessions
- `LEARNING` - Insights, discoveries, patterns (auto-detected with 2+ keywords)
- `RESEARCH` - Research and analysis sessions
- `DECISION` - Architectural and implementation decisions
- `SESSION` - General agent session outputs

**Directory Structure:**
```
${dataDir}/history/
├── sessions/YYYY-MM/
├── learnings/YYYY-MM/
├── research/YYYY-MM/
├── decisions/YYYY-MM/
├── execution/
│   ├── features/YYYY-MM/
│   └── bugs/YYYY-MM/
└── raw-outputs/YYYY-MM/
```

**File Naming:** `YYYY-MM-DD-HHMMSS_[AGENT]_[TYPE]_[DESCRIPTION].md`

**Auto-Detection:**
- Learning detection: 2+ keywords from ["learned", "realized", "discovered", "insight", "pattern", "understanding", "breakthrough", "aha"]
- Decision detection: Keywords like "decided", "choosing", "selected"
- Research detection: Keywords like "investigating", "analyzing", "exploring"

**TypeScript API:**
```typescript
import { getHistoryCaptureService } from "./agents/index.js";

const history = getHistoryCaptureService(dataDir);
await history.initialize();

// Auto-categorize and capture
const entry = await history.autoCapture("agent-id", content, {
  duration_minutes: 30,
  files_changed: ["src/main.ts"],
  technologies: ["TypeScript", "Discord.js"],
  status: "completed",
  tags: ["feature", "api"],
});

// Manual capture by type
await history.captureSession("agent-id", content);
await history.captureLearning("agent-id", insight);
await history.captureDecision("agent-id", decision, rationale);
await history.captureFeature("agent-id", content);
await history.captureBug("agent-id", content);
await history.captureResearch("agent-id", content);

// Search and retrieval
const results = await history.search("keyword", {
  type: "LEARNING",
  agentId: "my-agent",
  startDate: new Date("2025-01-01"),
  tags: ["trading"],
});

const recent = await history.getRecent("FEATURE", 10);
const stats = await history.getStats();
```

**YAML Frontmatter:**
All captured files include structured metadata:
```yaml
---
id: hist_1234567890_abc123
type: LEARNING
timestamp: 2025-12-21T10:30:00.000Z
agent: trading-agent
status: completed
duration_minutes: 45
files_changed:
  - src/trading/orchestrator.ts
  - src/agents/learning.ts
technologies:
  - TypeScript
  - Trading
tags:
  - pattern-recognition
  - market-analysis
---

# Content starts here...
```

**Files:**
- `src/agents/history-capture.ts` - HistoryCaptureService with auto-categorization
- `src/main.ts` - `/history` slash command handlers

### Tool Performance Metrics

MCP-Bench aligned tool analytics via `/toolmetrics` command (Novel PI Agent Architectures - Track B):

**Slash Commands:**

| Command | Description |
|---------|-------------|
| `/toolmetrics stats` | Overall tool performance (calls, success rate, latency) |
| `/toolmetrics top [limit]` | Top performing tools by success rate |
| `/toolmetrics slow [limit]` | Slowest tools by average latency |
| `/toolmetrics errors [limit]` | Most error-prone tools |
| `/toolmetrics tool <name>` | Detailed metrics for a specific tool |
| `/toolmetrics recent [limit]` | Recent tool calls log |

**Database Schema:**
```sql
CREATE TABLE tool_metrics (
  id TEXT PRIMARY KEY,
  tool_name TEXT NOT NULL,
  server_name TEXT NOT NULL,
  timestamp INTEGER,
  latency_ms INTEGER,
  status TEXT CHECK(status IN ('success','error','timeout')),
  confidence_score REAL
);
```

**Files:**
- `src/mcp-catalog/metrics-tracker.ts` - MetricsTracker with persistence callback
- `src/agents/hooks/metrics-hook.ts` - Auto-collect metrics from tool events
- `src/database.ts` - SQLite persistence (tool_metrics table)

### Model Provider System

The bot supports multiple AI providers with runtime switching:

1. **OpenRouter** (default) - Best agentic performance, wide model selection
2. **OpenCode SDK** - Free Grok access (grok-code-fast-1)
3. **Cerebras** - Fastest inference (2100+ tok/s)
4. **Groq** - Free tier, fast
5. **Z.ai** - GLM-4.6 coding specialization
6. **Ollama** - Local models

**Lightweight Agent Models** (`src/agents/lightweight-agent.ts`):

| Key | Provider | Model | Description |
|-----|----------|-------|-------------|
| `glm-4.6` | Z.ai | glm-4.6 | GLM 4.6 (Top Coding) - **Default** |
| `glm-4.5` | Z.ai | glm-4.5 | GLM 4.5 |
| `haiku` | Anthropic | claude-haiku-4-5 | Claude Haiku 4.5 |
| `sonnet` | Anthropic | claude-sonnet-4-5 | Claude Sonnet 4.5 |
| `deepseek` | OpenRouter | deepseek/deepseek-chat | DeepSeek Chat |

Model selection uses `createModelConfig()` factory functions that return `Model<"openai-completions">` configs.

### Agent Event Loop

Messages flow through:
1. Discord `messageCreate` event
2. Rate limiting check
3. Per-channel agent instance (from Map)
4. `Agent.run()` with tools from `getAllMcpTools()`
5. Event stream processing (tool calls, responses)
6. Discord message updates with progress feedback

### Trading System

Multi-agent architecture inspired by Moon Dev:
- `TradingOrchestrator` coordinates agents and manages signal flow
- Agents (Price, Sentiment, Whale) extend `BaseAgent`
- `ConsensusEngine` aggregates signals with confidence thresholds
- Signals broadcast to configured Discord channel

### TAC-12 Agent Pool System

Agent pool segregation and orchestration based on TAC Foundation's 12 leverage points model:

**Agent Roles:**
| Role | Description | Trading Equivalent |
|------|-------------|-------------------|
| `architect` | Planning, design | - |
| `builder` | Implementation | - |
| `tester` | Validation | - |
| `reviewer` | Quality review | - |
| `expert` | Domain specialist | - |
| `scout` | Data collection | Price/Whale Agent |
| `analyst` | Pattern analysis | Sentiment Agent |
| `strategist` | Strategy formulation | Signal Agent |
| `risk_manager` | Risk assessment | Risk Agent |
| `executor` | Trade execution | Trade Executor |

**Orchestration Modes:**
- `SEQUENTIAL` - One agent after another
- `PARALLEL` - All agents at once
- `PIPELINE` - Output → Input chain (default for trading)
- `SWARM` - Autonomous coordination with worker limits

**TypeScript API:**
```typescript
import {
  getAgentPool,
  createTradingAgentPool,
  createOrchestrationController,
  OrchestrationMode,
} from "./agents/index.js";

// Get trading pool with default agents
const pool = createTradingAgentPool();

// Register custom agent
pool.register({
  id: "custom-agent",
  name: "Custom Analyzer",
  role: "analyst",
  tags: ["custom", "analysis"],
  maxConcurrency: 2,
  priority: 7,
  status: "idle",
});

// Cost tracking
pool.recordCost({
  agentId: "price-agent",
  timestamp: Date.now(),
  inputTokens: 1000,
  outputTokens: 500,
  apiCalls: 1,
  totalCost: 0.003,
  latencyMs: 250,
  success: true,
});

// Get cost summary
const costs = pool.getAgentCosts("price-agent");
console.log(`Total cost: $${costs.totalCost}, Success rate: ${costs.successRate}`);

// Create orchestration controller
const controller = createOrchestrationController(pool, {
  mode: OrchestrationMode.PIPELINE,
  maxWorkers: 4,
});

// Execute tasks with automatic agent selection
const { results, errors } = await controller.execute(tasks, async (task, agent) => {
  // Execute task with selected agent
  return await executeWithAgent(agent, task);
});

// Get pool statistics
const stats = pool.getStats();
// { totalAgents: 7, byRole: {...}, totalCost: 0.15, avgLatency: 200, successRate: 0.95 }
```

**Default Trading Agents:**
- `price-agent` (scout) - Market data collection
- `sentiment-agent` (analyst) - Social/news sentiment
- `whale-agent` (scout) - On-chain whale tracking
- `pattern-agent` (analyst) - Technical patterns
- `signal-agent` (strategist) - Entry/exit signals
- `risk-agent` (risk_manager) - Position sizing
- `executor-agent` (executor) - Trade execution

**Files:** `src/agents/agent-pool.ts`

### Agentis Framework Learned Features

Features learned from competitor analysis of the Agentis Framework for multi-agent coordination:

#### Dependency Inference (`/infer`)

NLP-based task dependency detection that automatically infers relationships between tasks:

**Slash Commands:**

| Command | Description |
|---------|-------------|
| `/infer tasks` | Infer dependencies between tasks (pipe-separated) |
| `/infer order` | Get optimal execution order for tasks |
| `/infer graph` | Visualize task dependency graph |

**TypeScript API:**
```typescript
import {
  inferTaskDependencies,
  createDependencyInference,
  DependencyInference,
} from "./agents/index.js";

// Quick inference
const result = inferTaskDependencies([
  { id: "1", description: "Research user requirements" },
  { id: "2", description: "Design database schema based on requirements" },
  { id: "3", description: "Implement API endpoints" },
]);

console.log(result.graph); // ASCII visualization
console.log(result.links); // Inferred dependencies with confidence

// Full control
const inference = createDependencyInference({
  enableContentSimilarity: true,
  enableTypeHierarchy: true,
  enableInformationFlow: true,
  minDependencyCertainty: 0.4,
});

const order = inference.getExecutionOrder(result.tasks);
```

**Detection Methods:**
- **Content Similarity**: Jaccard distance on extracted keywords
- **Type Hierarchy**: planning → research → analysis → coding → testing → review
- **Information Flow**: Matches "produces" with "requires" patterns

**Files:** `src/agents/dependency-inference.ts`

#### Agent Personas (`/persona`)

Structured personality system for consistent agent behavior:

**Slash Commands:**

| Command | Description |
|---------|-------------|
| `/persona create` | Create a custom agent persona |
| `/persona view` | View persona details |
| `/persona prompt` | Generate system prompt for persona |
| `/persona list` | List all personas |
| `/persona presets` | Show available preset personas |

**Preset Personas:**
- `trader` - Analytical, risk-aware trading specialist
- `coder` - Precise, methodical developer
- `researcher` - Curious, thorough analyst
- `security` - Cautious, detail-oriented auditor
- `creative` - Imaginative, unconventional thinker

**TypeScript API:**
```typescript
import {
  createPersona,
  getPersona,
  generatePersonaPrompt,
  getPersonaManager,
  PRESET_PERSONAS,
} from "./agents/index.js";

// Create from preset
const trader = createPersona({
  ...PRESET_PERSONAS.trader,
  name: "TradingBot",
});

// Generate system prompt
const systemPrompt = generatePersonaPrompt("TradingBot");

// Adjust response based on personality
const manager = getPersonaManager();
const adjusted = manager.adjustResponse(trader, rawResponse);
```

**Files:** `src/agents/agent-persona.ts`

#### Swarm Communication (`/swarm`)

Multi-agent coordination with roles, task delegation, and consensus:

**Slash Commands:**

| Command | Description |
|---------|-------------|
| `/swarm create` | Create a new swarm agent |
| `/swarm delegate` | Delegate task to best available agent |
| `/swarm consensus` | Start a consensus vote |
| `/swarm status` | Show swarm status and topology |
| `/swarm list` | List all swarm agents |

**Swarm Roles:**
- `leader` - Coordinates other agents, makes final decisions
- `worker` - Executes tasks, reports results
- `specialist` - Domain expert for specific tasks
- `coordinator` - Routes tasks, manages workflow
- `observer` - Monitors, doesn't participate

**Consensus Strategies:**
- `majority` - Simple majority vote
- `unanimous` - All must agree
- `weighted` - Votes weighted by agent reputation
- `leader_decides` - Leader makes final call

**TypeScript API:**
```typescript
import {
  getSwarmCoordinator,
  createSwarmAgent,
  createTaskRequest,
  createConsensusProposal,
} from "./agents/index.js";

const swarm = getSwarmCoordinator();

// Register agents
swarm.register(createSwarmAgent("leader-1", "Leader", "leader", "trading", ["strategy"]));
swarm.register(createSwarmAgent("analyst-1", "Analyst", "specialist", "trading", ["analysis"]));

// Delegate task
const request = createTaskRequest("Analyze BTC market", ["analysis"], "high");
const result = await swarm.delegateTask(request, "coordinator");

// Start consensus
const proposal = createConsensusProposal("Should we enter BTC long?", ["yes", "no"], "majority");
const consensus = await swarm.proposeConsensus(proposal, "leader-1");
console.log(`Decision: ${consensus.winner} (${consensus.confidence}% confidence)`);

// Share knowledge
await swarm.shareKnowledge("analyst-1", "market-pattern", { pattern: "bullish-divergence" });
```

**Files:** `src/agents/agent-swarm.ts`

#### Twitter Connector (`/twitter`)

Cross-platform integration for Twitter/X:

**Slash Commands:**

| Command | Description |
|---------|-------------|
| `/twitter status` | Check connector status and credentials |
| `/twitter post` | Post a tweet |
| `/twitter thread` | Post a thread (auto-split) |
| `/twitter search` | Search tweets |
| `/twitter mentions` | Get recent mentions |
| `/twitter analytics` | Get engagement analytics |

**Environment Variables:**
```bash
TWITTER_API_KEY=...
TWITTER_API_SECRET=...
TWITTER_ACCESS_TOKEN=...
TWITTER_ACCESS_SECRET=...
TWITTER_BEARER_TOKEN=...  # Optional, for read-only operations
```

**TypeScript API:**
```typescript
import {
  getTwitterConnector,
  createTwitterConnector,
  createTwitterAgent,
} from "./agents/index.js";

// Create connector
const twitter = createTwitterConnector({
  credentials: {
    apiKey: process.env.TWITTER_API_KEY!,
    apiSecret: process.env.TWITTER_API_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessSecret: process.env.TWITTER_ACCESS_SECRET!,
  },
});

// Connect and post
await twitter.connect();
await twitter.postTweet("Hello from the bot!");

// Post thread
await twitter.postThread([
  "1/3 Here's an important update...",
  "2/3 The details are...",
  "3/3 In conclusion..."
]);

// Cross-post from Discord
await twitter.crossPost({
  content: discordMessage,
  source: "discord",
});

// Monitor mentions
twitter.startPolling();
twitter.on("mention", (alert) => {
  console.log(`Mention from @${alert.tweet.authorUsername}: ${alert.sentiment}`);
});
```

**Files:** `src/agents/twitter-connector.ts`

### Semantic Search System

Vector-based memory storage and retrieval using embeddings:

**Architecture:**
```
Text Input → Xenova Transformers (all-MiniLM-L6-v2) → 384-dim Vector → SQLite BLOB
             ↓
Query → Embedding → Cosine Similarity Search → Top-K Results
```

**TypeScript API:**
```typescript
import {
  getSemanticSearchService,
  generateEmbedding,
  cosineSimilarity
} from "./agents/index.js";
import { getDatabase } from "./database.js";

// Get service
const db = getDatabase();
const search = getSemanticSearchService(db);

// Add memories
const id = await search.addMemory("agent-id", "Bitcoin reached $50,000", {
  type: "market-event",
  timestamp: Date.now()
});

// Batch add
await search.addMemoriesBatch("agent-id", [
  { content: "BTC bullish pattern detected", metadata: { type: "signal" } },
  { content: "High trading volume on SOL", metadata: { type: "signal" } }
]);

// Semantic search (natural language query)
const results = await search.search("agent-id", "cryptocurrency price movements", {
  topK: 5,              // Return top 5 matches
  threshold: 0.6,       // Minimum similarity 0-1
  metadata: { type: "signal" } // Optional filter
});

// Results include similarity scores
results.forEach(r => {
  console.log(`[${r.similarity.toFixed(3)}] ${r.content}`);
});

// Memory management
await search.updateMemory(id, "Updated content");
await search.deleteMemory(id);
await search.pruneOldMemories("agent-id", 100); // Keep only 100 most recent

// Stats
const stats = search.getStats();
// { totalMemories: 500, agentCounts: [{ agentId: "...", count: 200 }] }
```

**Database Schema:**
```sql
CREATE TABLE semantic_memories (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding BLOB NOT NULL,  -- 384-dim Float32Array as Buffer
  metadata TEXT,            -- JSON object
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_semantic_agent ON semantic_memories(agent_id);
```

**Use Cases:**
- **Agent Long-Term Memory**: Store and recall agent experiences
- **Trading Signal History**: Search similar market patterns
- **Conversation Context**: Find relevant past discussions
- **Knowledge Retrieval**: Semantic search over documentation
- **Learning Patterns**: Identify recurring themes in agent outputs

**Performance:**
- Model: Xenova/all-MiniLM-L6-v2 (lightweight, fast)
- Embedding dimension: 384 (optimal for semantic similarity)
- Search: In-memory cosine similarity (fast for <10k vectors)
- Storage: SQLite BLOB (efficient binary storage)

**Advanced Features:**
```typescript
// Direct embedding access
const emb1 = await generateEmbedding("text 1");
const emb2 = await generateEmbedding("text 2");
const similarity = cosineSimilarity(emb1, emb2); // 0-1 score

// Batch processing
const embeddings = await generateEmbeddingsBatch(["text 1", "text 2", "text 3"]);

// Metadata filtering (application-layer)
await search.search("agent-id", "query", {
  metadata: {
    type: "signal",
    confidence: "high",
    timeframe: "1h"
  }
});
```

## Python Dependencies

Some research agents require Python. Install with:

```bash
pip install -r requirements.txt
```

**Required for GEPA prompt optimization:**
- `gepa>=0.1.0` - Genetic-Pareto optimization

**No external dependencies (stdlib only):**
- DGM runner (`src/agents/dgm-runner.py`)
- OpenEvolve runner (`src/agents/openevolve-runner.py`)

## Configuration

Key environment variables:
- `DISCORD_BOT_TOKEN` (required)
- `OPENROUTER_API_KEY` (recommended - best agentic)
- `GROQ_API_KEY`, `CEREBRAS_API_KEY` (optional providers)
- `ZAI_API_KEY` (required for OpenHands SDK - GLM-4.6)
- `GITHUB_TOKEN`, `HF_TOKEN` (for integrations)
- `WEBHOOK_PORT` (default: 3001)
- `ALLOWED_USER_IDS` (comma-separated, empty = allow all)

**Note:** Grok is free via OpenCode SDK - no API key needed.

## Testing

Tests use Vitest. The test file `src/mcp-tools.test.ts` covers:
- Tool array structure and uniqueness
- `withRetry()` retry logic
- Tool category presence validation

Run with `npx vitest run` or `npm test`.

## Workspace Data Structure

The bot creates per-channel directories under the data path:
```
<data_dir>/
├── MEMORY.md           # Global memory
├── knowledge/          # RAG documents
├── skills/             # Loadable skill files
├── scheduled/          # Task definitions
├── <channel_id>/       # Per-channel state
│   ├── MEMORY.md       # Channel-specific memory
│   ├── log.jsonl       # Message history
│   └── scratch/        # Working directory
└── bot.db              # SQLite database
```
