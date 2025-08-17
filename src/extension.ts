import * as vscode from 'vscode';
import { startTrackingCodingTime } from './utils/streakManager';

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
    console.log('Codeversations extension is now active!');
    
    // Start tracking coding time
    startTrackingCodingTime(context);

    // Register the startGame command
    let disposable = vscode.commands.registerCommand('codeversations.startGame', () => {
        // Import and call your game logic
        const { createGamePanel } = require('./game/conversationEngine');
        createGamePanel(context);
    });

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {
    console.log('Codeversations extension is now deactivated.');
}