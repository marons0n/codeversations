import * as vscode from 'vscode';

interface CodingSession {
    date: string;
    startTime: number;
    endTime: number;
    duration: number; // in minutes
}

interface DailyStats {
    date: string;
    totalMinutes: number;
    sessions: CodingSession[];
    lastActiveTime: number;
}

export function getCodingMinutesToday(context: vscode.ExtensionContext): number {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const dailyStats = getDailyStats(context, today);
    
    // Update the current session if VS Code is active
    updateCurrentSession(context, today);
    
    return Math.floor(dailyStats.totalMinutes);
}

export function startTrackingCodingTime(context: vscode.ExtensionContext): void {
    const today = new Date().toISOString().split('T')[0];
    
    // Start tracking when extension activates
    updateCurrentSession(context, today);
    
    // Set up periodic tracking (every minute)
    const interval = setInterval(() => {
        updateCurrentSession(context, today);
    }, 60000); // 60 seconds
    
    // Clean up interval when extension deactivates
    context.subscriptions.push({
        dispose: () => clearInterval(interval)
    });
    
    // Track when VS Code window gains/loses focus
    const onDidChangeWindowState = vscode.window.onDidChangeWindowState((state) => {
        const currentDate = new Date().toISOString().split('T')[0];
        if (state.focused) {
            // Window gained focus, start/resume tracking
            updateCurrentSession(context, currentDate);
        } else {
            // Window lost focus, end current session
            endCurrentSession(context, currentDate);
        }
    });
    
    context.subscriptions.push(onDidChangeWindowState);
    
    // Track document changes (typing activity)
    const onDidChangeTextDocument = vscode.workspace.onDidChangeTextDocument(() => {
        const currentDate = new Date().toISOString().split('T')[0];
        updateCurrentSession(context, currentDate);
    });
    
    context.subscriptions.push(onDidChangeTextDocument);
}

function getDailyStats(context: vscode.ExtensionContext, date: string): DailyStats {
    const globalState = context.globalState;
    const key = `codeversations.dailyStats.${date}`;
    
    return globalState.get(key, {
        date,
        totalMinutes: 0,
        sessions: [],
        lastActiveTime: Date.now()
    });
}

function saveDailyStats(context: vscode.ExtensionContext, stats: DailyStats): void {
    const globalState = context.globalState;
    const key = `codeversations.dailyStats.${stats.date}`;
    globalState.update(key, stats);
}

function updateCurrentSession(context: vscode.ExtensionContext, date: string): void {
    const now = Date.now();
    const dailyStats = getDailyStats(context, date);
    
    // If last activity was more than 5 minutes ago, start a new session
    const inactivityThreshold = 5 * 60 * 1000; // 5 minutes in milliseconds
    const timeSinceLastActivity = now - dailyStats.lastActiveTime;
    
    if (timeSinceLastActivity > inactivityThreshold) {
        // Start new session
        dailyStats.sessions.push({
            date,
            startTime: now,
            endTime: now,
            duration: 0
        });
    }
    
    // Update the current session
    if (dailyStats.sessions.length > 0) {
        const currentSession = dailyStats.sessions[dailyStats.sessions.length - 1];
        currentSession.endTime = now;
        currentSession.duration = Math.floor((currentSession.endTime - currentSession.startTime) / 60000); // minutes
        
        // Recalculate total minutes
        dailyStats.totalMinutes = dailyStats.sessions.reduce((total, session) => total + session.duration, 0);
    }
    
    dailyStats.lastActiveTime = now;
    saveDailyStats(context, dailyStats);
}

function endCurrentSession(context: vscode.ExtensionContext, date: string): void {
    const dailyStats = getDailyStats(context, date);
    
    if (dailyStats.sessions.length > 0) {
        const currentSession = dailyStats.sessions[dailyStats.sessions.length - 1];
        currentSession.endTime = Date.now();
        currentSession.duration = Math.floor((currentSession.endTime - currentSession.startTime) / 60000);
        
        // Recalculate total minutes
        dailyStats.totalMinutes = dailyStats.sessions.reduce((total, session) => total + session.duration, 0);
        
        saveDailyStats(context, dailyStats);
    }
}

export function getCodingStreak(context: vscode.ExtensionContext): number {
    // Get consecutive days with at least 30 minutes of coding
    const today = new Date();
    let streak = 0;
    
    for (let i = 0; i < 365; i++) { // Check up to a year back
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateString = checkDate.toISOString().split('T')[0];
        
        const dailyStats = getDailyStats(context, dateString);
        
        if (dailyStats.totalMinutes >= 30) {
            streak++;
        } else if (i === 0) {
            // If today doesn't have 30 minutes, streak is 0
            break;
        } else {
            // Found a gap, streak ends
            break;
        }
    }
    
    return streak;
}

export function getWeeklyStats(context: vscode.ExtensionContext): { totalMinutes: number, daysActive: number } {
    const today = new Date();
    let totalMinutes = 0;
    let daysActive = 0;
    
    for (let i = 0; i < 7; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateString = checkDate.toISOString().split('T')[0];
        
        const dailyStats = getDailyStats(context, dateString);
        totalMinutes += dailyStats.totalMinutes;
        
        if (dailyStats.totalMinutes > 0) {
            daysActive++;
        }
    }
    
    return { totalMinutes: Math.floor(totalMinutes), daysActive };
}

// For debugging - get all stored data
export function getAllStats(context: vscode.ExtensionContext): any {
    const globalState = context.globalState;
    const keys = globalState.keys();
    const stats: any = {};
    
    keys.forEach(key => {
        if (key.startsWith('codeversations.dailyStats.')) {
            stats[key] = globalState.get(key);
        }
    });
    
    return stats;
}