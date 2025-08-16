import * as vscode from 'vscode';

export interface Episode {
  title: string;
  scene: string;
  dialogue: DialogueStep[];
}

export interface DialogueStep {
  speaker: string;
  line: string;
  options: ChoiceOption[];
}

export interface ChoiceOption {
  text: string;
  effect: {
    boss?: number;
    coworker?: number;
    politics?: number;
  };
}

export interface Stats {
  boss: number;
  coworker: number;
  politics: number;
}

// Sample episodes data
const episodes: Episode[] = [
  {
    title: "The Coffee Machine Conflict",
    scene: "First day as intern. Office kitchen chaos. Coffee machine is broken. Coworkers argue, boss about to arrive.",
    dialogue: [
      {
        speaker: "Steve",
        line: "Figures this would happen the same week we get a new intern…",
        options: [
          { text: "I didn't even touch it, Steve!", effect: { boss: 1 } },
          { text: "Yeah, well at least I'm not still committing straight to main.", effect: { coworker: 2 } },
          { text: "Of course I broke it… interns are the backbone of innovation.", effect: { politics: 1 } }
        ]
      },
      {
        speaker: "Maya",
        line: "No caffeine = no designs. We're doomed.",
        options: [
          { text: "I'll fix the machine myself.", effect: { boss: 1 } },
          { text: "We could try tea instead…", effect: { coworker: -1 } },
          { text: "Let's just blame Steve.", effect: { politics: 2 } }
        ]
      },
      {
        speaker: "Boss",
        line: "Why isn't anyone working?",
        options: [
          { text: "The coffee machine is sabotaging productivity, sir!", effect: { boss: 1 } },
          { text: "We're brainstorming synergistic caffeine alternatives.", effect: { boss: -1 } },
          { text: "Honestly, Steve broke it.", effect: { boss: 2 } }
        ]
      }
    ]
  },
  {
    title: "The Deadline Disaster",
    scene: "Second day. Critical project deadline approaching. Team in panic mode. You hold the key information.",
    dialogue: [
      {
        speaker: "Project Manager",
        line: "We're behind schedule! Who has the latest requirements?",
        options: [
          { text: "I have them right here, saved the day again!", effect: { boss: 2 } },
          { text: "Actually, I think Steve has the most recent version.", effect: { coworker: 1 } },
          { text: "The requirements? I thought we were winging it!", effect: { politics: 1 } }
        ]
      },
      {
        speaker: "Senior Developer",
        line: "These specs make no sense. Who wrote this gibberish?",
        options: [
          { text: "I can clarify the requirements right now.", effect: { boss: 1 } },
          { text: "Yeah, whoever wrote this clearly doesn't understand the user flow.", effect: { coworker: -1 } },
          { text: "That's actually exactly what the client asked for.", effect: { politics: 2 } }
        ]
      }
    ]
  }
];

export function loadEpisode(): Episode {
  // For now, rotate between episodes based on date
  const today = new Date();
  const episodeIndex = today.getDate() % episodes.length;
  return episodes[episodeIndex];
}

export function getStats(context: vscode.ExtensionContext): Stats {
  const globalState = context.globalState;
  return {
    boss: globalState.get('codeversations.stats.boss', 0),
    coworker: globalState.get('codeversations.stats.coworker', 0),
    politics: globalState.get('codeversations.stats.politics', 0)
  };
}

export function saveStats(context: vscode.ExtensionContext, stats: Stats): void {
  const globalState = context.globalState;
  globalState.update('codeversations.stats.boss', stats.boss);
  globalState.update('codeversations.stats.coworker', stats.coworker);
  globalState.update('codeversations.stats.politics', stats.politics);
}

export function applyChoice(option: ChoiceOption, stats: Stats): Stats {
  const newStats = { ...stats };
  
  if (option.effect.boss) {
    newStats.boss += option.effect.boss;
  }
  if (option.effect.coworker) {
    newStats.coworker += option.effect.coworker;
  }
  if (option.effect.politics) {
    newStats.politics += option.effect.politics;
  }
  
  return newStats;
}