# DiagramAI 🧠

AI-powered technical diagram generator for engineering students and professionals.
Built with Next.js 14, Groq AI, and Mermaid.js.

## Tech Stack

| Layer | Tech | Why |
|-------|------|-----|
| Framework | Next.js 14 (App Router) | SSR, API routes, performance |
| AI Primary | Groq + Llama 3.1 8B | $0.05/M tokens, ultra fast |
| AI Fallback | OpenRouter (free tier) | Zero cost backup |
| Diagrams | Mermaid.js | Free SVG rendering, no image API cost |
| Styling | Tailwind CSS | Utility-first, responsive |
| Icons | Lucide React | Clean, consistent icons |

## Cost at Scale

| Generations | Cost (Groq Llama 3.1 8B) |
|------------|--------------------------|
| 1,000      | ~$0.10                   |
| 10,000     | ~$1.00                   |
| 100,000    | ~$10.00                  |

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/yourusername/diagramai.git
cd diagramai
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:

```env
GROQ_API_KEY=your_groq_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

**Get API Keys:**
- Groq (free): https://console.groq.com
- OpenRouter (free tier): https://openrouter.ai

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Add environment variables in Vercel dashboard.

## Project Structure

```
diagramai/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.js        # Groq API + OpenRouter fallback
│   ├── globals.css             # Global styles + Tailwind
│   ├── layout.js               # Root layout with fonts + metadata
│   └── page.js                 # Main UI page
├── components/
│   ├── diagram/
│   │   └── DiagramRenderer.js  # Mermaid.js renderer component
│   └── ui/
│       ├── Badge.js            # Badge component
│       ├── Button.js           # Button component
│       └── Tabs.js             # Tabs component
├── lib/
│   ├── useGenerateDiagram.js   # API call hook
│   ├── useHistory.js           # Session history hook
│   └── utils.js                # Utilities, constants, helpers
├── .env.example                # Environment variables template
├── next.config.js
├── tailwind.config.js
└── package.json
```

## Supported Diagram Types

- **Flowchart** — processes, workflows, algorithms, control systems (MCC, SPCC)
- **ER Diagram** — database schemas, entity relationships
- **Sequence Diagram** — protocols, TCP/IP handshake, API flows, JWT auth
- **Class Diagram** — OOP, system architecture, class relationships
- **State Machine** — lifecycle diagrams, state transitions
- **Graph** — network layers (OSI), hierarchical systems, mind maps

## API Route

```
POST /api/generate
Body: { prompt: string, useProModel?: boolean }
Response: { success: bool, data: DiagramResult, meta: Meta }
```

## Architecture Decision: Why No Image Generation API?

Image generation APIs (DALL-E, Stable Diffusion) cost $0.02-0.04 per image.
At 1,000 generations = $20-40. At 100,000 = $2,000-4,000.

Mermaid.js renders diagrams as SVG client-side = $0 at any scale.
Groq text generation at $0.05/M tokens = $0.10 for 1,000 generations.

Total saving at 100K generations: ~$3,990.
