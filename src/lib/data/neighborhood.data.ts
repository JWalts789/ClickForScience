import { Decimal } from "../utils/decimal";

// ── NPC Definitions ─────────────────────────────────────────────────

export type NPCBonusType =
  | "generatorCostReduction"
  | "offlineEfficiency"
  | "clickMultiplier"
  | "reducedNegativeEvents"
  | "buffDuration"
  | "researchSpeed"
  | "globalMultiplier"
  | "autoClick"
  | "ipIncome"
  | "researchCostReduction";

export interface NPCBonus {
  type: NPCBonusType;
  /** Value scales with relationship level (this is the value at max relationship). */
  maxValue: number;
  description: string;
}

export interface FavorDef {
  id: string;
  name: string;
  description: string;
  /** Cost type: "rp" or "ip". */
  costType: "rp" | "ip";
  /** Cost amount. */
  cost: Decimal;
  /** Relationship points gained. */
  relationshipGain: number;
  /** Cooldown in seconds before this favor can be done again. */
  cooldownSec: number;
}

export interface NPCDef {
  id: string;
  name: string;
  title: string;
  description: string;
  portrait: string;
  /** Relationship bonuses — scale linearly from 0 at level 0 to maxValue at level 10. */
  bonuses: NPCBonus[];
  /** Available favors to increase relationship. */
  favors: FavorDef[];
  /** Flavor text at various relationship levels. */
  flavorByLevel: Record<number, string>;
}

// ── NPC Data ────────────────────────────────────────────────────────

