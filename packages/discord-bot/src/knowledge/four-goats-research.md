# The Four GOATs: Irreplaceable Engineer Stack Research

## Overview

| Expert | Domain | Key Creation | Philosophy |
|--------|--------|--------------|------------|
| Mario Zechner | Agent Framework | Pi-Mono, Pi-Agent-Core | 4 tools only, YOLO mode, minimal context |
| Simon Willison | LLM Tooling | Datasette, LLM CLI, sqlite-utils | CLI > Web, SQLite for everything |
| IndyDevDan | Agentic Coding | TAC-12, 6 Agentic Properties | Build systems that build systems |
| Daniel Miessler | AI Augmentation | Fabric (30k stars), PAI, SecLists | Human flourishing via AI |

---

## Mario Zechner

**Background:**
- Austrian developer, creator of Pi-Mono framework
- LibGDX game framework creator (15k+ stars)
- Decades of systems programming experience
- Minimalist philosophy applied to AI agents

**Key Projects:**
| Project | Purpose |
|---------|---------|
| pi-mono | Monorepo agent framework |
| pi-agent-core | Agent runtime library |
| pi-ai | Multi-provider AI abstraction |
| pi-coding-agent | Reference coding agent |

**Core Philosophy - 4 Tools Only:**
```
read  → Read file contents
write → Create/overwrite files
edit  → Surgical text replacements
bash  → Execute any command

"These four tools are all you need for an effective coding agent."
```

**Anti-Patterns (What Mario Rejects):**
| Rejected | His Alternative |
|----------|-----------------|
| MCP servers | CLI tools + README |
| Built-in todos | Write to TODO.md |
| Plan mode | Write to PLAN.md |
| Background bash | Use tmux |
| Sub-agents | Spawn pi via bash |
| Permission dialogs | YOLO mode |

