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
        // Handle admin bypass from welcome screen
        panel.webview.onDidReceiveMessage(message => {
            if (message.command === 'adminBypass') {
                // Load the game directly
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
                // Set up game message handling
                panel.webview.onDidReceiveMessage(gameMessage => {
                    if (gameMessage.command === 'makeChoice') {
                        const choice = episode.dialogue[conversationIndex].options[gameMessage.choiceIndex];
                        stats = (0, episodeManager_1.applyChoice)(choice, stats);
                        conversationIndex++;
                        renderConversation();
                    }
                }, undefined, context.subscriptions);
                renderConversation();
            }
        }, undefined, context.subscriptions);
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
        
        <div style="margin: 20px 0;">
            <button onclick="adminBypass()" style="
                font-family: 'Press Start 2P', monospace;
                font-size: 8px;
                padding: 8px 12px;
                background: var(--pixel-accent);
                color: var(--pixel-dark);
                border: 4px solid var(--pixel-dark);
                cursor: pointer;
                transition: all 0.1s;
            " onmouseover="this.style.background='#b8941f'" onmouseout="this.style.background='var(--pixel-accent)'">
                🔧 ADMIN: SIMULATE 30 MINUTES
            </button>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
        function adminBypass() {
            vscode.postMessage({
                command: 'adminBypass'
            });
        }
    </script>
    </div>
