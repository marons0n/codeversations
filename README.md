{
    "name": "codeversations",
    "displayName": "Codeversations",
    "description": "Turn your coding sessions into an office politics adventure!",
    "version": "0.0.1",
    "engines": {
        "vscode": "^1.80.0"
    },
    "activationEvents": [
        "onCommand:codeversations.start"
    ],
    "main": "./extension.js",
    "contributes": {
        "commands": [
            {
                "command": "codeversations.start",
                "title": "Start Codeversations"
            }
        ]
    }
}# Codeversations

Turn your coding sessions into an office politics adventure!  
Unlock daily episodes, make choices, and climb from intern to CEO through humor and cunning.

## Features
- Daily episodic story unlock after 30 min coding
- Branching office drama dialogue choices
- Stats: Boss Approval, Coworker Respect, Office Politics
- Promotion system & streak bonuses
- Multiple endings, replayable

## How It Works
1. Code for ≥30 minutes in VS Code.
2. Open Codeversations (Command Palette: "Start Codeversations").
3. Play through today’s office drama episode.
4. Track your stats and climb the corporate ladder!

## Sample Conversation

> Steve: “Figures this would happen the same week we get a new intern…”
> - “I didn’t even touch it, Steve!” (+Boss Approval)
> - “Yeah, well at least I’m not still committing straight to main.” (+Coworker Respect)
> - “Of course I broke it… interns are the backbone of innovation.” (+Office Politics)

## Roadmap
- More episodes, mini-puzzles
- Stat-based alternate endings
- Office events, rival sabotage

---

Enjoy your daily dose of office comedy!


codeversations/
├── package.json
├── tsconfig.json
├── README.md
├── .vscode/
│   ├── launch.json
│   └── tasks.json
├── .vscodeignore
├── src/
│   ├── extension.ts
│   ├── game/
│   │   ├── conversationEngine.ts
│   │   └── episodeManager.ts
│   └── utils/
│       └── streakManager.ts
├── assets/
│   ├── styles/
│   │   └── pixel-ui.css
│   ├── fonts/
│   │   └── pixel-font.woff2
│   └── images/
│       ├── characters/
│       │   ├── karen.png
│       │   ├── steve.png
│       │   ├── maya.png
│       │   ├── boss.png
│       │   └── intern.png
│       ├── backgrounds/
│       │   ├── office.png
│       │   └── kitchen.png
│       └── ui/
│           ├── dialogue-box.png
│           ├── button.png
│           └── stats-panel.png
├── out/
│   └── (compiled JavaScript files)
└── node_modules/
    └── (dependencies)