**Key Insights:**
- System prompt under 1000 tokens (vs Claude Code's 10,000+)
- "Context engineering is paramount"
- "Security measures in coding agents are mostly theater"
- Progressive disclosure: load tools only when needed
- Full observability of everything

**Multi-Provider Support:**
- Anthropic, OpenAI, Google, xAI
- Groq, Cerebras, OpenRouter
- Any OpenAI-compatible endpoint (Ollama, vLLM)
- Context handoff between providers works

**Links:**
- Website: https://mariozechner.at
- GitHub: https://github.com/nickmesaros (pi-mono)
- LibGDX: https://libgdx.com

---

## Simon Willison

**Background:**
- Co-creator of Django Web Framework (2005)
- Y Combinator founder (Lanyrd, 2010)
- Former Engineering Director at Eventbrite
- Python Software Foundation board member
- Blog since 2002 - 23 years of web development writing
- 345 Python packages on PyPI

**Key Tools:**
| Tool | Stars | Purpose |
|------|-------|---------|
| LLM | 7.3k | CLI for interacting with LLMs |
| Datasette | - | Explore and publish data |
| sqlite-utils | - | CLI for SQLite manipulation |
| strip-tags | - | Remove HTML tags |
| ttok | - | Token counting |

**LLM CLI (v0.26 - May 2025):**
```bash
# Install
pip install llm

# Run prompts
llm "Ten fun names for a pet pelican"

# With tools
llm --tools sqlite "Query my database"

# Extract from images
llm "extract text" -a document.jpg

# Install plugins
llm install llm-gemini
llm install llm-anthropic
llm install llm-ollama
```

**Philosophy:**
- CLI tools over web apps
- SQLite for everything
- Progressive disclosure
- Plugins for extensibility
- Log everything to SQLite

**Links:**
- Blog: https://simonwillison.net
- GitHub: https://github.com/simonw
- LLM Docs: https://llm.datasette.io

---

## IndyDevDan

**Background:**
- 15+ years shipping production code
- YouTube @indydevdan - 2M+ views
- 8k+ GitHub stars with 2k+ forks
- Creator of Principled AI Coding (Phase 1)
- Creator of Tactical Agentic Coding (Phase 2)

**Courses:**
| Course | Price | Focus |
|--------|-------|-------|
| Principled AI Coding | - | Foundation AI coding skills |
| Tactical Agentic Coding | $599 | 8 tactics, agentic engineering |
| Agentic Horizon | Add-on | Extended mastery (5 lessons) |

**TAC Lesson Structure:**
1. Hello Agentic Coding (Beginner)
2. 12 Leverage Points (Beginner)
3. Success is Planned (Intermediate)
4. AFK Agents (Intermediate)
5. Close The Loops (Intermediate)
6. Let Your Agents Focus (Advanced)
7. ZTE: Secret of Agentic Engineering (Advanced)
8. The Agentic Layer (Advanced)

**Agentic Horizon Extended:**
9. Elite Context Engineering
10. Agentic Prompt Engineering
11. Building Domain-Specific Agents
12. Multi-Agent Orchestration
13. Agent Experts (Act-Learn-Reuse)
14. Community Vote

**The 6 Agentic Properties:**
```
BASE LEVEL (What agents DO):
├── ALIGNMENT    → Domain experts (expertise/*.md)
├── AUTONOMY     → YOLO mode, minimal oversight
└── DURABILITY   → Checkpoints, crash recovery

META LEVEL (How agents EVOLVE):
├── SELF-IMPROVEMENT  → Act-Learn-Reuse cycle
├── SELF-REPLICATION  → Spawn specialized agents
└── SELF-ORGANIZATION → Metrics-based optimization
```

**Core Concepts:**
- **Core Four**: Context, Model, Prompt, Tools
- **Compute Advantage**: (Compute Scaling × Autonomy) / (Time + Effort + Cost)
- **Act-Learn-Reuse**: Load expertise → Execute → Extract learnings → Update
- **12 Leverage Points**: Maximize agent autonomy
- **Out of the Loop**: AFK agents that work without you

**Key Phrases:**
- "Build the system that builds the system"
- "Stop coding, start templating"
- "You are the bottleneck, not the models"
- "The engineer they can't replace"

**Links:**
- Website: https://agenticengineer.com
- YouTube: https://youtube.com/@indydevdan
- Blog: https://indydevdan.com

---

## Daniel Miessler

**Background:**
- US Army veteran (Infantry, Airborne, 101st, Spanish Linguist)
- Cybersecurity career: Apple, Robinhood, IOActive, HP
- Co-founded Fortify on Demand (2 → 350+ people)
- Blog since 1999 - 3000+ essays
- Company: Unsupervised Learning

**Key Projects:**
| Project | Stars | Purpose |
|---------|-------|---------|
| Fabric | 30k+ | AI augmentation framework |
| SecLists | - | Pentester's essential lists (Kali Linux) |
| CASMM | - | Consumer Authentication Maturity Model |

**Fabric Framework (v1.4.356):**
```bash
# Install
curl -fsSL https://raw.githubusercontent.com/danielmiessler/fabric/main/scripts/installer/install.sh | bash

# Setup
fabric --setup

# Use patterns
fabric -p summarize < article.txt
fabric -y "https://youtube.com/watch?v=..." -p extract_wisdom
fabric -u https://example.com -p analyze_claims
```

**Supported Providers (20+):**
- OpenAI, Anthropic, Gemini, Ollama
- Groq, Cerebras, OpenRouter
- Venice AI, Perplexity, Together AI
- Amazon Bedrock, Azure OpenAI
- And more...

**Pattern Categories:**
- Content extraction (extract_wisdom, summarize)
- Analysis (analyze_claims, rate_content)
- Writing (write_essay, create_social_posts)
- Code (code_review, explain_code)
- Wellness (psychological analysis)

**Philosophy - Human 3.0:**
```
Human 1.0 (Primitive): Survival mode
Human 2.0 (Corporate): Defined by capitalist value
Human 3.0 (Creative): Self-expression + value creation
```

**World Model:**
- Materialistic universe, behavior explained by evolutionary biology
- Morality = concern about conscious creatures' experiences
- Reality exists at multiple emergent layers
- Framing as powerful tool for navigating reality

**Key Quotes:**
- "AI doesn't have a capabilities problem—it has an integration problem"
- "fabric is an open-source framework for augmenting humans using AI"
- "The goal is human flourishing"

**Links:**
- Website: https://danielmiessler.com
- GitHub: https://github.com/danielmiessler/fabric
- Newsletter: https://unsupervised-learning.com

---

## Synthesis: The Irreplaceable Engineer Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                    THE IRREPLACEABLE ENGINEER                   │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 0: Agent Foundation (Mario Zechner)                      │
│  ├── 4-tool minimalism (read, write, edit, bash)                │
│  ├── YOLO mode - no permission theater                          │
│  ├── Context engineering - minimal system prompts               │
│  └── Multi-provider abstraction (pi-ai)                         │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 1: CLI Tooling (Simon Willison)                          │
│  ├── llm CLI for model interaction                              │
│  ├── sqlite-utils for data manipulation                         │
│  ├── Datasette for data exploration                             │
│  └── Plugin architecture for extensibility                      │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 2: AI Patterns (Daniel Miessler)                         │
│  ├── 242+ Fabric patterns for specific tasks                    │
│  ├── PAI (Personal AI Infrastructure) scaffolding               │
│  ├── Composable via pipes: yt | fabric -p extract_wisdom        │
│  └── 13 Founding Principles for reliable AI                     │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 3: Agentic Systems (IndyDevDan)                          │
│  ├── 6 Agentic Properties for agent design                      │
│  ├── Act-Learn-Reuse for compound knowledge                     │
│  ├── Out of the Loop engineering                                │
│  └── Build systems that build systems                           │
└─────────────────────────────────────────────────────────────────┘
```

## Integration Points

| Concept | Mario | Simon | Daniel | Dan |
|---------|-------|-------|--------|-----|
| CLI-first | bash as escape hatch | LLM CLI | Fabric CLI | Claude Code |
| Patterns | README-driven | Templates | Patterns | Skills |
| Storage | MEMORY.md files | SQLite logs | PAI History | expertise/*.md |
| Composability | Spawn via bash | Pipes | Pipes | Agent chains |
| Extensibility | CLI tools | Plugins | Custom patterns | ADWs |
| Philosophy | Minimal context | SQLite everything | Human 3.0 | Compute Advantage |

## Recommended Reading Order

1. **Foundation**: Mario's Pi-Mono architecture
2. **CLI Mastery**: Simon's LLM CLI docs
3. **Patterns**: Daniel's Fabric patterns + PAI
4. **Principles**: Dan's Principled AI Coding
5. **Advanced**: Dan's Tactical Agentic Coding

## Combined Workflow Example

```bash
# Simon's tools for extraction
yt-dlp -x "https://youtube.com/..." | \

# Daniel's patterns for analysis
fabric -p extract_wisdom | \

# Store in Simon's SQLite
sqlite-utils insert wisdom.db insights -

# Dan's pattern: accumulate in expertise file
echo "## New Learning" >> expertise/content.md
```
