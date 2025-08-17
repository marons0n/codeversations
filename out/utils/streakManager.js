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
exports.getAllStats = exports.getWeeklyStats = exports.getCodingStreak = exports.startTrackingCodingTime = exports.getCodingMinutesToday = void 0;
const vscode = __importStar(require("vscode"));
function getCodingMinutesToday(context) {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const dailyStats = getDailyStats(context, today);
    // Update the current session if VS Code is active
    updateCurrentSession(context, today);
    return Math.floor(dailyStats.totalMinutes);
}
exports.getCodingMinutesToday = getCodingMinutesToday;
function startTrackingCodingTime(context) {
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
        }
        else {
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
exports.startTrackingCodingTime = startTrackingCodingTime;
function getDailyStats(context, date) {
    const globalState = context.globalState;
    const key = `codeversations.dailyStats.${date}`;
    return globalState.get(key, {
        date,
        totalMinutes: 0,
        sessions: [],
        lastActiveTime: Date.now()
    });
}
function saveDailyStats(context, stats) {
    const globalState = context.globalState;
    const key = `codeversations.dailyStats.${stats.date}`;
    globalState.update(key, stats);
}
function updateCurrentSession(context, date) {
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
function endCurrentSession(context, date) {
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
function getCodingStreak(context) {
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
        }
        else if (i === 0) {
            // If today doesn't have 30 minutes, streak is 0
            break;
        }
        else {
            // Found a gap, streak ends
            break;
        }
    }
    return streak;
}
exports.getCodingStreak = getCodingStreak;
function getWeeklyStats(context) {
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
exports.getWeeklyStats = getWeeklyStats;
// For debugging - get all stored data
function getAllStats(context) {
    const globalState = context.globalState;
    const keys = globalState.keys();
    const stats = {};
    keys.forEach(key => {
        if (key.startsWith('codeversations.dailyStats.')) {
            stats[key] = globalState.get(key);
        }
    });
    return stats;
}
exports.getAllStats = getAllStats;
//# sourceMappingURL=streakManager.js.map