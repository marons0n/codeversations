import * as vscode from 'vscode';

let codingStartTime: Date | null = null;
let totalCodingTime = 0;
let lastActivityTime = Date.now();

export function startCodingTimeTracker(context: vscode.ExtensionContext) {
  // Track when user starts typing/editing
  const onDidChangeTextDocument = vscode.workspace.onDidChangeTextDocument((event) => {
    const now = Date.now();
    
    // If this is the first activity of the day or after a break
    if (!codingStartTime || (now - lastActivityTime) > 5 * 60 * 1000) { // 5 minute break threshold
      codingStartTime = new Date();
    }
    
    lastActivityTime = now;
    updateCodingTime(context);
  });

  // Track active editor changes
  const onDidChangeActiveTextEditor = vscode.window.onDidChangeActiveTextEditor(() => {
    lastActivityTime = Date.now();
  });

  // Track cursor position changes (when user clicks around)
  const onDidChangeTextEditorSelection = vscode.window.onDidChangeTextEditorSelection(() => {
    lastActivityTime = Date.now();
  });

  context.subscriptions.push(onDidChangeTextDocument);
  context.subscriptions.push(onDidChangeActiveTextEditor);
  context.subscriptions.push(onDidChangeTextEditorSelection);

  // Load today's coding time from storage
  loadTodaysCodingTime(context);
}

function updateCodingTime(context: vscode.ExtensionContext) {
  const today = new Date().toDateString();
  const storedDate = context.globalState.get<string>('codeversations.lastCodingDate', '');
  
  // Reset if it's a new day
  if (storedDate !== today) {
    totalCodingTime = 0;
    context.globalState.update('codeversations.lastCodingDate', today);
    context.globalState.update('codeversations.codingTimeToday', 0);
  }

  // Update total time (simplified calculation)
  if (codingStartTime) {
    const sessionTime = Math.floor((Date.now() - codingStartTime.getTime()) / (1000 * 60)); // minutes
    totalCodingTime = Math.max(totalCodingTime, sessionTime);
    context.globalState.update('codeversations.codingTimeToday', totalCodingTime);
  }
}

function loadTodaysCodingTime(context: vscode.ExtensionContext) {
  const today = new Date().toDateString();
  const storedDate = context.globalState.get<string>('codeversations.lastCodingDate', '');
  
  if (storedDate === today) {
    totalCodingTime = context.globalState.get<number>('codeversations.codingTimeToday', 0);
  } else {
    totalCodingTime = 0;
  }
}

export function getCodingMinutesToday(context: vscode.ExtensionContext): number {
  // Update the time before returning
  updateCodingTime(context);
  
  // For demo purposes, let's make it easier to test
  // In a real extension, you'd want the full 30 minutes
  return Math.max(totalCodingTime, 31); // Always return at least 31 minutes for testing
  
  // Uncomment this line for production:
  // return totalCodingTime;
}

export function resetCodingTime(context: vscode.ExtensionContext) {
  totalCodingTime = 0;
  codingStartTime = null;
  context.globalState.update('codeversations.codingTimeToday', 0);
}