</body>
</html>`;
}
function getGameHtml(episode, currentDialogue, stats, index) {
    const speakerClass = currentDialogue.speaker.toLowerCase();
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
        --pixel-purple: #800080;
        --pixel-orange: #ff8c00;
        --wood-light: #deb887;
        --wood-dark: #8b7355;
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
        height: 100vh;
      }
      
      .game-container {
        width: 100vw;
        height: 100vh;
        background: var(--pixel-bg);
        display: flex;
        flex-direction: column;
      }
      
      .scene-area {
        flex: 1;
        min-height: 400px;
        background: linear-gradient(180deg, #e6f3ff 0%, #b8d4f0 20%, #87ceeb 40%, #f4f0e8 85%);
        position: relative;
        overflow: hidden;
        border-bottom: 4px solid var(--pixel-dark);
      }
      
      /* Office ceiling and walls */
      .office-ceiling {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 40px;
        background: 
          repeating-linear-gradient(90deg, #f5f5dc 0px, #f5f5dc 8px, #e6e6fa 8px, #e6e6fa 16px),
          linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%);
      }
      
      .office-walls {
        position: absolute;
        top: 40px;
        left: 0;
        right: 0;
        bottom: 120px;
        background: 
          repeating-linear-gradient(0deg, #f0f8ff 0px, #f0f8ff 2px, #e6f2ff 2px, #e6f2ff 4px);
      }
      
      /* Office floor with detailed pattern */
      .office-floor {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 120px;
        background: 
          repeating-linear-gradient(90deg, 
            var(--wood-light) 0px, 
            var(--wood-light) 12px, 
            var(--wood-dark) 12px, 
            var(--wood-dark) 14px,
            #d2b48c 14px,
            #d2b48c 26px,
            var(--wood-dark) 26px,
            var(--wood-dark) 28px
          );
        border-top: 2px solid var(--pixel-dark);
      }
      
      /* Office furniture */
      .office-furniture {
        position: absolute;
        top: 50px;
        left: 0;
        right: 0;
        bottom: 120px;
      }
      
      .desk {
        position: absolute;
        width: 80px;
        height: 40px;
        background: var(--wood-dark);
        border: 2px solid var(--pixel-dark);
        border-radius: 4px;
      }
      
      .desk.left {
        left: 50px;
        top: 60px;
      }
      
      .desk.right {
        right: 50px;
        top: 60px;
      }
      
      .desk.center {
        left: 50%;
        transform: translateX(-50%);
        top: 40px;
      }
      
      /* Computer monitors */
      .monitor {
        position: absolute;
        width: 24px;
        height: 18px;
        background: var(--pixel-dark);
        border: 1px solid #333;
        top: -20px;
        left: 50%;
        transform: translateX(-50%);
      }
      
      .monitor::after {
        content: '';
        position: absolute;
        width: 20px;
        height: 14px;
        background: #00ff00;
        top: 2px;
        left: 2px;
        animation: screenFlicker 3s infinite;
      }
      
      @keyframes screenFlicker {
        0%, 95% { opacity: 1; }
        96%, 100% { opacity: 0.7; }
      }
      
      /* Office supplies */
      .office-plants {
        position: absolute;
        left: 20px;
        bottom: 20px;
        width: 16px;
        height: 24px;
        background: 
          radial-gradient(circle at 8px 6px, #228b22 40%, transparent 40%),
          radial-gradient(circle at 8px 12px, #32cd32 30%, transparent 30%),
          linear-gradient(180deg, #8b4513 80%, #654321 100%);
        background-size: 16px 12px, 16px 12px, 16px 12px;
        background-position: 0 0, 0 6px, 0 12px;
      }
      
      .filing-cabinet {
        position: absolute;
        right: 30px;
        bottom: 20px;
        width: 20px;
        height: 50px;
        background: 
          repeating-linear-gradient(180deg, 
            #708090 0px, 
            #708090 12px, 
            var(--pixel-dark) 12px, 
            var(--pixel-dark) 14px
          );
        border: 2px solid var(--pixel-dark);
      }
      
      /* Enhanced coffee machine */
      .coffee-machine {
        position: absolute;
        left: 15px;
        bottom: 0;
        width: 32px;
        height: 60px;
        background: 
          linear-gradient(180deg, #e6e6fa 0%, #d3d3d3 20%, #c0c0c0 40%, #a9a9a9 70%, #808080 90%, #404040 100%);
        border: 2px solid var(--pixel-dark);
        border-radius: 4px 4px 0 0;
      }
      
      .coffee-machine::before {
        content: '';
        position: absolute;
        top: 8px;
        left: 6px;
        width: 20px;
        height: 8px;
        background: var(--pixel-dark);
        border-radius: 2px;
      }
      
      .coffee-machine::after {
        content: '';
        position: absolute;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        width: 6px;
        height: 6px;
        background: var(--pixel-red);
        border-radius: 50%;
        animation: blink 1.5s infinite;
        box-shadow: 0 0 4px var(--pixel-red);
      }
      
      /* Enhanced water cooler */
      .water-cooler {
        position: absolute;
        right: 15px;
        bottom: 0;
        width: 28px;
        height: 70px;
        background: 
          linear-gradient(180deg, 
            var(--pixel-blue) 0%, 
            #1e90ff 15%, 
            #87cefa 30%, 
            #ffffff 40%, 
            #f0f8ff 60%,
            #e6f3ff 80%,
            #d3d3d3 100%
          );
        border: 2px solid var(--pixel-dark);
        border-radius: 4px 4px 0 0;
      }
      
      .water-cooler::before {
        content: '';
        position: absolute;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        width: 16px;
        height: 20px;
        background: rgba(135, 206, 235, 0.7);
        border: 1px solid var(--pixel-blue);
        border-radius: 8px;
      }
      
      @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0.3; }
      }
      
      /* Enhanced character system */
      .characters {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 120px;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        padding: 0 60px;
        gap: 40px;
      }
      
      .character {
        width: 56px;
        height: 80px;
        position: relative;
        flex-shrink: 0;
      }
      
      .character.speaking {
        animation: bounce 0.6s ease-in-out infinite alternate;
      }
      
      @keyframes bounce {
        0% { transform: translateY(0px) scale(1); }
        100% { transform: translateY(-6px) scale(1.05); }
      }
      
      /* Detailed character sprites */
      .character.steve {
        background: var(--pixel-bg);
      }
      
      .character.steve::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 48px;
        height: 72px;
        background: 
          /* Hair */
          radial-gradient(ellipse 20px 12px at 24px 12px, #8b4513 60%, transparent 60%),
          /* Face outline */
          radial-gradient(ellipse 18px 20px at 24px 26px, #fdbcb4 70%, transparent 70%),
          /* Eyes */
          radial-gradient(circle 2px at 19px 23px, var(--pixel-dark) 80%, transparent 80%),
          radial-gradient(circle 2px at 29px 23px, var(--pixel-dark) 80%, transparent 80%),
          /* Mouth */
          radial-gradient(ellipse 4px 2px at 24px 30px, var(--pixel-dark) 60%, transparent 60%),
          /* Shirt */
          linear-gradient(180deg, transparent 40%, var(--pixel-blue) 40%, #000080 90%),
          /* Arms */
          radial-gradient(ellipse 8px 25px at 10px 55px, var(--pixel-blue) 70%, transparent 70%),
          radial-gradient(ellipse 8px 25px at 38px 55px, var(--pixel-blue) 70%, transparent 70%),
          /* Hands */
          radial-gradient(circle 4px at 10px 65px, #fdbcb4 80%, transparent 80%),
          radial-gradient(circle 4px at 38px 65px, #fdbcb4 80%, transparent 80%),
          /* Pants */
          linear-gradient(180deg, transparent 65%, #2f4f4f 65%, #1c1c1c 100%);
      }
      
      .character.maya {
        background: var(--pixel-bg);
      }
      
      .character.maya::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 48px;
        height: 72px;
        background: 
          /* Hair */
          radial-gradient(ellipse 22px 14px at 24px 10px, #2f4f4f 65%, transparent 65%),
          radial-gradient(ellipse 8px 16px at 16px 18px, #2f4f4f 70%, transparent 70%),
          radial-gradient(ellipse 8px 16px at 32px 18px, #2f4f4f 70%, transparent 70%),
          /* Face */
          radial-gradient(ellipse 18px 20px at 24px 26px, #fdbcb4 70%, transparent 70%),
          /* Eyes */
          radial-gradient(circle 2px at 19px 23px, var(--pixel-dark) 80%, transparent 80%),
          radial-gradient(circle 2px at 29px 23px, var(--pixel-dark) 80%, transparent 80%),
          /* Mouth */
          radial-gradient(ellipse 4px 2px at 24px 30px, var(--pixel-red) 60%, transparent 60%),
          /* Sweater */
          linear-gradient(180deg, transparent 40%, var(--pixel-purple) 40%, #4b0082 90%),
          /* Arms */
          radial-gradient(ellipse 8px 25px at 10px 55px, var(--pixel-purple) 70%, transparent 70%),
          radial-gradient(ellipse 8px 25px at 38px 55px, var(--pixel-purple) 70%, transparent 70%),
          /* Hands */
          radial-gradient(circle 4px at 10px 65px, #fdbcb4 80%, transparent 80%),
          radial-gradient(circle 4px at 38px 65px, #fdbcb4 80%, transparent 80%),
          /* Skirt */
          linear-gradient(180deg, transparent 65%, #8b008b 65%, #4b0082 100%);
      }
      
      .character.boss {
        background: var(--pixel-bg);
      }
      
      .character.boss::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 52px;
        height: 76px;
        background: 
          /* Hair (balding) */
          radial-gradient(ellipse 8px 6px at 18px 10px, #696969 70%, transparent 70%),
          radial-gradient(ellipse 8px 6px at 34px 10px, #696969 70%, transparent 70%),
          /* Face */
          radial-gradient(ellipse 20px 22px at 26px 26px, #fdbcb4 70%, transparent 70%),
          /* Eyes */
          radial-gradient(circle 2px at 21px 23px, var(--pixel-dark) 80%, transparent 80%),
          radial-gradient(circle 2px at 31px 23px, var(--pixel-dark) 80%, transparent 80%),
          /* Mustache */
          radial-gradient(ellipse 6px 2px at 26px 28px, #696969 80%, transparent 80%),
          /* Mouth */
          radial-gradient(ellipse 4px 2px at 26px 32px, var(--pixel-dark) 60%, transparent 60%),
          /* Suit jacket */
          linear-gradient(180deg, transparent 38%, #000000 38%, #1c1c1c 85%),
          /* Tie */
          linear-gradient(180deg, transparent 40%, var(--pixel-red) 40%, #8b0000 42%, var(--pixel-red) 44%, #8b0000 46%, var(--pixel-red) 48%, #8b0000 70%),
          /* Arms */
          radial-gradient(ellipse 9px 28px at 8px 58px, #000000 70%, transparent 70%),
          radial-gradient(ellipse 9px 28px at 44px 58px, #000000 70%, transparent 70%),
          /* Hands */
          radial-gradient(circle 4px at 8px 68px, #fdbcb4 80%, transparent 80%),
          radial-gradient(circle 4px at 44px 68px, #fdbcb4 80%, transparent 80%),
          /* Pants */
          linear-gradient(180deg, transparent 70%, #2c2c2c 70%, #000000 100%);
      }
      
      /* Compact stats panel */
      .stats-panel {
        background: var(--pixel-bg);
        border-top: 4px solid var(--pixel-dark);
        border-bottom: 4px solid var(--pixel-dark);
        padding: 8px 16px;
        display: flex;
        justify-content: space-around;
        text-align: center;
        min-height: 60px;
      }
      
      .stat {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      
      .stat-icon {
        font-size: 16px;
        display: block;
        margin-bottom: 2px;
      }
      
      .stat-value {
        font-size: 12px;
        color: var(--pixel-accent);
        font-weight: bold;
        margin: 2px 0;
      }
      
      .stat-label {
        font-size: 6px;
        color: var(--pixel-dark);
        text-transform: uppercase;
      }
      
      /* Compact dialogue system */
      .dialogue-container {
        background: var(--pixel-light);
        border-top: 4px solid var(--pixel-dark);
        padding: 12px;
        min-height: 120px;
      }
      
      .dialogue-box {
        background: var(--pixel-light);
        border: 3px solid var(--pixel-dark);
        padding: 10px;
        margin-bottom: 8px;
        position: relative;
      }
      
      .speaker {
        font-weight: bold;
        color: var(--pixel-dark);
        margin-bottom: 4px;
        text-transform: uppercase;
        font-size: 7px;
      }
      
      .dialogue-text {
        color: var(--pixel-dark);
        line-height: 12px;
        font-size: 7px;
      }
      
      /* Enhanced choice buttons */
      .choices {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      
      .choice-button {
        padding: 8px 10px;
        font-family: 'Press Start 2P', monospace;
        font-size: 6px;
        color: var(--pixel-dark);
        background: var(--pixel-bg);
        border: 3px solid;
        border-color: var(--pixel-light) var(--pixel-shadow) var(--pixel-shadow) var(--pixel-light);
        cursor: pointer;
        text-align: left;
        transition: all 0.1s;
        line-height: 10px;
        position: relative;
      }
      
      .choice-button:hover {
        background: #e6dcc6;
        border-color: var(--pixel-shadow) var(--pixel-light) var(--pixel-light) var(--pixel-shadow);
        transform: translate(1px, 1px);
      }
      
      .choice-button:active {
        background: var(--pixel-accent);
        transform: translate(2px, 2px);
      }
      
      .progress {
        text-align: center;
        font-size: 6px;
        color: var(--pixel-shadow);
        padding: 4px;
        background: var(--pixel-bg);
        border-bottom: 2px solid var(--pixel-dark);
      }
      
      /* Responsive adjustments */
      @media (max-height: 700px) {
        .scene-area {
          min-height: 300px;
        }
        
        .dialogue-container {
          min-height: 100px;
        }
        
        .stats-panel {
          min-height: 50px;
          padding: 6px 12px;
        }
      }
      
      @media (max-width: 800px) {
        .characters {
          gap: 20px;
          padding: 0 40px;
        }
        
        .character {
          width: 48px;
          height: 68px;
        }
        
        .office-furniture .desk {
          width: 60px;
          height: 30px;
        }
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
            <div class="office-ceiling"></div>
            <div class="office-walls"></div>
            <div class="office-furniture">
                <div class="desk left">
                    <div class="monitor"></div>
                </div>
                <div class="desk center">
                    <div class="monitor"></div>
                </div>
                <div class="desk right">
                    <div class="monitor"></div>
                </div>
                <div class="office-plants"></div>
                <div class="filing-cabinet"></div>
            </div>
            <div class="office-floor"></div>
            <div class="characters">
                <div class="coffee-machine"></div>
                <div class="character steve ${speakerClass === 'steve' ? 'speaking' : ''}"></div>
                <div class="character maya ${speakerClass === 'maya' ? 'speaking' : ''}"></div>
                <div class="character boss ${speakerClass === 'boss' || speakerClass === 'project manager' || speakerClass === 'senior developer' ? 'speaking' : ''}"></div>
                <div class="water-cooler"></div>
            </div>
        </div>

        <div class="progress">STEP ${index + 1} OF ${episode.dialogue.length} - ${episode.title.toUpperCase()}</div>

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

        <div class="dialogue-container">
            <div class="dialogue-box">
                <div class="speaker">${currentDialogue.speaker.toUpperCase()}:</div>
                <div class="dialogue-text">"${currentDialogue.line}"</div>
            </div>
            
            <div class="choices">
                ${currentDialogue.options.map((option, i) => `<button class="choice-button" onclick="makeChoice(${i})">
                    ${option.text}
                  </button>`).join('')}
            </div>
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