export const NPCS: NPCDef[] = [
  {
    id: "doug",
    name: "Doug Henderson",
    title: "The Neighbor",
    description: "Your next-door neighbor. Mows his lawn at 7 AM sharp. Suspicious of your 'hobby.'",
    portrait: "🏠",
    bonuses: [
      { type: "generatorCostReduction", maxValue: 0.15, description: "Up to 15% generator cost reduction" },
      { type: "globalMultiplier", maxValue: 1.5, description: "Up to 1.5x global production (Silent Partner)" },
    ],
    favors: [
      {
        id: "doug_mow",
        name: "Mow His Lawn",
        description: "Doug's back is acting up again. Help him out.",
        costType: "rp",
        cost: new Decimal(1e6),
        relationshipGain: 1,
        cooldownSec: 300,
      },
      {
        id: "doug_beer",
        name: "Bring a Six-Pack",
        description: "Nothing says friendship like cold beer and not asking questions.",
        costType: "rp",
        cost: new Decimal(1e8),
        relationshipGain: 2,
        cooldownSec: 600,
      },
      {
        id: "doug_shed",
        name: "Borrow His Shed Key",
        description: "Doug has a key from the previous owner. He doesn't know what it opens. You might.",
        costType: "rp",
        cost: new Decimal(1e12),
        relationshipGain: 3,
        cooldownSec: 1200,
      },
    ],
    flavorByLevel: {
      0: "Doug eyes your garage with deep suspicion.",
      3: "Doug nods at you now. Progress.",
      5: "Doug brought over some cookies. His wife made them. He ate half.",
      7: "Doug offered to 'keep an eye out' for you. He means well.",
      8: "Doug showed you a photo from 1986 — your garage, but someone else's car. 'Previous owner was odd,' he said. 'Left in a hurry.'",
      9: "Doug handed you a key he found in his wall during renovations. 'It was in a sealed envelope marked VOSS. Mean anything to you?'",
      10: "'I don't understand what you do in there,' Doug says, 'but I respect the hustle.'",
    },
  },
  {
    id: "linda",
    name: "Linda Flemming",
    title: "Your Wife",
    description: "Your long-suffering wife. She married an accountant and got a mad scientist. Still here. Still loves you. Still concerned.",
    portrait: "👩‍💼",
    bonuses: [
      { type: "offlineEfficiency", maxValue: 0.3, description: "Up to +30% offline efficiency" },
      { type: "researchSpeed", maxValue: 2, description: "Up to 2x research speed (Couple's Research)" },
    ],
    favors: [
      {
        id: "linda_report",
        name: "Do the Dishes",
        description: "She's asked four times. Just do them, Gary.",
        costType: "rp",
        cost: new Decimal(1e6),
        relationshipGain: 1,
        cooldownSec: 300,
      },
      {
        id: "linda_research",
        name: "Share Research Notes",
        description: "She's genuinely interested — and her feedback is better than most peer reviews.",
        costType: "ip",
        cost: new Decimal(100),
        relationshipGain: 2,
        cooldownSec: 600,
      },
      {
        id: "linda_letters",
        name: "Read Her Old Letters",
        description: "Linda found letters in the attic from 1987. They're addressed to someone who used to live here.",
        costType: "rp",
        cost: new Decimal(1e12),
        relationshipGain: 3,
        cooldownSec: 1200,
      },
    ],
    flavorByLevel: {
      0: "Linda loves you. She's also worried about you. Both are valid.",
      3: "Linda's started checking on you in the garage. She brings snacks.",
      5: "Linda sat and watched you work for an hour. Didn't say a word. Smiled once.",
      7: "'I don't understand all of it,' she says, 'but I understand you.'",
      8: "Linda found a box in the attic labeled 'DO NOT OPEN — H.V.' You opened it. Inside: a journal, a key, and a faded photo of your garage.",
      9: "'Gary,' Linda said quietly, 'the journal mentions a project. CHRYSALIS. And our address.' She paused. 'It's from 1987.'",
      10: "Linda has her own station in the lab now. The Flemmings: a scientific power couple.",
    },
  },
  {
    id: "max",
    name: "Max Flemming",
    title: "Your Son",
    description: "Your 11-year-old son. Thinks your garage is the coolest place on Earth. He's not wrong.",
    portrait: "🧒",
    bonuses: [
      { type: "clickMultiplier", maxValue: 3, description: "Up to 3x click value (Eager Helper)" },
      { type: "autoClick", maxValue: 1, description: "Up to 1 auto-click per second (Apprentice)" },
    ],
    favors: [
      {
        id: "max_teach",
        name: "Teach Him Science",
        description: "Your boy wants to learn from his dad. His enthusiasm is exhausting but genuine.",
        costType: "rp",
        cost: new Decimal(5e5),
        relationshipGain: 1,
        cooldownSec: 300,
      },
      {
        id: "max_project",
        name: "Help With School Project",
        description: "His science fair project is a volcano. You can do better than a volcano.",
        costType: "ip",
        cost: new Decimal(50),
        relationshipGain: 2,
        cooldownSec: 600,
      },
      {
        id: "max_drawings",
        name: "Review His Drawings",
        description: "Max has been drawing things he shouldn't know about. Complex things.",
        costType: "ip",
        cost: new Decimal(1000),
        relationshipGain: 3,
        cooldownSec: 1200,
      },
    ],
    flavorByLevel: {
      0: "Max presses his face against the garage window. 'Dad, whatcha doing?'",
      3: "Max started calling you 'Professor Dad.' You didn't correct him.",
      5: "Max won the science fair. His teacher had questions for you.",
      7: "Max brings his friends to watch you work. 'My dad's a scientist,' he tells them.",
      8: "Max's drawings have gotten... specific. Circuit diagrams. Molecular structures. He says he 'just sees them.'",
      9: "You found Max in the garage at 3 AM, rearranging your equipment into a configuration you've never considered. It would work better his way.",
      10: "'When I grow up, I wanna be a mad— I mean, a scientist. Like you, Dad.'",
    },
  },
  {
    id: "reeves",
    name: "Agent Reeves",
    title: "The Government Man",
    description: "He says he's from the 'Department of Neighborhood Safety.' That's not a real department.",
    portrait: "🕴️",
    bonuses: [
      { type: "reducedNegativeEvents", maxValue: 0.5, description: "Up to 50% fewer negative events" },
      { type: "ipIncome", maxValue: 10, description: "Up to +10 free IP/sec (Government Grant)" },
    ],
    favors: [
      {
        id: "reeves_report",
        name: "File an Incident Report",
        description: "Agent Reeves needs documentation. What exactly are you documenting? Don't ask.",
        costType: "ip",
        cost: new Decimal(200),
        relationshipGain: 1,
        cooldownSec: 600,
      },
      {
        id: "reeves_cooperate",
        name: "Voluntary Cooperation",
        description: "Let Reeves observe one of your experiments. He takes very careful notes.",
        costType: "rp",
        cost: new Decimal(1e9),
        relationshipGain: 3,
        cooldownSec: 900,
      },
      {
        id: "reeves_classified",
        name: "Access Classified Files",
        description: "The real files on Gary's house. What the government already knows about this address.",
        costType: "ip",
        cost: new Decimal(2000),
        relationshipGain: 4,
        cooldownSec: 1800,
      },
    ],
    flavorByLevel: {
      0: "Agent Reeves parks outside your house every Thursday. He thinks you don't notice.",
      3: "Reeves nodded at you once. That's practically a hug in government speak.",
      5: "Reeves mentioned 'budget reallocation' in your direction. Could be good.",
      7: "Reeves left his card. The number actually works now.",
      8: "Reeves slid a folder across the table. 'Harold Voss. Lived here 1979-1987. Brilliant. Dangerous. Disappeared.' He looked at you. 'Sound familiar?'",
      9: "'I'm not here to stop you, Gary,' Reeves said. 'I'm here to make sure what happened to Voss doesn't happen to you. They're watching.'",
      10: "'Officially, I was never here. Unofficially... keep up the good work.'",
    },
  },
  {
    id: "patterson",
    name: "Mrs. Patterson",
    title: "The Retired Teacher",
    description: "The sweet old lady across the street. Her cookies are legendary. Her memory is selective.",
    portrait: "👵",
    bonuses: [
      { type: "buffDuration", maxValue: 2, description: "Up to 2x buff duration" },
      { type: "globalMultiplier", maxValue: 1.3, description: "Up to 1.3x global production (Grandma's Secret)" },
    ],
    favors: [
      {
        id: "pat_groceries",
        name: "Carry Her Groceries",
        description: "Mrs. Patterson's groceries are heavier than they should be. Don't look inside.",
        costType: "rp",
        cost: new Decimal(5e5),
        relationshipGain: 1,
        cooldownSec: 300,
      },
      {
        id: "pat_stories",
        name: "Listen to Her Stories",
        description: "She worked at 'a lab' in the 60s. The stories are... illuminating.",
        costType: "rp",
        cost: new Decimal(1e7),
        relationshipGain: 2,
        cooldownSec: 600,
      },
      {
        id: "pat_basement",
        name: "Visit Her Basement",
        description: "Mrs. Patterson kept everything from her old lab. Everything.",
        costType: "ip",
        cost: new Decimal(1500),
        relationshipGain: 4,
        cooldownSec: 1800,
      },
    ],
    flavorByLevel: {
      0: "Mrs. Patterson waves from her porch. She waves at everyone.",
      3: "She's started leaving cookies on your doorstep. Homemade.",
      5: "Mrs. Patterson mentioned she 'used to do something similar.' She winked.",
      7: "She gave you a jar of something. It glows faintly. 'For your experiments, dear.'",
      8: "Mrs. Patterson showed you a photo: herself, young, in a lab coat. The badge read 'CHRYSALIS — Level 5 Clearance.' She smiled. 'I was the project lead.'",
      9: "'Harold was my best researcher,' she said, staring at your garage. 'He built everything you're building now. And then he built something more.' Her eyes darkened. 'That's when they came for him.'",
      10: "'You remind me of myself, Gary. Before the incident. Don't worry about which incident.'",
    },
  },
  {
    id: "chen",
    name: "Professor Chen",
    title: "The Visiting Academic",
    description: "A physics professor who just moved in next door. She knows exactly what you're doing.",
    portrait: "👩‍🔬",
    bonuses: [
      { type: "researchSpeed", maxValue: 1.5, description: "Up to 1.5x research speed" },
      { type: "researchCostReduction", maxValue: 0.3, description: "Up to 30% research IP cost reduction" },
    ],
    favors: [
      {
        id: "chen_paper",
        name: "Co-Author a Paper",
        description: "She needs a co-author for a 'theoretical' paper. The theory is very specific to your work.",
        costType: "ip",
        cost: new Decimal(150),
        relationshipGain: 1,
        cooldownSec: 300,
      },
      {
        id: "chen_collab",
        name: "Joint Experiment",
        description: "Combine your resources for a day. The results are... extraordinary.",
        costType: "ip",
        cost: new Decimal(500),
        relationshipGain: 3,
        cooldownSec: 900,
      },
      {
        id: "chen_notes",
        name: "Compare Research Notes",
        description: "Chen has data on the Elm Street anomaly. It overlaps with yours in ways that shouldn't be possible.",
        costType: "ip",
        cost: new Decimal(2500),
        relationshipGain: 4,
        cooldownSec: 1800,
      },
    ],
    flavorByLevel: {
      0: "Professor Chen observed your garage. She took notes. Detailed notes.",
      3: "Chen left a peer review of your work on your doorstep. Mostly positive.",
      5: "'Your methodology is unorthodox,' she says. 'I approve.'",
      7: "Chen started citing your work in her papers. Under a pseudonym, but still.",
      8: "Chen pulled up satellite data of your neighborhood. There's an electromagnetic anomaly centered on... your garage. It's been there since at least 1960.",
      9: "'The anomaly predates the houses,' Chen said. 'Someone built this neighborhood ON TOP of it. On purpose. Gary — you were always supposed to be here.'",
      10: "'Gary, I came to this neighborhood specifically because of you. I hope that's not creepy.'",
    },
  },
];

// ── Helpers ─────────────────────────────────────────────────────────

export const MAX_RELATIONSHIP = 10;

export function getNPCDef(id: string): NPCDef | undefined {
  return NPCS.find((n) => n.id === id);
}

export function getFavorDef(npcId: string, favorId: string): FavorDef | undefined {
  const npc = getNPCDef(npcId);
  return npc?.favors.find((f) => f.id === favorId);
}

/** Get the flavor text for an NPC at a given relationship level (uses highest matching threshold). */
export function getNPCFlavorText(npc: NPCDef, level: number): string {
  const thresholds = Object.keys(npc.flavorByLevel)
    .map(Number)
    .sort((a, b) => b - a);
  for (const t of thresholds) {
    if (level >= t) return npc.flavorByLevel[t];
  }
  return npc.flavorByLevel[0] ?? "";
}
