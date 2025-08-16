"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGamePanel = void 0;
const vscode = __importStar(require("vscode"));
const streakManager_1 = require("../utils/streakManager");
const episodeManager_1 = require("./episodeManager");
function createGamePanel(context) {
    const panel = vscode.window.createWebviewPanel('codeversations', 'Codeversations', vscode.ViewColumn.One, {
        enableScripts: true,
        retainContextWhenHidden: true
    });
    // Check coding time
    const minutes = (0, streakManager_1.getCodingMinutesToday)(context);
    if (minutes < 30) {
        panel.webview.html = getWelcomeHtml(minutes);
        return;
    }
    // Load today's episode
    const episode = (0, episodeManager_1.loadEpisode)();
    let stats = (0, episodeManager_1.getStats)(context);
    let conversationIndex = 0;
    function renderConversation() {
        if (conversationIndex >= episode.dialogue.length) {
            panel.webview.html = getCompletionHtml(stats);
            (0, episodeManager_1.saveStats)(context, stats);
            return;
        }
        const currentDialogue = episode.dialogue[conversationIndex];
        panel.webview.html = getGameHtml(episode, currentDialogue, stats, conversationIndex);
    }
    // Handle messages from the webview
    panel.webview.onDidReceiveMessage(message => {
        if (message.command === 'makeChoice') {
            const choice = episode.dialogue[conversationIndex].options[message.choiceIndex];
            stats = (0, episodeManager_1.applyChoice)(choice, stats);
            conversationIndex++;
            renderConversation();
        }
    }, undefined, context.subscriptions);
    renderConversation();
}
exports.createGamePanel = createGamePanel;
function getWelcomeHtml(minutes) {
    const pixelCss = `
    <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
    <style>
      :root {
        --pixel-bg: #f4f0e8;
        --pixel-dark: #2c1810;
        --pixel-accent: #d4af37;
        --pixel-green: #32cd32;
        --pixel-shadow: #4a3728;
        --pixel-light: #ffffff;
      }
      
      body {
        font-family: 'Press Start 2P', monospace;
        font-size: 8px;
        line-height: 16px;
        color: var(--pixel-dark);
        background: var(--pixel-bg);
        margin: 0;
        padding: 16px;
        text-align: center;
      }
      
      .welcome-container {
        max-width: 600px;
        margin: 0 auto;
        background: var(--pixel-bg);
        border: 4px solid var(--pixel-dark);
        padding: 20px;
      }
      
      .title {
        font-size: 16px;
        color: var(--pixel-accent);
        margin-bottom: 20px;
        text-shadow: 2px 2px 0px var(--pixel-shadow);
      }
      
      .timer-display {
        font-size: 24px;
        color: var(--pixel-dark);
        background: var(--pixel-light);
        border: 4px solid var(--pixel-dark);
        padding: 12px;
        margin: 20px 0;
      }
      
      .progress-container {
        margin: 20px 0;
      }
      
      .progress-bar {
        width: 100%;
        height: 24px;
        background: var(--pixel-shadow);
        border: 4px solid var(--pixel-dark);
        position: relative;
        margin: 8px 0;
      }
      
      .progress-fill {
        height: 100%;
        background: repeating-linear-gradient(90deg, var(--pixel-green) 0px, var(--pixel-green) 4px, #228b22 4px, #228b22 8px);
        transition: width 0.5s ease;
        width: ${Math.min((minutes / 30) * 100, 100)}%;
      }
      
      .instructions {
        text-align: left;
        margin: 20px 0;
        background: var(--pixel-light);
        border: 4px solid var(--pixel-dark);
        padding: 16px;
      }
      
      .instruction-item {
        margin: 8px 0;
        padding-left: 16px;
      }
      
      .status-message {
        font-size: 10px;
        color: ${minutes >= 30 ? 'var(--pixel-green)' : 'var(--pixel-dark)'};
        margin: 16px 0;
        padding: 12px;
        background: var(--pixel-light);
        border: 4px solid var(--pixel-dark);
      }
    </style>
  `;
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Codeversations</title>
    ${pixelCss}
</head>
<body>
    <div class="welcome-container">
        <div class="title">🏢 CODEVERSATIONS</div>
        <div>WELCOME TO THE OFFICE POLITICS SIMULATOR!</div>
        
        <div class="timer-display">CODING TIME: ${minutes} MIN</div>
        
        <div class="progress-container">
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
            <div>PROGRESS TO UNLOCK: ${Math.min((minutes / 30) * 100, 100).toFixed(0)}%</div>
        </div>
        
        <div class="status-message">
            ${minutes >= 30 ?
        'EPISODE UNLOCKED! RUN COMMAND AGAIN TO START.' :
        `NEED ${30 - minutes} MORE MINUTES TO UNLOCK.`}
        </div>
        
        <div class="instructions">
            <div style="font-weight: bold; margin-bottom: 12px;">HOW TO PLAY:</div>
            <div class="instruction-item">→ CODE FOR 30+ MINUTES TO UNLOCK</div>
            <div class="instruction-item">→ NAVIGATE OFFICE DRAMA</div>
            <div class="instruction-item">→ BUILD YOUR STATS</div>
            <div class="instruction-item">→ CLIMB THE CORPORATE LADDER</div>
        </div>
    </div>
</body>
</html>`;
}
function getGameHtml(episode, currentDialogue, stats, index) {
    const pixelCss = `
    <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
    <style>
      :root {
        --pixel-bg: #f4f0e8;
        --pixel-dark: #2c1810;
        --pixel-border: #8b7355;
        --pixel-light: #ffffff;
        --pixel-shadow: #4a3728;
        --pixel-accent: #d4af37;
        --pixel-blue: #4169e1;
        --pixel-red: #dc143c;
        --pixel-green: #32cd32;
      }
      
      body {
        font-family: 'Press Start 2P', monospace;
        font-size: 8px;
        line-height: 16px;
        color: var(--pixel-dark);
        background: var(--pixel-bg);
        margin: 0;
        padding: 0;
        image-rendering: pixelated;
        overflow-x: hidden;
      }
      
      .game-container {
        max-width: 800px;
        margin: 0 auto;
        background: var(--pixel-bg);
        border: 4px solid var(--pixel-dark);
      }
      
      .scene-area {
        height: 200px;
        background: linear-gradient(180deg, #87ceeb 0%, #f4f0e8 70%);
        border-bottom: 4px solid var(--pixel-dark);
        position: relative;
        overflow: hidden;
      }
      
      .office-background {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 80px;
        background: repeating-linear-gradient(90deg, #d2b48c 0px, #d2b48c 2px, #c19a6b 2px, #c19a6b 4px);
      }
      
      .characters {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 80px;
        display: flex;
        align-items: flex-end;
        justify-content: space-around;
        padding: 0 20px;
      }
      
      .character {
        width: 48px;
        height: 64px;
        position: relative;
        flex-shrink: 0;
      }
      
      .character.speaking {
        animation: bounce 0.5s ease-in-out infinite alternate;
      }
      
      @keyframes bounce {
        0% { transform: translateY(0px); }
        100% { transform: translateY(-2px); }
      }
      
      .character.karen {
        background: 
          radial-gradient(ellipse at center, #daa520 30%, transparent 30%),
          radial-gradient(ellipse at center, #fdbcb4 20%, transparent 20%),
          linear-gradient(180deg, #800080 40%, #483d8b 60%);
        background-position: 50% 15%, 50% 35%, 50% 65%;
        background-repeat: no-repeat;
        background-size: 30px 15px, 24px 20px, 40px 45px;
      }
      
      .character.steve {
        background: 
          radial-gradient(ellipse at center, #8b4513 30%, transparent 30%),
          radial-gradient(ellipse at center, #fdbcb4 20%, transparent 20%),
          linear-gradient(180deg, #4169e1 40%, #000080 60%);
        background-position: 50% 15%, 50% 35%, 50% 65%;
        background-repeat: no-repeat;
        background-size: 28px 14px, 24px 20px, 40px 45px;
      }
      
      .coffee-machine {
        position: absolute;
        left: 10px;
        bottom: 0;
        width: 24px;
        height: 48px;
        background: linear-gradient(180deg, #c0c0c0 0%, #808080 50%, #404040 100%);
        border: 2px solid var(--pixel-dark);
      }
      
      .coffee-machine::after {
        content: '';
        position: absolute;
        top: 6px;
        left: 50%;
        transform: translateX(-50%);
        width: 4px;
        height: 4px;
        background: var(--pixel-red);
        animation: blink 1s infinite;
      }
      
      @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
      }
      
      .stats-panel {
        background: var(--pixel-bg);
        border-bottom: 4px solid var(--pixel-dark);
        padding: 12px;
        display: flex;
        justify-content: space-around;
        text-align: center;
      }
      
      .stat {
        flex: 1;
      }
      
      .stat-icon {
        font-size: 12px;
        display: block;
        margin-bottom: 2px;
      }
      
      .stat-value {
        font-size: 10px;
        color: var(--pixel-accent);
        font-weight: bold;
        margin: 2px 0;
      }
      
      .stat-label {
        font-size: 6px;
        color: var(--pixel-dark);
      }
      
      .dialogue-container {
        margin: 12px;
      }
      
      .dialogue-box {
        padding: 12px;
        background: var(--pixel-light);
        border: 4px solid var(--pixel-dark);
        position: relative;
        min-height: 60px;
      }
      
      .dialogue-box::before {
        content: '';
        position: absolute;
        bottom: -16px;
        left: 24px;
        width: 0;
        height: 0;
        border: 8px solid transparent;
        border-top-color: var(--pixel-dark);
        z-index: 1;
      }
      
      .dialogue-box::after {
        content: '';
        position: absolute;
        bottom: -12px;
        left: 26px;
        width: 0;
        height: 0;
        border: 6px solid transparent;
        border-top-color: var(--pixel-light);
        z-index: 2;
      }
      
      .speaker {
        font-weight: bold;
        color: var(--pixel-dark);
        margin-bottom: 6px;
        text-transform: uppercase;
      }
      
      .dialogue-text {
        color: var(--pixel-dark);
        line-height: 14px;
      }
      
      .choices {
        margin: 12px;
      }
      
      .choice-button {
        display: block;
        width: 100%;
        padding: 10px 12px;
        margin: 6px 0;
        font-family: 'Press Start 2P', monospace;
        font-size: 7px;
        color: var(--pixel-dark);
        background: var(--pixel-bg);
        border: 4px solid;
        border-color: var(--pixel-light) var(--pixel-shadow) var(--pixel-shadow) var(--pixel-light);
        cursor: pointer;
        text-align: left;
        transition: all 0.1s;
        line-height: 12px;
      }
      
      .choice-button:hover {
        background: #e6dcc6;
        border-color: var(--pixel-shadow) var(--pixel-light) var(--pixel-light) var(--pixel-shadow);
        transform: translate(1px, 1px);
      }
      
      .choice-effect {
        color: var(--pixel-blue);
        font-size: 6px;
        margin-top: 3px;
      }
      
      .progress {
        text-align: center;
        margin: 8px;
        font-size: 6px;
        color: var(--pixel-shadow);
      }
    </style>
  `;
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Codeversations</title>
    ${pixelCss}
</head>
<body>
    <div class="game-container">
        <div class="scene-area">
            <div class="office-background"></div>
            <div class="characters">
                <div class="coffee-machine"></div>
                <div class="character karen ${currentDialogue.speaker.toLowerCase() === 'karen' ? 'speaking' : ''}"></div>
                <div class="character steve ${currentDialogue.speaker.toLowerCase() === 'steve' ? 'speaking' : ''}"></div>
            </div>
        </div>

        <div class="stats-panel">
            <div class="stat">
                <div class="stat-icon">👔</div>
                <div class="stat-value">${stats.boss}</div>
                <div class="stat-label">BOSS</div>
            </div>
            <div class="stat">
                <div class="stat-icon">🤝</div>
                <div class="stat-value">${stats.coworker}</div>
                <div class="stat-label">PEERS</div>
            </div>
            <div class="stat">
                <div class="stat-icon">🎭</div>
                <div class="stat-value">${stats.politics}</div>
                <div class="stat-label">POLITICS</div>
            </div>
        </div>

        <div class="progress">STEP ${index + 1} OF ${episode.dialogue.length}</div>

        <div class="dialogue-container">
            <div class="dialogue-box">
                <div class="speaker">${currentDialogue.speaker.toUpperCase()}:</div>
                <div class="dialogue-text">"${currentDialogue.line}"</div>
            </div>
        </div>

        <div class="choices">
            ${currentDialogue.options.map((option, i) => `<button class="choice-button" onclick="makeChoice(${i})">
                ${option.text}
                <div class="choice-effect">${getEffectText(option.effect)}</div>
              </button>`).join('')}
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
        function makeChoice(choiceIndex) {
            vscode.postMessage({
                command: 'makeChoice',
                choiceIndex: choiceIndex
            });
        }
    </script>
</body>
</html>`;
}
function getEffectText(effect) {
    // const effects = [];
    // if (effect.boss) effects.push(`👔 ${effect.boss > 0 ? '+' : ''}${effect.boss}`);
    // if (effect.coworker) effects.push(`🤝 ${effect.coworker > 0 ? '+' : ''}${effect.coworker}`);
    // if (effect.politics) effects.push(`🎭 ${effect.politics > 0 ? '+' : ''}${effect.politics}`);
    // return effects.length > 0 ? ` (${effects.join(', ')})` : '';
    return "";
}
function getCompletionHtml(stats) {
    const pixelCss = `
    <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
    <style>
      :root {
        --pixel-bg: #f4f0e8;
        --pixel-dark: #2c1810;
        --pixel-accent: #d4af37;
        --pixel-light: #ffffff;
        --pixel-shadow: #4a3728;
      }
      
      body {
        font-family: 'Press Start 2P', monospace;
        font-size: 8px;
        line-height: 16px;
        color: var(--pixel-dark);
        background: var(--pixel-bg);
        margin: 0;
        padding: 20px;
        text-align: center;
      }
      
      .completion-container {
        max-width: 600px;
        margin: 0 auto;
        background: var(--pixel-bg);
        border: 4px solid var(--pixel-dark);
        padding: 24px;
      }
      
      .completion-title {
        font-size: 16px;
        color: var(--pixel-accent);
        margin-bottom: 20px;
        text-shadow: 2px 2px 0px var(--pixel-shadow);
        animation: glow 2s ease-in-out infinite alternate;
      }
      
      @keyframes glow {
        from { text-shadow: 2px 2px 0px var(--pixel-shadow); }
        to { text-shadow: 2px 2px 0px var(--pixel-shadow), 0 0 8px var(--pixel-accent); }
      }
      
      .subtitle {
        font-size: 10px;
        margin-bottom: 30px;
        color: var(--pixel-dark);
      }
      
      .final-stats {
        display: flex;
        justify-content: center;
        gap: 40px;
        margin: 30px 0;
        padding: 20px;
        background: var(--pixel-light);
        border: 4px solid var(--pixel-dark);
      }
      
      .stat {
        text-align: center;
      }
      
      .stat-icon {
        font-size: 24px;
        display: block;
        margin-bottom: 8px;
      }
      
      .stat-value {
        font-size: 20px;
        color: var(--pixel-accent);
        font-weight: bold;
        margin: 8px 0;
      }
      
      .stat-label {
        font-size: 6px;
        color: var(--pixel-dark);
        text-transform: uppercase;
      }
      
      .message {
        font-size: 10px;
        margin: 24px 0;
        color: var(--pixel-dark);
        background: var(--pixel-light);
        border: 4px solid var(--pixel-dark);
        padding: 16px;
        line-height: 14px;
      }
      
      @media (max-width: 600px) {
        .final-stats {
          flex-direction: column;
          gap: 20px;
        }
      }
    </style>
  `;
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Episode Complete</title>
    ${pixelCss}
</head>
<body>
    <div class="completion-container">
        <div class="completion-title">🎉 EPISODE COMPLETE!</div>
        <div class="subtitle">ANOTHER DAY AT THE OFFICE... SURVIVED!</div>

        <div class="final-stats">
            <div class="stat">
                <div class="stat-icon">👔</div>
                <div class="stat-value">${stats.boss}</div>
                <div class="stat-label">BOSS APPROVAL</div>
            </div>
            <div class="stat">
                <div class="stat-icon">🤝</div>
                <div class="stat-value">${stats.coworker}</div>
                <div class="stat-label">COWORKER RESPECT</div>
            </div>
            <div class="stat">
                <div class="stat-icon">🎭</div>
                <div class="stat-value">${stats.politics}</div>
                <div class="stat-label">OFFICE POLITICS</div>
            </div>
        </div>

        <div class="message">
            KEEP CODING TO UNLOCK TOMORROW'S EPISODE!<br><br>
            THE CORPORATE LADDER AWAITS... 🪜
        </div>
    </div>
</body>
</html>`;
}
//# sourceMappingURL=conversationEngine.js.map