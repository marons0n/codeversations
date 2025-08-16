import * as vscode from 'vscode';
import { createGamePanel } from './game/conversationEngine';
import { startCodingTimeTracker } from './utils/streakManager';

export function activate(context) {
  console.log('Codeversations extension is now active!');

  // Start tracking coding time when extension activates
  startCodingTimeTracker(context);

  // Register the command to start the game
  const disposable = vscode.commands.registerCommand('codeversations.startGame', () => {
    createGamePanel(context);
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}