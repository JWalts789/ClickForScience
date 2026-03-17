import type { MadnessArchetype } from "../engine/state";

// ── Event Trigger ───────────────────────────────────────────────────

export interface EventTrigger {
  type:
    | "generatorOwned"
    | "totalRPAllTime"
    | "clickCount"
    | "prestigeCount"
    | "madnessLevel"
    | "dominantArchetype"
    | "upgradeOwned"
    | "generatorCount"
    | "labLevel"
    | "ascensionCount"
    | "challengesCompleted";

  genId?: string;
  upgradeId?: string;
  count?: number;
  amount?: number;
  level?: number;
  archetype?: MadnessArchetype;
}

// ── Event Outcomes ──────────────────────────────────────────────────

export type EventOutcome =
  | { type: "rpBonus"; amount: number }
  | { type: "rpMultSeconds"; seconds: number }
  | { type: "productionBuff"; target: string; multiplier: number; durationSec: number }
  | { type: "clickBuff"; multiplier: number; durationSec: number }
  | { type: "madnessAffinity"; archetype: MadnessArchetype; points: number }
  | { type: "unlockNote"; noteId: string }
  | { type: "queueTicker"; text: string }
  | { type: "rpCost"; percent: number };

// ── Event Choice ────────────────────────────────────────────────────

export interface EventChoice {
  label: string;
  description: string;
  outcomes: EventOutcome[];
}

// ── Event Definition ────────────────────────────────────────────────

export interface EventDef {
  id: string;
  title: string;
  body: string;
  trigger: EventTrigger;
  choices: EventChoice[];
  /** Only show if this archetype is dominant. */
  requiresArchetype?: MadnessArchetype;
  /** Only show if madness level is at least this. */
  requiresMadnessLevel?: number;
}

// ── Event Definitions ───────────────────────────────────────────────

export const EVENTS: EventDef[] = [
  // ── Early Game ────────────────────────────────────────────────────

  {
    id: "hoa_letter",
    title: "The HOA Letter",
    body: "A crisp envelope from the Homeowners Association. Doug Henderson — your neighbor — has filed a formal noise complaint about \"industrial sounds\" from your garage. The letter uses the phrase \"unacceptable residential conduct\" three times.",
    trigger: { type: "generatorOwned", genId: "chemistry", count: 10 },
    choices: [
      {
        label: "Soundproof the Garage",
        description: "+2x notebook production for 2 minutes",
        outcomes: [
          { type: "productionBuff", target: "notebook", multiplier: 2, durationSec: 120 },
          { type: "queueTicker", text: "GARAGE SOUNDPROOFED — Neighbors report suspicious silence. \"It's somehow worse,\" says Doug Henderson." },
        ],
      },
      {
        label: "Invite Doug Over",
        description: "+3 Perfectionist affinity, new lab note",
        outcomes: [
          { type: "madnessAffinity", archetype: "perfectionist", points: 3 },
          { type: "unlockNote", noteId: "event_doug_invited" },
          { type: "queueTicker", text: "NEIGHBOR TOURS GARAGE LAB — \"I don't understand any of this but the cable management is nice,\" admits Doug Henderson." },
        ],
      },
      {
        label: "Ignore It",
        description: "+5 Unhinged affinity",
        outcomes: [
          { type: "madnessAffinity", archetype: "unhinged", points: 5 },
          { type: "queueTicker", text: "HOA COMPLAINT IGNORED — Second letter sent. Third letter also ignored. Fourth letter returned with equations on the back." },
        ],
      },
    ],
  },

  {
    id: "suspicious_delivery",
    title: "The Suspicious Delivery",
    body: "A package sits on your doorstep. You definitely didn't order it. The return address just says \"SCIENCE\" in block letters. It's warm to the touch and faintly vibrating.",
    trigger: { type: "totalRPAllTime", amount: 5000 },
    choices: [
      {
        label: "Open It Carefully",
        description: "+500 RP",
        outcomes: [
          { type: "rpBonus", amount: 500 },
          { type: "queueTicker", text: "MYSTERIOUS PACKAGE CONTAINED RESEARCH EQUIPMENT — \"I didn't order it, but I'm keeping it,\" says local man." },
        ],
      },
      {
        label: "Scan It First",
        description: "+3 Perfectionist, +2x server production for 1 minute",
        outcomes: [
          { type: "madnessAffinity", archetype: "perfectionist", points: 3 },
          { type: "productionBuff", target: "server", multiplier: 2, durationSec: 60 },
        ],
      },
      {
        label: "Open It Immediately",
        description: "+5 Accidental Genius, +2000 RP",
        outcomes: [
          { type: "madnessAffinity", archetype: "accidentalGenius", points: 5 },
          { type: "rpBonus", amount: 2000 },
          { type: "queueTicker", text: "SMALL EXPLOSION ON ELM STREET — Homeowner describes contents of package as \"helpful.\"" },
        ],
      },
    ],
  },

  {
    id: "lindas_question",
    title: "Linda's Question",
    body: "Linda stands in the garage doorway, arms crossed, wearing The Look. \"Gary. What are you building?\" A fair question. The garage has four different research stations now. You realize you don't have a simple answer.",
    trigger: { type: "generatorCount", count: 4 },
    choices: [
      {
        label: "Tell Her the Truth",
        description: "+3 Perfectionist, new lab note",
        outcomes: [
          { type: "madnessAffinity", archetype: "perfectionist", points: 3 },
          { type: "unlockNote", noteId: "event_linda_truth" },
        ],
      },
      {
        label: "Deflect With Humor",
        description: "+2 Accidental Genius, +30s of current production",
        outcomes: [
          { type: "madnessAffinity", archetype: "accidentalGenius", points: 2 },
          { type: "rpMultSeconds", seconds: 30 },
        ],
      },
      {
        label: "\"You Wouldn't Understand\"",
        description: "+4 Megalomaniac",
        outcomes: [
          { type: "madnessAffinity", archetype: "megalomaniac", points: 4 },
          { type: "queueTicker", text: "LOCAL WIFE UNIMPRESSED — \"He said I 'wouldn't understand.' I understand he hasn't done the dishes.\"" },
        ],
      },
    ],
  },

  // ── Mid Game ──────────────────────────────────────────────────────

  {
    id: "maxs_science_fair",
    title: "Max's Science Fair",
    body: "Max bursts into the garage holding a crumpled permission slip. \"Dad! Science fair is next week! Can you help me build something?\" He's looking at the prototype machine with the kind of ambition that concerns you. Or excites you. Hard to tell these days.",
    trigger: { type: "generatorOwned", genId: "prototype", count: 5 },
    choices: [
      {
        label: "Help Him Build Something Age-Appropriate",
        description: "+3 Perfectionist, new lab note",
        outcomes: [
          { type: "madnessAffinity", archetype: "perfectionist", points: 3 },
          { type: "unlockNote", noteId: "event_max_science_fair" },
          { type: "queueTicker", text: "LOCAL KID WINS SCIENCE FAIR — Judges impressed by baking soda volcano. \"Suspiciously perfect lava flow,\" notes one judge." },
        ],
      },
      {
        label: "Build It FOR Him",
        description: "+5x prototype production for 90s, +4 Unhinged",
        outcomes: [
          { type: "productionBuff", target: "prototype", multiplier: 5, durationSec: 90 },
          { type: "madnessAffinity", archetype: "unhinged", points: 4 },
          { type: "queueTicker", text: "SCIENCE FAIR EVACUATED — 11-year-old's project \"exceeded expectations.\" Fire department dispatched as precaution." },
        ],
      },
      {
        label: "\"Just Use the Containment Chamber\"",
        description: "+3 Megalomaniac, +3 Unhinged",
        outcomes: [
          { type: "madnessAffinity", archetype: "megalomaniac", points: 3 },
          { type: "madnessAffinity", archetype: "unhinged", points: 3 },
          { type: "queueTicker", text: "SCHOOL BOARD MEETING CALLED — Topic: \"Should fifth graders have access to containment technology?\" Vote: unanimous no." },
        ],
      },
    ],
  },

  {
    id: "power_bill",
    title: "The Power Bill",
    body: "The electric bill arrived. Linda is holding it at arm's length like it might bite. The number has a comma in it now. Two commas, actually. The power company included a personal note: \"Are you okay?\"",
    trigger: { type: "generatorOwned", genId: "server", count: 20 },
    choices: [
      {
        label: "Pay It Normally",
        description: "-5% of current RP",
        outcomes: [
          { type: "rpCost", percent: 5 },
          { type: "queueTicker", text: "RECORD ELECTRIC BILL PAID IN FULL — Power company sends thank-you card. And a structural engineer." },
        ],
      },
      {
        label: "\"Optimize\" the Meter",
        description: "+5 Unhinged, +2x all production for 1 minute",
        outcomes: [
          { type: "madnessAffinity", archetype: "unhinged", points: 5 },
          { type: "productionBuff", target: "all", multiplier: 2, durationSec: 60 },
          { type: "queueTicker", text: "POWER METER SPINNING BACKWARDS — Utility company \"very confused\" but also \"kind of impressed.\"" },
        ],
      },
      {
        label: "Build Your Own Generator",
        description: "+4 Gadgeteer, new lab note",
        outcomes: [
          { type: "madnessAffinity", archetype: "gadgeteer", points: 4 },
          { type: "unlockNote", noteId: "event_power_generator" },
          { type: "queueTicker", text: "OFF-GRID GARAGE GENERATES OWN POWER — Neighboring houses report \"free electricity\" and \"occasional sparks.\"" },
        ],
      },
    ],
  },

  {
    id: "dougs_lawnmower",
    title: "Doug's Lawnmower",
    body: "Doug Henderson is standing in your driveway, defeated. His lawnmower won't start. He's tried everything (pulling the cord and swearing). He looks at your garage — at the equipment visible through the open door — and swallows his pride. \"Gary... could you take a look at this?\"",
    trigger: { type: "generatorOwned", genId: "prototype", count: 10 },
    choices: [
      {
        label: "Fix It Normally",
        description: "+3 Gadgeteer, friendly headline",
        outcomes: [
          { type: "madnessAffinity", archetype: "gadgeteer", points: 3 },
          { type: "queueTicker", text: "NEIGHBORLY GESTURE — Garage scientist fixes lawnmower in under 30 seconds. \"He didn't even look at it,\" says Doug. \"He just TOUCHED it.\"" },
        ],
      },
      {
        label: "\"Improve\" It",
        description: "+5 Gadgeteer, +3 Unhinged",
        outcomes: [
          { type: "madnessAffinity", archetype: "gadgeteer", points: 5 },
          { type: "madnessAffinity", archetype: "unhinged", points: 3 },
          { type: "queueTicker", text: "LAWNMOWER NOW SELF-DRIVING — Doug Henderson's lawn \"perfect\" but he \"didn't ask for this.\" Mower refuses to stop." },
        ],
      },
      {
        label: "\"I'm Busy\"",
        description: "+2 Megalomaniac, +60s of current production",
        outcomes: [
          { type: "madnessAffinity", archetype: "megalomaniac", points: 2 },
          { type: "rpMultSeconds", seconds: 60 },
        ],
      },
    ],
  },

  {
    id: "university_offer",
    title: "The University Offer",
    body: "A letter on university letterhead. They've seen your data — someone posted it on a physics forum. They're offering a visiting researcher position. Part-time. \"Flexible hours.\" They included a parking pass, which feels optimistic.",
    trigger: { type: "totalRPAllTime", amount: 1e6 },
    choices: [
      {
        label: "Accept Part-Time",
        description: "+2x all production for 2 minutes, +3 Perfectionist",
        outcomes: [
          { type: "productionBuff", target: "all", multiplier: 2, durationSec: 120 },
          { type: "madnessAffinity", archetype: "perfectionist", points: 3 },
          { type: "queueTicker", text: "LOCAL MAN ACCEPTS UNIVERSITY POSITION — Commutes in cargo shorts. \"He's technically brilliant,\" says dean. \"Emphasis on technically.\"" },
        ],
      },
      {
        label: "Decline Politely",
        description: "+4 Megalomaniac, +5000 RP",
        outcomes: [
          { type: "madnessAffinity", archetype: "megalomaniac", points: 4 },
          { type: "rpBonus", amount: 5000 },
          { type: "queueTicker", text: "UNIVERSITY OFFER DECLINED — \"My garage has better equipment,\" says local man. University unable to dispute this." },
        ],
      },
      {
        label: "Counter-Offer: Buy the Department",
        description: "+6 Megalomaniac",
        outcomes: [
          { type: "madnessAffinity", archetype: "megalomaniac", points: 6 },
          { type: "queueTicker", text: "UNIVERSITY RECEIVES COUNTER-OFFER — Local man proposes \"hostile academic takeover.\" Board of trustees \"intrigued but frightened.\"" },
        ],
      },
    ],
  },

  // ── Late-Mid Game ─────────────────────────────────────────────────

  {
    id: "weird_noise",
    title: "The Weird Noise",
    body: "There's a sound coming from the collider. Not a mechanical sound — more like a tone you feel in your teeth. The cat left three hours ago and hasn't come back. The water in your coffee mug is vibrating in a pattern that looks almost like letters.",
    trigger: { type: "generatorOwned", genId: "collider", count: 5 },
    choices: [
      {
        label: "Investigate Scientifically",
        description: "+3 Perfectionist, +2x collider production for 90s",
        outcomes: [
          { type: "madnessAffinity", archetype: "perfectionist", points: 3 },
          { type: "productionBuff", target: "collider", multiplier: 2, durationSec: 90 },
          { type: "unlockNote", noteId: "event_weird_noise" },
        ],
      },
      {
        label: "Tune It Like an Instrument",
        description: "+4 Accidental Genius, new lab note",
        outcomes: [
          { type: "madnessAffinity", archetype: "accidentalGenius", points: 4 },
          { type: "unlockNote", noteId: "event_collider_music" },
          { type: "queueTicker", text: "STRANGE MUSIC REPORTED — Neighbors describe melody as \"beautiful\" and \"deeply unsettling\" and \"coming from underground.\"" },
        ],
      },
      {
        label: "Crank It Up",
        description: "+6 Reality Breaker, +3 Unhinged",
        outcomes: [
          { type: "madnessAffinity", archetype: "realityBreaker", points: 6 },
          { type: "madnessAffinity", archetype: "unhinged", points: 3 },
          { type: "queueTicker", text: "SEISMOGRAPH REGISTERS ANOMALY — Source: suburban garage. USGS: \"That's not an earthquake. We don't know WHAT that is.\"" },
        ],
      },
    ],
  },

  {
    id: "agent_reeves",
    title: "Agent Reeves Knocks",
    body: "A man in a dark suit is at your front door. He shows a badge — something federal, you didn't catch which agency. \"Mr. Flemming? We've received some... unusual readings from this address. Mind if I ask a few questions?\" Behind him, a black sedan idles with two more agents inside.",
    trigger: { type: "generatorOwned", genId: "containment", count: 15 },
    choices: [
      {
        label: "Cooperate Fully",
        description: "+3 Perfectionist, -3% RP",
        outcomes: [
          { type: "madnessAffinity", archetype: "perfectionist", points: 3 },
          { type: "rpCost", percent: 3 },
          { type: "queueTicker", text: "FEDERAL INSPECTION CONCLUDES — Agent's report: \"Everything appears to be in order, which is somehow the most alarming outcome.\"" },
        ],
      },
      {
        label: "Give Him the Full Tour",
        description: "+5 Megalomaniac, +2x all production for 1 minute",
        outcomes: [
          { type: "madnessAffinity", archetype: "megalomaniac", points: 5 },
          { type: "productionBuff", target: "all", multiplier: 2, durationSec: 60 },
          { type: "unlockNote", noteId: "event_reeves_tour" },
          { type: "queueTicker", text: "FEDERAL AGENT REQUESTS TRANSFER — Cited \"existential distress\" after touring suburban garage. Currently on administrative leave." },
        ],
      },
      {
        label: "\"Would You Like to See the Collider?\"",
        description: "+8 Reality Breaker",
        outcomes: [
          { type: "madnessAffinity", archetype: "realityBreaker", points: 8 },
          { type: "queueTicker", text: "CLASSIFIED INCIDENT AT SUBURBAN ADDRESS — Details redacted. Agent's final report was one sentence: \"He showed me the collider.\"" },
        ],
      },
    ],
  },

  {
    id: "lindas_ultimatum",
    title: "Linda's Ultimatum",
    body: "Linda is sitting at the kitchen table. No humor in her eyes this time. \"Gary, we need to talk.\" She gestures at the garage door, which is glowing faintly. \"It's the garage or me.\" A long pause. \"And before you answer, the garage just blinked.\"",
    trigger: { type: "madnessLevel", level: 5 },
    choices: [
      {
        label: "Promise to Dial It Back",
        description: "Reduce dominant archetype by 10 points, new lab note",
        outcomes: [
          { type: "madnessAffinity", archetype: "megalomaniac", points: -2 },
          { type: "madnessAffinity", archetype: "perfectionist", points: -2 },
          { type: "madnessAffinity", archetype: "unhinged", points: -2 },
          { type: "madnessAffinity", archetype: "realityBreaker", points: -2 },
          { type: "madnessAffinity", archetype: "gadgeteer", points: -2 },
          { type: "madnessAffinity", archetype: "accidentalGenius", points: -2 },
          { type: "unlockNote", noteId: "event_linda_promise" },
        ],
      },
      {
        label: "Build Her a Lab Too",
        description: "+4 Megalomaniac, +3 Gadgeteer, +3x all production for 1 minute",
        outcomes: [
          { type: "madnessAffinity", archetype: "megalomaniac", points: 4 },
          { type: "madnessAffinity", archetype: "gadgeteer", points: 3 },
          { type: "productionBuff", target: "all", multiplier: 3, durationSec: 60 },
          { type: "unlockNote", noteId: "event_linda_lab" },
          { type: "queueTicker", text: "SECOND GARAGE CONVERTED TO LABORATORY — \"Now it's a family activity,\" says Mrs. Flemming. \"I hate that he was right.\"" },
        ],
      },
      {
        label: "\"What If the Garage IS the House?\"",
        description: "+8 Reality Breaker, +3 Unhinged",
        outcomes: [
          { type: "madnessAffinity", archetype: "realityBreaker", points: 8 },
          { type: "madnessAffinity", archetype: "unhinged", points: 3 },
          { type: "queueTicker", text: "LOCAL HOUSE NOW 90% GARAGE — Building inspector: \"The kitchen is technically still there. It's just... inside the collider room now.\"" },
        ],
      },
    ],
  },

  // ── Late Game ─────────────────────────────────────────────────────

  {
    id: "the_breakthrough",
    title: "The Breakthrough",
    body: "You've done it. At 3:47 AM on a Tuesday, surrounded by empty coffee cups and blinking equipment, you accidentally solved a fundamental problem in physics. The Reality Engine is showing readings that shouldn't be possible. You're holding a notebook page that could change the world. Your hand is shaking. Also, you're still in your bathrobe.",
    trigger: { type: "generatorOwned", genId: "reality", count: 5 },
    choices: [
      {
        label: "Publish It",
        description: "+50,000 RP, +5 Perfectionist",
        outcomes: [
          { type: "rpBonus", amount: 50000 },
          { type: "madnessAffinity", archetype: "perfectionist", points: 5 },
          { type: "queueTicker", text: "GARAGE SCIENTIST PUBLISHES PAPER — Peer reviewers: \"This is either the discovery of the century or the most elaborate prank in academic history.\"" },
        ],
      },
      {
        label: "Keep It Secret",
        description: "+5 Megalomaniac, +3x reality production for 2 minutes",
        outcomes: [
          { type: "madnessAffinity", archetype: "megalomaniac", points: 5 },
          { type: "productionBuff", target: "reality", multiplier: 3, durationSec: 120 },
          { type: "queueTicker", text: "PHYSICS COMMUNITY SENSES DISTURBANCE — \"Someone has solved it. We can feel it. They're NOT SHARING.\"" },
        ],
      },
      {
        label: "Use It to Break More Physics",
        description: "+8 Reality Breaker, new lab note",
        outcomes: [
          { type: "madnessAffinity", archetype: "realityBreaker", points: 8 },
          { type: "unlockNote", noteId: "event_break_physics" },
          { type: "queueTicker", text: "LAWS OF THERMODYNAMICS FILE JOINT COMPLAINT — \"We've been very patient but this is getting ridiculous.\"" },
        ],
      },
    ],
  },

  {
    id: "max_wants_to_help",
    title: "Max Wants to Help",
    body: "Max is standing at the edge of the Mind-Link Array, eyes wide with wonder. \"Dad, I want to try it.\" He's eleven. He's wearing his school backpack. He is absolutely serious. Behind him, the array pulses invitingly.",
    trigger: { type: "generatorOwned", genId: "mindlink", count: 10 },
    choices: [
      {
        label: "Absolutely Not",
        description: "+3 Perfectionist, new lab note",
        outcomes: [
          { type: "madnessAffinity", archetype: "perfectionist", points: 3 },
          { type: "unlockNote", noteId: "event_max_refused" },
        ],
      },
      {
        label: "Limited, Supervised Tests",
        description: "+4 Accidental Genius, +2x mindlink production for 90s",
        outcomes: [
          { type: "madnessAffinity", archetype: "accidentalGenius", points: 4 },
          { type: "productionBuff", target: "mindlink", multiplier: 2, durationSec: 90 },
          { type: "queueTicker", text: "11-YEAR-OLD COMPLETES MIND-LINK TEST — Results: \"inconclusive but he can do long division in his head now.\"" },
        ],
      },
      {
        label: "Full Integration",
        description: "+6 Unhinged, +5 Megalomaniac",
        outcomes: [
          { type: "madnessAffinity", archetype: "unhinged", points: 6 },
          { type: "madnessAffinity", archetype: "megalomaniac", points: 5 },
          { type: "queueTicker", text: "CHILD PRODIGY EMERGES — Max Flemming now speaks three languages he never learned. \"Dad's project is COOL,\" he reports." },
        ],
      },
    ],
  },

  {
    id: "neighborhood_effect",
    title: "The Neighborhood Effect",
    body: "Doug is at your door again, but he's not angry this time. He's confused. \"Gary... my roses are blooming. In December. And they're BLUE.\" You look past him. The streetlights are bending slightly toward your garage. A jogger runs past at what appears to be 1.3x normal speed.",
    trigger: { type: "generatorOwned", genId: "cosmic", count: 5 },
    choices: [
      {
        label: "Contain It",
        description: "+5 Perfectionist, -5% RP",
        outcomes: [
          { type: "madnessAffinity", archetype: "perfectionist", points: 5 },
          { type: "rpCost", percent: 5 },
          { type: "queueTicker", text: "REALITY STABILIZED ON ELM STREET — Roses return to normal color. Jogger returns to normal speed. Both seem disappointed." },
        ],
      },
      {
        label: "Let It Spread",
        description: "+6 Reality Breaker, +3x all production for 90s",
        outcomes: [
          { type: "madnessAffinity", archetype: "realityBreaker", points: 6 },
          { type: "productionBuff", target: "all", multiplier: 3, durationSec: 90 },
          { type: "queueTicker", text: "NEIGHBORHOOD ENTERS \"ENHANCED STATE\" — Property values skyrocket. Cats now slightly transparent. Residents: \"We're fine with it.\"" },
        ],
      },
      {
        label: "Focus It Into the Lab",
        description: "+5 Gadgeteer, +5x cosmic production for 60s",
        outcomes: [
          { type: "madnessAffinity", archetype: "gadgeteer", points: 5 },
          { type: "productionBuff", target: "cosmic", multiplier: 5, durationSec: 60 },
          { type: "queueTicker", text: "GARAGE NOW VISIBLE FROM SPACE — \"It's not the light,\" says NASA. \"It's the ABSENCE of darkness. Those are different things.\"" },
        ],
      },
    ],
  },

  // ── Prestige-Gated ────────────────────────────────────────────────

  {
    id: "the_snap",
    title: "The Snap",
    body: "It happens at dawn. You're holding a coffee mug — your favorite one, the one that says \"World's Okayest Scientist\" — and you see yourself reflected in the dark liquid. Just for a second, you recognize the person you used to be. Normal Gary. Khaki Gary. The one who mowed lawns and watched football. The clarity is blinding. Everything you've built... everything you've BECOME... you see it all at once.",
    trigger: { type: "prestigeCount", count: 2 },
    choices: [
      {
        label: "Hold Onto This Feeling",
        description: "Reduce all affinities by 3, reflective lab note",
        outcomes: [
          { type: "madnessAffinity", archetype: "megalomaniac", points: -3 },
          { type: "madnessAffinity", archetype: "perfectionist", points: -3 },
          { type: "madnessAffinity", archetype: "unhinged", points: -3 },
          { type: "madnessAffinity", archetype: "realityBreaker", points: -3 },
          { type: "madnessAffinity", archetype: "gadgeteer", points: -3 },
          { type: "madnessAffinity", archetype: "accidentalGenius", points: -3 },
          { type: "unlockNote", noteId: "event_the_snap" },
        ],
      },
      {
        label: "Push Through It",
        description: "+5 to dominant archetype, +3x click for 2 minutes",
        outcomes: [
          { type: "madnessAffinity", archetype: "megalomaniac", points: 1 },
          { type: "madnessAffinity", archetype: "unhinged", points: 1 },
          { type: "madnessAffinity", archetype: "realityBreaker", points: 1 },
          { type: "madnessAffinity", archetype: "gadgeteer", points: 1 },
          { type: "madnessAffinity", archetype: "accidentalGenius", points: 1 },
          { type: "clickBuff", multiplier: 3, durationSec: 120 },
        ],
      },
      {
        label: "Embrace It",
        description: "+8 Unhinged, +4 Reality Breaker",
        outcomes: [
          { type: "madnessAffinity", archetype: "unhinged", points: 8 },
          { type: "madnessAffinity", archetype: "realityBreaker", points: 4 },
          { type: "queueTicker", text: "LOCAL MAN SEEN LAUGHING AT SUNRISE — Neighbors report \"a look of terrifying peace.\" Dogs in the area began howling simultaneously." },
        ],
      },
    ],
  },

  {
    id: "dougs_investment",
    title: "Doug's Investment Proposal",
    body: "You find a business card slipped under the garage door. It reads: \"HENDERSON VENTURES — Investing in the Future (Terms Negotiable).\" On the back, in Doug's handwriting: \"Gary, I've seen what you can do. I have savings. Let's talk.\" This is the same man who filed three HOA complaints about you.",
    trigger: { type: "prestigeCount", count: 3 },
    choices: [
      {
        label: "Accept the Funding",
        description: "+120s of current production as RP",
        outcomes: [
          { type: "rpMultSeconds", seconds: 120 },
          { type: "queueTicker", text: "LOCAL MAN RECEIVES ANGEL INVESTMENT — Source: neighbor who previously filed noise complaints. \"I'm hedging my bets,\" says Doug Henderson." },
        ],
      },
      {
        label: "Make Him a Partner",
        description: "+4 Accidental Genius, new lab note",
        outcomes: [
          { type: "madnessAffinity", archetype: "accidentalGenius", points: 4 },
          { type: "unlockNote", noteId: "event_doug_partner" },
          { type: "queueTicker", text: "FLEMMING-HENDERSON LABS INCORPORATED — \"I handle the business side,\" says Doug. \"I handle the science side,\" says Gary. Neither is qualified for their role." },
        ],
      },
      {
        label: "Show Him What Money Can't Buy",
        description: "+5 Reality Breaker, +4 Megalomaniac",
        outcomes: [
          { type: "madnessAffinity", archetype: "realityBreaker", points: 5 },
          { type: "madnessAffinity", archetype: "megalomaniac", points: 4 },
          { type: "queueTicker", text: "NEIGHBOR RETURNS FROM GARAGE VISIT \"CHANGED\" — Doug Henderson seen staring at sky for 3 hours. \"He showed me the loom,\" he whispered." },
        ],
      },
    ],
  },
  // ── Research & Lab Events ─────────────────────────────────────────

  {
    id: "research_overload",
    title: "Information Overload",
    body: "The corkboard has run out of space. Strings connect ideas across three walls, the ceiling, and part of the floor. You can't walk to the bathroom without stepping over a hypothesis. Linda calls it a fire hazard. You call it a knowledge topology.",
    trigger: { type: "labLevel", level: 1 },
    choices: [
      {
        label: "Organize Everything",
        description: "+4 Perfectionist, +2x research speed for 2 minutes",
        outcomes: [
          { type: "madnessAffinity", archetype: "perfectionist", points: 4 },
          { type: "productionBuff", target: "all", multiplier: 2, durationSec: 120 },
          { type: "queueTicker", text: "CORKBOARD REORGANIZATION COMPLETE — Took 14 hours. Two new breakthroughs discovered during filing." },
        ],
      },
      {
        label: "Add More Corkboard",
        description: "+3 Gadgeteer, +3 Megalomaniac",
        outcomes: [
          { type: "madnessAffinity", archetype: "gadgeteer", points: 3 },
          { type: "madnessAffinity", archetype: "megalomaniac", points: 3 },
          { type: "queueTicker", text: "CORKBOARD EXPANSION — Garage walls now 90% cork. Structural integrity: \"technically fine.\"" },
        ],
      },
      {
        label: "Digitize It (Ask Gerald)",
        description: "+5 Gadgeteer, +3x server production for 90s",
        outcomes: [
          { type: "madnessAffinity", archetype: "gadgeteer", points: 5 },
          { type: "productionBuff", target: "server", multiplier: 3, durationSec: 90 },
          { type: "queueTicker", text: "RESEARCH DIGITIZED — Gerald now manages the corkboard. Has opinions about string color coding." },
        ],
      },
    ],
  },

  {
    id: "lab_inspection",
    title: "The Inspection",
    body: "A building inspector is at the door. Someone reported 'unauthorized underground construction.' He has a clipboard and a flashlight. The flashlight won't help him where you've built, but he doesn't know that yet.",
    trigger: { type: "labLevel", level: 2 },
    choices: [
      {
        label: "Show the Permits (Fabricate Quickly)",
        description: "+3 Accidental Genius, -2% RP",
        outcomes: [
          { type: "madnessAffinity", archetype: "accidentalGenius", points: 3 },
          { type: "rpCost", percent: 2 },
          { type: "queueTicker", text: "BUILDING INSPECTION PASSED — Inspector notes: \"Paperwork appears to be in order. Building appears to defy physics.\"" },
        ],
      },
      {
        label: "Give Him the Full Tour",
        description: "+5 Megalomaniac, +2x all production for 90s",
        outcomes: [
          { type: "madnessAffinity", archetype: "megalomaniac", points: 5 },
          { type: "productionBuff", target: "all", multiplier: 2, durationSec: 90 },
          { type: "queueTicker", text: "BUILDING INSPECTOR CHANGES CAREERS — Now pursuing physics degree. \"He showed me something I can't unsee.\"" },
          { type: "unlockNote", noteId: "event_inspector_tour" },
        ],
      },
      {
        label: "Bribe Him With Science",
        description: "+4 Unhinged, +3 Gadgeteer",
        outcomes: [
          { type: "madnessAffinity", archetype: "unhinged", points: 4 },
          { type: "madnessAffinity", archetype: "gadgeteer", points: 3 },
          { type: "queueTicker", text: "INSPECTOR'S FLASHLIGHT NOW PROJECTS HOLOGRAMS — \"I don't remember authorizing this upgrade,\" he says, fascinated." },
        ],
      },
    ],
  },

  {
    id: "underground_discovery",
    title: "Something Below",
    body: "While excavating the third underground level, the drill hit something. Not rock — something that hummed back. The construction crew left immediately. The humming hasn't stopped. It sounds almost like... recognition. Like the earth was waiting to be found.",
    trigger: { type: "labLevel", level: 3 },
    choices: [
      {
        label: "Investigate Carefully",
        description: "+5 Perfectionist, +50,000 RP, new lab note",
        outcomes: [
          { type: "madnessAffinity", archetype: "perfectionist", points: 5 },
          { type: "rpBonus", amount: 50000 },
          { type: "unlockNote", noteId: "event_underground_find" },
          { type: "queueTicker", text: "UNDERGROUND DISCOVERY — Nature of find: classified. Gary's expression: \"profoundly unsurprised.\"" },
        ],
      },
      {
        label: "Integrate It Into the Lab",
        description: "+6 Reality Breaker, +5x all production for 60s",
        outcomes: [
          { type: "madnessAffinity", archetype: "realityBreaker", points: 6 },
          { type: "productionBuff", target: "all", multiplier: 5, durationSec: 60 },
          { type: "queueTicker", text: "UNDERGROUND ANOMALY NOW POWERS LAB — Free energy. Gary acts like this is normal. It is not normal." },
        ],
      },
      {
        label: "Talk to It",
        description: "+8 Reality Breaker, +4 Accidental Genius",
        outcomes: [
          { type: "madnessAffinity", archetype: "realityBreaker", points: 8 },
          { type: "madnessAffinity", archetype: "accidentalGenius", points: 4 },
          { type: "queueTicker", text: "GARY HAVING CONVERSATION WITH BEDROCK — Duration: 3 hours. Topic: \"Everything.\" Outcome: \"Mutually beneficial understanding.\"" },
        ],
      },
    ],
  },

  // ── Challenge Events ──────────────────────────────────────────────

  {
    id: "challenge_rival",
    title: "The Rival",
    body: "A letter arrives from another garage scientist across town. Dr. Sarah Kowalski. She claims to have completed the same challenges faster. She's enclosed her times. They're... impressive. She's also enclosed a photo of her corkboard. It's VERY organized.",
    trigger: { type: "challengesCompleted", count: 3 },
    choices: [
      {
        label: "Accept the Rivalry",
        description: "+3 Perfectionist, +3 Megalomaniac, +3x click for 2 minutes",
        outcomes: [
          { type: "madnessAffinity", archetype: "perfectionist", points: 3 },
          { type: "madnessAffinity", archetype: "megalomaniac", points: 3 },
          { type: "clickBuff", multiplier: 3, durationSec: 120 },
          { type: "queueTicker", text: "GARAGE SCIENTIST RIVALRY — Two suburban labs compete for \"fastest prestige.\" Neighbors caught in crossfire of science." },
        ],
      },
      {
        label: "Invite Her Over",
        description: "+5 Accidental Genius, +100,000 RP",
        outcomes: [
          { type: "madnessAffinity", archetype: "accidentalGenius", points: 5 },
          { type: "rpBonus", amount: 100000 },
          { type: "queueTicker", text: "RIVAL SCIENTISTS COLLABORATE — Combined output exceeds both labs individually. \"Synergy,\" says one. \"Showing off,\" says the other." },
        ],
      },
      {
        label: "\"I Don't Have Rivals\"",
        description: "+6 Megalomaniac",
        outcomes: [
          { type: "madnessAffinity", archetype: "megalomaniac", points: 6 },
          { type: "queueTicker", text: "LETTER RETURNED — Stamped with \"NO PEER EXISTS.\" Stamp appears to be custom-made. Postal service concerned." },
        ],
      },
    ],
  },

  {
    id: "speed_demon_aftermath",
    title: "After the Speed Run",
    body: "You just completed a challenge run in record time. Everything happened so fast. The generators, the upgrades, the prestige — all compressed into minutes instead of hours. Your hands are shaking. The coffee mug is empty. Linda says you've been 'in the zone' for five hours but it felt like fifteen minutes.",
    trigger: { type: "challengesCompleted", count: 5 },
    choices: [
      {
        label: "Take a Break",
        description: "Reduce all affinities by 2, +2x offline production for 5 minutes",
        outcomes: [
          { type: "madnessAffinity", archetype: "megalomaniac", points: -2 },
          { type: "madnessAffinity", archetype: "perfectionist", points: -2 },
          { type: "madnessAffinity", archetype: "unhinged", points: -2 },
          { type: "madnessAffinity", archetype: "realityBreaker", points: -2 },
          { type: "madnessAffinity", archetype: "gadgeteer", points: -2 },
          { type: "madnessAffinity", archetype: "accidentalGenius", points: -2 },
          { type: "queueTicker", text: "SCIENTIST TAKES NAP — First voluntary rest in weeks. Lab continues running autonomously. Gerald handles things." },
        ],
      },
      {
        label: "Immediately Do Another",
        description: "+5 Unhinged, +5x click for 60s",
        outcomes: [
          { type: "madnessAffinity", archetype: "unhinged", points: 5 },
          { type: "clickBuff", multiplier: 5, durationSec: 60 },
          { type: "queueTicker", text: "ANOTHER CHALLENGE STARTED IMMEDIATELY — Linda: \"He hasn't blinked in six hours.\" Gary: \"Blinking is inefficient.\"" },
        ],
      },
      {
        label: "Optimize the Process",
        description: "+4 Perfectionist, +3 Gadgeteer",
        outcomes: [
          { type: "madnessAffinity", archetype: "perfectionist", points: 4 },
          { type: "madnessAffinity", archetype: "gadgeteer", points: 3 },
          { type: "queueTicker", text: "CHALLENGE RUN ANALYZED — 47-page report on \"Optimal Prestige Velocity.\" Peer review: pending (no peers)." },
        ],
      },
    ],
  },

  // ── Neighborhood Events ───────────────────────────────────────────

  {
    id: "block_party",
    title: "The Block Party",
    body: "Doug organized a block party. Everyone's invited — even you. Especially you, actually. He made a point of saying 'Gary, please come. WITHOUT any equipment.' Mrs. Patterson is bringing cookies. Professor Chen is bringing 'a colleague who'd love to meet you.' Agent Reeves is parked down the street, watching.",
    trigger: { type: "labLevel", level: 2 },
    choices: [
      {
        label: "Attend Normally",
        description: "+3 Perfectionist, friendly ticker",
        outcomes: [
          { type: "madnessAffinity", archetype: "perfectionist", points: 3 },
          { type: "queueTicker", text: "BLOCK PARTY A SUCCESS — Gary attended without incident. Duration: 47 minutes. Record for social normalcy." },
          { type: "unlockNote", noteId: "event_block_party_normal" },
        ],
      },
      {
        label: "Bring a \"Party Enhancement\"",
        description: "+5 Gadgeteer, +3 Unhinged, +2x all for 90s",
        outcomes: [
          { type: "madnessAffinity", archetype: "gadgeteer", points: 5 },
          { type: "madnessAffinity", archetype: "unhinged", points: 3 },
          { type: "productionBuff", target: "all", multiplier: 2, durationSec: 90 },
          { type: "queueTicker", text: "BLOCK PARTY ENHANCED — Gary's \"music speaker\" creates localized aurora borealis. Best party on the block. Ever." },
        ],
      },
      {
        label: "Host It at the Lab",
        description: "+6 Megalomaniac, +3x all for 60s",
        outcomes: [
          { type: "madnessAffinity", archetype: "megalomaniac", points: 6 },
          { type: "productionBuff", target: "all", multiplier: 3, durationSec: 60 },
          { type: "queueTicker", text: "BLOCK PARTY RELOCATED TO LAB — Neighbors now understand Gary's work. Some wish they didn't. All impressed." },
        ],
      },
    ],
  },

  {
    id: "mrs_patterson_secret",
    title: "Mrs. Patterson's Secret",
    body: "Mrs. Patterson invites you over for tea. Her kitchen is immaculate, her cookies are perfect, and on her kitchen table is a well-worn copy of 'Advanced Quantum Mechanics' with marginal notes in her handwriting. She sees you looking. 'Oh, that old thing,' she says, adjusting her glasses. 'I was at Fermilab in the 70s. Before the cookies.'",
    trigger: { type: "relationshipLevel", npcId: "patterson", level: 7 },
    choices: [
      {
        label: "Ask About Her Research",
        description: "+5 Perfectionist, +200,000 RP, new lab note",
        outcomes: [
          { type: "madnessAffinity", archetype: "perfectionist", points: 5 },
          { type: "rpBonus", amount: 200000 },
          { type: "unlockNote", noteId: "event_patterson_past" },
          { type: "queueTicker", text: "MRS. PATTERSON REVEALS PHD IN PHYSICS — Specialized in particle containment. \"The cookies are better,\" she says." },
        ],
      },
      {
        label: "Invite Her to Collaborate",
        description: "+4 Accidental Genius, +5x prototype production for 120s",
        outcomes: [
          { type: "madnessAffinity", archetype: "accidentalGenius", points: 4 },
          { type: "productionBuff", target: "prototype", multiplier: 5, durationSec: 120 },
          { type: "queueTicker", text: "RETIRED PHYSICIST JOINS GARAGE LAB — Contributions: \"profound.\" Cookie quality: \"unchanged.\"" },
        ],
      },
      {
        label: "\"Why Didn't You Tell Me Sooner?\"",
        description: "+3 Megalomaniac, +3 Reality Breaker",
        outcomes: [
          { type: "madnessAffinity", archetype: "megalomaniac", points: 3 },
          { type: "madnessAffinity", archetype: "realityBreaker", points: 3 },
          { type: "queueTicker", text: "\"EVERYONE ON THIS STREET IS A SCIENTIST\" — Gary begins suspecting the entire neighborhood. Not entirely wrong." },
        ],
      },
    ],
  },

  {
    id: "reeves_classified",
    title: "Agent Reeves Goes Off-Book",
    body: "Agent Reeves shows up at midnight. No suit. No badge. He's holding a USB drive. 'There's a facility in Nevada,' he says. 'They've been trying to do what you're doing. For sixty years. With a billion-dollar budget.' He hands you the drive. 'They failed. This is everything they learned. I thought you should have it.'",
    trigger: { type: "relationshipLevel", npcId: "reeves", level: 8 },
    choices: [
      {
        label: "Accept and Review",
        description: "+500,000 RP, +5 Perfectionist",
        outcomes: [
          { type: "rpBonus", amount: 500000 },
          { type: "madnessAffinity", archetype: "perfectionist", points: 5 },
          { type: "queueTicker", text: "CLASSIFIED DATA REVIEWED — Gary spent 72 hours reading. Conclusion: \"They were close. But they lacked a garage.\"" },
          { type: "unlockNote", noteId: "event_reeves_data" },
        ],
      },
      {
        label: "Send Corrections Back",
        description: "+6 Megalomaniac, +4 Perfectionist",
        outcomes: [
          { type: "madnessAffinity", archetype: "megalomaniac", points: 6 },
          { type: "madnessAffinity", archetype: "perfectionist", points: 4 },
          { type: "queueTicker", text: "CLASSIFIED CORRECTIONS RETURNED — Pentagon receives annotated files. Gary's margin notes: \"Wrong. Wrong. Close. Wrong. LOL.\"" },
        ],
      },
      {
        label: "Destroy It Unread",
        description: "+4 Unhinged, +4 Accidental Genius",
        outcomes: [
          { type: "madnessAffinity", archetype: "unhinged", points: 4 },
          { type: "madnessAffinity", archetype: "accidentalGenius", points: 4 },
          { type: "queueTicker", text: "USB DRIVE DESTROYED — \"I don't need their answers. I have my own questions.\" Agent Reeves: \"I respect that. Terrifying, but respectable.\"" },
        ],
      },
    ],
  },

  // ── Ascension Events ──────────────────────────────────────────────

  {
    id: "pre_ascension",
    title: "The Weight of Knowledge",
    body: "You're standing at the threshold. Everything you've built — the generators, the research, the breakthroughs, the BP, the lab itself — it's all behind you. Ahead is something new. Something bigger. Your thesis. The culmination of everything. But to submit it, you have to let go. Of everything. Again. But this time, what you gain is permanent. This time, the knowledge survives.",
    trigger: { type: "labLevel", level: 3 },
    requiresMadnessLevel: 3,
    choices: [
      {
        label: "\"I'm Ready\"",
        description: "+3 all archetypes, +3x click for 3 minutes",
        outcomes: [
          { type: "madnessAffinity", archetype: "megalomaniac", points: 3 },
          { type: "madnessAffinity", archetype: "perfectionist", points: 3 },
          { type: "madnessAffinity", archetype: "realityBreaker", points: 3 },
          { type: "clickBuff", multiplier: 3, durationSec: 180 },
          { type: "queueTicker", text: "SCIENTIST PREPARES THESIS — Topic encompasses \"all known and unknown science.\" Committee: the universe." },
        ],
      },
      {
        label: "\"Not Yet\"",
        description: "+5 Perfectionist, +3x all production for 2 minutes",
        outcomes: [
          { type: "madnessAffinity", archetype: "perfectionist", points: 5 },
          { type: "productionBuff", target: "all", multiplier: 3, durationSec: 120 },
          { type: "queueTicker", text: "THESIS DELAYED — \"Just a few more experiments. A few more runs. A few more...\" — Gary, for the 40th time." },
        ],
      },
      {
        label: "\"The Universe Should Be Ready for ME\"",
        description: "+8 Megalomaniac, +5x all for 60s",
        outcomes: [
          { type: "madnessAffinity", archetype: "megalomaniac", points: 8 },
          { type: "productionBuff", target: "all", multiplier: 5, durationSec: 60 },
          { type: "queueTicker", text: "THESIS SUBMITTED WITH PREJUDICE — Universe asked for revisions. Gary said no. Universe accepted." },
        ],
      },
    ],
  },

  {
    id: "post_first_ascension",
    title: "After the Thesis",
    body: "You defended your thesis to the universe and the universe said... yes. Everything is different now. Simpler. Clearer. You can see the patterns that were always there — the ones that connect every experiment, every prestige, every mad midnight scribble. The Thesis Points glow in your mind like stars. Linda says you look 'different.' You are different. Better. Still Gary. But more.",
    trigger: { type: "ascensionCount", count: 1 },
    choices: [
      {
        label: "Start Over, Properly",
        description: "+5 Perfectionist, +3x all for 2 minutes",
        outcomes: [
          { type: "madnessAffinity", archetype: "perfectionist", points: 5 },
          { type: "productionBuff", target: "all", multiplier: 3, durationSec: 120 },
          { type: "queueTicker", text: "POST-ASCENSION REBUILD — Gary starts with clarity and purpose. Duration of clarity: approximately 47 minutes." },
        ],
      },
      {
        label: "Savor the Moment",
        description: "+4 Accidental Genius, new lab note",
        outcomes: [
          { type: "madnessAffinity", archetype: "accidentalGenius", points: 4 },
          { type: "unlockNote", noteId: "event_post_ascension" },
          { type: "queueTicker", text: "SCIENTIST SITS QUIETLY IN EMPTY GARAGE — \"It's not empty. It's full of potential.\" Neighbor: \"It looks pretty empty, Gary.\"" },
        ],
      },
      {
        label: "\"Again. FASTER.\"",
        description: "+6 Unhinged, +5x click for 90s",
        outcomes: [
          { type: "madnessAffinity", archetype: "unhinged", points: 6 },
          { type: "clickBuff", multiplier: 5, durationSec: 90 },
          { type: "queueTicker", text: "SECOND RUN BEGINS IMMEDIATELY — \"I haven't even finished celebrating,\" says Linda. Gary is already 47 generators deep." },
        ],
      },
    ],
  },

  {
    id: "cosmic_awareness_event",
    title: "The Thread Between Stars",
    body: "You're standing on the orbital platform, looking down at the Earth. Somewhere below, in a suburb, in a garage that you've rebuilt a hundred times, is where this all started. A notebook. A click. A spark of curiosity. And now you're here, weaving cosmic threads, rewriting the rules of reality, and your son still asks you to help with homework. This is your life. All of it. The sublime and the mundane. The cosmic and the suburban. And somehow, impossibly, they fit together.",
    trigger: { type: "ascensionCount", count: 3 },
    choices: [
      {
        label: "Look Down",
        description: "+4 all archetypes, reflective lab note",
        outcomes: [
          { type: "madnessAffinity", archetype: "megalomaniac", points: 2 },
          { type: "madnessAffinity", archetype: "perfectionist", points: 2 },
          { type: "madnessAffinity", archetype: "accidentalGenius", points: 2 },
          { type: "unlockNote", noteId: "event_cosmic_view" },
          { type: "queueTicker", text: "VIEW FROM ORBIT — Gary sees the whole world. Zooms in on his garage. \"Still the most interesting building on the planet.\"" },
        ],
      },
      {
        label: "Look Up",
        description: "+6 Reality Breaker, +5x cosmic for 2 minutes",
        outcomes: [
          { type: "madnessAffinity", archetype: "realityBreaker", points: 6 },
          { type: "productionBuff", target: "cosmic", multiplier: 5, durationSec: 120 },
          { type: "queueTicker", text: "SCIENTIST LOOKS BEYOND — \"There's more. There's always more. And it's ALL garage-accessible.\"" },
        ],
      },
      {
        label: "Go Home",
        description: "+5 Perfectionist, +3 Accidental Genius, new lab note",
        outcomes: [
          { type: "madnessAffinity", archetype: "perfectionist", points: 5 },
          { type: "madnessAffinity", archetype: "accidentalGenius", points: 3 },
          { type: "unlockNote", noteId: "event_go_home" },
          { type: "queueTicker", text: "GARY RETURNS FROM ORBIT — Makes dinner. Helps Max with math. Normal evening. Garage still glowing. Normal." },
        ],
      },
    ],
  },

  // ── Event-unlocked Lab Notes (referenced by events above) ─────────
  // These notes are triggered by events via unlockNote outcomes.
  // They don't need trigger conditions since they're manually unlocked.

  // ══════════════════════════════════════════════════════════════════════
  // ── SECRET NARRATIVE EVENTS ──────────────────────────────────────────
  // Hidden storyline: Dr. Harold Voss, Project CHRYSALIS, the Elm Street
  // Anomaly, Agent Reeves' protection, Max's awakening, Professor Chen
  // ══════════════════════════════════════════════════════════════════════

  {
    id: "secret_letter_in_wall",
    title: "The Letter in the Wall",
    body: "While expanding into the basement, the sledgehammer cracks through drywall and something falls out — a sealed envelope, yellowed with age, tucked between the studs. It's addressed in careful, shaking handwriting: \"To The Next One.\" The postmark reads 1987. The return address is this house.",
    trigger: { type: "labLevel", level: 1 },
    choices: [
      {
        label: "Read It Immediately",
        description: "+3 Reality Breaker, unlocks hidden note",
        outcomes: [
          { type: "madnessAffinity", archetype: "realityBreaker", points: 3 },
          { type: "unlockNote", noteId: "secret_voss_letter" },
          { type: "queueTicker", text: "LETTER FOUND IN WALL — Addressed to \"The Next One.\" Gary read it twice. Then sat very still for a long time." },
        ],
      },
      {
        label: "Save It for Later",
        description: "+2x all production for 5 minutes (curiosity drives you)",
        outcomes: [
          { type: "productionBuff", target: "all", multiplier: 2, durationSec: 300 },
          { type: "queueTicker", text: "SEALED LETTER PLACED IN DESK DRAWER — Gary keeps glancing at it. Productivity somehow increased. The not-knowing is fuel." },
        ],
      },
      {
        label: "Show It to Patterson",
        description: "Unlocks hidden note + relationship hint",
        outcomes: [
          { type: "unlockNote", noteId: "secret_voss_letter_patterson" },
          { type: "queueTicker", text: "Mrs. Patterson was seen crying on her porch. She held the letter for twenty minutes before giving it back. \"He was a good man,\" she said." },
        ],
      },
    ],
  },

  {
    id: "secret_midnight_visitor",
    title: "Midnight Visitor",
    body: "Someone left a package at your door at 3 AM. No camera caught them — which is strange, because you have seven cameras now. Inside the plain brown box: a USB drive with no label and a faded Polaroid of your garage, taken in 1985. There's a man standing in the doorway you don't recognize. He's smiling. Behind him, something in the garage is glowing.",
    trigger: { type: "generatorOwned", genId: "containment", count: 50 },
    choices: [
      {
        label: "Plug in the USB",
        description: "+1,000 IP worth of data, unlocks hidden note",
        outcomes: [
          { type: "rpBonus", amount: 1000 },
          { type: "unlockNote", noteId: "secret_usb_chrysalis" },
          { type: "queueTicker", text: "USB CONTENTS REVIEWED — 847 files. Most encrypted. The ones that aren't contain equations Gary has never seen. Some he's independently derived." },
        ],
      },
      {
        label: "Analyze the Photo",
        description: "+3 Accidental Genius, unlocks note about Voss",
        outcomes: [
          { type: "madnessAffinity", archetype: "accidentalGenius", points: 3 },
          { type: "unlockNote", noteId: "secret_voss_photo" },
          { type: "queueTicker", text: "POLAROID ANALYZED — Spectral analysis of the glow in the background matches no known light source. The man has been identified: Dr. Harold Voss, PhD. Missing since 1987." },
        ],
      },
      {
        label: "Give Both to Reeves",
        description: "Relationship boost + ticker",
        outcomes: [
          { type: "rpBonus", amount: 500 },
          { type: "queueTicker", text: "EVIDENCE TURNED OVER TO AGENT REEVES — He didn't look surprised. He looked relieved. \"Good. You're not like him. You're smarter than him.\" He wouldn't say who." },
        ],
      },
    ],
  },

  {
    id: "secret_max_nightmare",
    title: "Max's Nightmare",
    body: "Max woke up screaming at 2 AM. Not a normal nightmare — he was rigid, eyes open, speaking in a monotone about \"the spiral\" and \"the seven points.\" When he finally calmed down, he grabbed a crayon and drew without stopping for forty minutes. The drawing: your lab, but impossibly deep, extending hundreds of meters underground. At the bottom, something spiraling. Glowing. Waiting.",
    trigger: { type: "madnessLevel", level: 5 },
    choices: [
      {
        label: "Comfort Him",
        description: "+3x click for 3 minutes, relationship hint",
        outcomes: [
          { type: "clickBuff", multiplier: 3, durationSec: 180 },
          { type: "queueTicker", text: "MAX COMFORTED — Gary held his son until dawn. Max said: \"It's okay, Dad. It's not scary. It just wants to talk.\" Gary did not find this comforting." },
        ],
      },
      {
        label: "Study the Drawing",
        description: "Unlocks hidden note, +500 RP",
        outcomes: [
          { type: "unlockNote", noteId: "secret_max_drawing" },
          { type: "rpBonus", amount: 500 },
          { type: "queueTicker", text: "CHILD'S DRAWING ANALYZED — The geological layers in Max's crayon drawing are accurate to within 3%. He's eleven. He's never taken geology." },
        ],
      },
      {
        label: "Build What He Drew",
        description: "+3x all production for 2 minutes, +3 Megalomaniac",
        outcomes: [
          { type: "productionBuff", target: "all", multiplier: 3, durationSec: 120 },
          { type: "madnessAffinity", archetype: "megalomaniac", points: 3 },
          { type: "queueTicker", text: "CONSTRUCTION BEGINS ON CHILD'S BLUEPRINT — Linda: \"You're building something an eleven-year-old dreamed?\" Gary: \"He dreamed it CORRECTLY, Linda.\"" },
        ],
      },
    ],
  },

  {
    id: "secret_soil_glows",
    title: "The Soil Glows",
    body: "During warehouse foundation work, the excavators hit something at twelve meters down — a layer of soil that glows faintly blue in the dark. Not bioluminescence. Not radiation. The Geiger counter reads normal. The spectrometer reads impossible. The soil is warm to the touch. It hums at 42.7-second intervals. The construction crew quit on the spot.",
    trigger: { type: "labLevel", level: 2 },
    choices: [
      {
        label: "Collect Samples",
        description: "+3 Unhinged, chemistry buff, unlocks hidden note",
        outcomes: [
          { type: "madnessAffinity", archetype: "unhinged", points: 3 },
          { type: "productionBuff", target: "chemistry", multiplier: 3, durationSec: 180 },
          { type: "unlockNote", noteId: "secret_glowing_soil" },
          { type: "queueTicker", text: "GLOWING SOIL COLLECTED — Sample jars arranged on shelf. They pulse in unison. Gary has started humming at the same frequency. He doesn't notice." },
        ],
      },
      {
        label: "Seal It Off",
        description: "+10,000 RP (safe approach)",
        outcomes: [
          { type: "rpBonus", amount: 10000 },
          { type: "queueTicker", text: "ANOMALOUS SOIL LAYER SEALED — Three feet of concrete poured over it. The glow still comes through at night. Gary pretends not to notice." },
        ],
      },
      {
        label: "Call Professor Chen",
        description: "Research speed buff + hidden note about anomaly",
        outcomes: [
          { type: "productionBuff", target: "all", multiplier: 2, durationSec: 240 },
          { type: "unlockNote", noteId: "secret_chen_anomaly" },
          { type: "queueTicker", text: "PROFESSOR CHEN ARRIVES WITHIN 20 MINUTES — Suspiciously fast. He brought specialized equipment. Also suspiciously prepared. \"I've been waiting for this call,\" he said." },
        ],
      },
    ],
  },

  {
    id: "secret_patterson_box",
    title: "Patterson's Box",
    body: "Mrs. Patterson appeared at your door holding a padlocked metal box. Military-grade. Dented. Heavy. \"Harold left this with me in '87,\" she said, not meeting your eyes. \"He said the next person to work in that garage would know the combination. Three numbers. He said they'd just... know.\" She set it down and left before you could ask anything else. The lock has three dials.",
    trigger: { type: "generatorOwned", genId: "prototype", count: 50 },
    choices: [
      {
        label: "Try the Combination",
        description: "Massive IP + hidden note about CHRYSALIS",
        outcomes: [
          { type: "rpBonus", amount: 50000 },
          { type: "unlockNote", noteId: "secret_chrysalis_files" },
          { type: "queueTicker", text: "BOX OPENED — Combination: 4-2-7. Gary knew it instantly. Inside: files stamped PROJECT CHRYSALIS. Classification level: doesn't exist." },
        ],
      },
      {
        label: "Break It Open",
        description: "+15,000 RP, +2 Gadgeteer",
        outcomes: [
          { type: "rpBonus", amount: 15000 },
          { type: "madnessAffinity", archetype: "gadgeteer", points: 2 },
          { type: "queueTicker", text: "BOX FORCED OPEN — Contents partially damaged. Some files readable. Gary salvaged what he could. Mrs. Patterson: \"Harold would have wanted you to use the combination.\"" },
        ],
      },
      {
        label: "Ask Patterson About Harold",
        description: "Unlocks note about Voss + relationship hint",
        outcomes: [
          { type: "unlockNote", noteId: "secret_voss_history" },
          { type: "queueTicker", text: "MRS. PATTERSON TELLS ALL — Tea. Cookies. Tears. Harold Voss was brilliant, kind, and terrified of what he'd found. He didn't disappear. He was taken. \"By whom?\" \"By what, dear. By what.\"" },
        ],
      },
    ],
  },

  {
    id: "secret_the_signal",
    title: "The Signal",
    body: "Your server cluster intercepted something. Not data — a pattern. A repeating pulse at 42.7-second intervals. It's not radio. Not microwave. Not any known frequency or medium. Your instruments say it's coming from directly below the garage, approximately 200 meters down. It's been broadcasting continuously since before your servers existed. They just finally got sensitive enough to hear it.",
    trigger: { type: "generatorOwned", genId: "server", count: 250 },
    choices: [
      {
        label: "Decode It",
        description: "+3 Perfectionist, +25,000 IP, unlocks hidden note",
        outcomes: [
          { type: "madnessAffinity", archetype: "perfectionist", points: 3 },
          { type: "rpBonus", amount: 25000 },
          { type: "unlockNote", noteId: "secret_signal_decoded" },
          { type: "queueTicker", text: "SIGNAL DECODED — It's not a message. It's a heartbeat. Something beneath Elm Street has been alive for a very, very long time." },
        ],
      },
      {
        label: "Amplify It",
        description: "+3x all production for 2 minutes, +4 Reality Breaker",
        outcomes: [
          { type: "productionBuff", target: "all", multiplier: 3, durationSec: 120 },
          { type: "madnessAffinity", archetype: "realityBreaker", points: 4 },
          { type: "queueTicker", text: "SIGNAL AMPLIFIED — Every device on Elm Street flickered. Dogs howled. Mrs. Patterson's cookies burned. The glow beneath the garage intensified. Gary smiled." },
        ],
      },
      {
        label: "Report It to Reeves",
        description: "Relationship hint + ticker",
        outcomes: [
          { type: "rpBonus", amount: 5000 },
          { type: "queueTicker", text: "SIGNAL REPORTED TO AGENT REEVES — Long pause. \"We know about the signal, Gary. We've known since 1962. What we didn't know is that someone could hear it without the equipment.\" He looked at Gary differently after that." },
        ],
      },
    ],
  },

  {
    id: "secret_reeves_warning",
    title: "Reeves' Warning",
    body: "Reeves pulled you aside after your latest prestige. No pretense. No small talk. \"Listen carefully, Gary. There's a review coming. My superiors want to 'evaluate your progress.' That's not good. They evaluated Voss too.\" He paused. \"Voss didn't fail the evaluation. He passed. That's when they took him.\"",
    trigger: { type: "prestigeCount", count: 10 },
    choices: [
      {
        label: "Hide the Evidence",
        description: "Lose 5% RP but stay safe, unlocks hidden note",
        outcomes: [
          { type: "rpCost", percent: 5 },
          { type: "unlockNote", noteId: "secret_reeves_review" },
          { type: "queueTicker", text: "EVIDENCE CONCEALED — Gary downgraded visible equipment. Hid the real lab behind a false wall. Reeves helped. \"Make it look boring,\" he said. \"Boring is safe.\"" },
        ],
      },
      {
        label: "Prepare a Demonstration",
        description: "Risky: big RP multiplier + 3 Megalomaniac",
        outcomes: [
          { type: "rpMultSeconds", seconds: 300 },
          { type: "madnessAffinity", archetype: "megalomaniac", points: 3 },
          { type: "queueTicker", text: "DEMONSTRATION PREPARED — Gary's plan: show them just enough to impress, not enough to scare. Reeves: \"That's exactly what Voss said.\" Gary: \"I'm not Voss.\"" },
        ],
      },
      {
        label: "Trust Reeves Completely",
        description: "Unlocks note about Reeves' protection + ticker",
        outcomes: [
          { type: "unlockNote", noteId: "secret_reeves_protection" },
          { type: "queueTicker", text: "GARY TRUSTS REEVES — \"Why are you protecting me?\" Long silence. \"Because I failed to protect the last one. I won't make that mistake again.\" Reeves' hands were shaking." },
        ],
      },
    ],
  },

  {
    id: "secret_the_dream",
    title: "The Dream",
    body: "You dreamed of a spiral. Not a metaphor — a physical, luminous spiral carved into bedrock beneath the earth. Seven points of light scattered across the globe, connected by threads of something that isn't matter or energy but somehow both. São Paulo. Kyoto. Reykjavik. Nairobi. Perth. Svalbard. And here. Elm Street. You woke up at 4 AM and knew — KNEW — exactly how to reconfigure every generator in your lab for a 40% efficiency gain. The knowledge was just... there.",
    trigger: { type: "madnessLevel", level: 7 },
    choices: [
      {
        label: "Follow the Inspiration",
        description: "+5x all production for 2 minutes, +5 Reality Breaker — dangerous",
        outcomes: [
          { type: "productionBuff", target: "all", multiplier: 5, durationSec: 120 },
          { type: "madnessAffinity", archetype: "realityBreaker", points: 5 },
          { type: "queueTicker", text: "DREAM-INSPIRED MODIFICATIONS COMPLETE — Every generator hums in a new key. Harmonics match the 42.7-second pulse. Gary hasn't blinked in three hours. He says he can see the threads." },
        ],
      },
      {
        label: "Resist It",
        description: "Small RP bonus, reduce madness slightly",
        outcomes: [
          { type: "rpBonus", amount: 10000 },
          { type: "madnessAffinity", archetype: "realityBreaker", points: -3 },
          { type: "madnessAffinity", archetype: "megalomaniac", points: -2 },
          { type: "queueTicker", text: "Gary Flemming was seen sleeping normally for once. Eight full hours. No talking in his sleep. Neighbors relieved. The glow under the garage dimmed slightly." },
        ],
      },
      {
        label: "Write It All Down",
        description: "Unlocks hidden note, +15,000 RP, +2 Accidental Genius",
        outcomes: [
          { type: "unlockNote", noteId: "secret_seven_nexus" },
          { type: "rpBonus", amount: 15000 },
          { type: "madnessAffinity", archetype: "accidentalGenius", points: 2 },
          { type: "queueTicker", text: "DREAM JOURNAL — 47 pages in one sitting. Diagrams of a global network. Seven points. Seven scientists. Seven garages. Gary's handwriting gets steadier as the pages go on, not shakier." },
        ],
      },
    ],
  },

  {
    id: "secret_chen_urgent_call",
    title: "Chen's Urgent Call",
    body: "Professor Chen called at midnight. No pleasantries. His voice was ragged. \"Gary, the São Paulo site went dark. Permanently. Dr. Oliveira stopped responding three days ago. Her equipment is still running but she's... gone. Same as Voss. I need your help calibrating the detection array before we lose another one. Now, Gary. Right now.\"",
    trigger: { type: "labLevel", level: 3 },
    choices: [
      {
        label: "Help Immediately",
        description: "Research speed buff + hidden note + 2 Perfectionist",
        outcomes: [
          { type: "productionBuff", target: "all", multiplier: 2, durationSec: 300 },
          { type: "unlockNote", noteId: "secret_sao_paulo" },
          { type: "madnessAffinity", archetype: "perfectionist", points: 2 },
          { type: "queueTicker", text: "DETECTION ARRAY CALIBRATED — Five remaining sites now monitored. São Paulo silent. Kyoto fluctuating. Gary worked 16 hours straight. Chen said: \"You're the strongest signal now.\"" },
        ],
      },
      {
        label: "Ask What Happened to Oliveira",
        description: "Unlocks hidden note about the danger + ticker",
        outcomes: [
          { type: "unlockNote", noteId: "secret_oliveira_fate" },
          { type: "queueTicker", text: "CHEN EXPLAINS — \"The nexus points aren't just anomalies. They're doors. Oliveira opened hers. She went through.\" Pause. \"Voss did the same thing in '87. The door doesn't open from the other side.\"" },
        ],
      },
      {
        label: "Refuse — Too Risky",
        description: "+5,000 RP (work undisturbed)",
        outcomes: [
          { type: "rpBonus", amount: 5000 },
          { type: "queueTicker", text: "Professor Chen was seen packing boxes into his car at 3 AM. He left a note under Gary's door: \"When you're ready. If there's still time.\" His office at the university is empty." },
        ],
      },
    ],
  },

  {
    id: "secret_the_inspection",
    title: "The Inspection",
    body: "Three people arrived in a black SUV. Not Reeves' people — he'd have warned you. They wore suits that cost more than your first car. Badges you've never seen: no agency name, just a spiral logo and a number. They measured everything. Took soil samples. Pointed instruments at walls. Left without a single word. Reeves appeared ten minutes later, furious, pacing your driveway. \"Those weren't mine. Those were CHRYSALIS.\"",
    trigger: { type: "ascensionCount", count: 1 },
    choices: [
      {
        label: "Panic",
        description: "Lose some RP, unlock note about The Watchers",
        outcomes: [
          { type: "rpCost", percent: 3 },
          { type: "unlockNote", noteId: "secret_chrysalis_watchers" },
          { type: "queueTicker", text: "UNIDENTIFIED AGENTS DEPARTED — Gary checked every lock twice. Installed three new cameras. Sleep quality: zero. The spiral logo burns in his mind." },
        ],
      },
      {
        label: "Ask Reeves Who They Are",
        description: "Unlocks note about the factions + ticker",
        outcomes: [
          { type: "unlockNote", noteId: "secret_chrysalis_factions" },
          { type: "queueTicker", text: "REEVES EXPLAINS — \"CHRYSALIS was defunded in '91. Officially. The people who ran it didn't stop. They just stopped filing paperwork.\" He looked old. Tired. \"I've been keeping you off their radar. That's over now.\"" },
        ],
      },
      {
        label: "Carry On Working",
        description: "+3x all production for 2 minutes (defiance), +2 Megalomaniac",
        outcomes: [
          { type: "productionBuff", target: "all", multiplier: 3, durationSec: 120 },
          { type: "madnessAffinity", archetype: "megalomaniac", points: 2 },
          { type: "queueTicker", text: "GARY RETURNS TO WORK — \"Let them watch. Let them measure. They had sixty years and a billion dollars. I have a garage.\" The generators hummed louder, as if in agreement." },
        ],
      },
    ],
  },

  {
    id: "secret_max_built_something",
    title: "Max Built Something",
    body: "You found Max in the garage at 6 AM, surrounded by spare parts. He'd built a device. It's about the size of a shoebox, cobbled together from capacitors, wire, a broken radio, and somehow a piece of the glowing soil he shouldn't have been able to access. It works. It produces a stable field that makes nearby generators run 2% more efficiently. You don't understand how. Your PhD doesn't explain it. He's eleven.",
    trigger: { type: "generatorCount", count: 2000 },
    choices: [
      {
        label: "Praise Him",
        description: "Unlocks hidden note about Max + ticker",
        outcomes: [
          { type: "unlockNote", noteId: "secret_max_talent" },
          { type: "queueTicker", text: "MAX PRAISED FOR INVENTION — He beamed. \"Dad, I just listened to what it wanted to be.\" Gary nodded like that made sense. It doesn't make sense. But Max's device still works." },
        ],
      },
      {
        label: "Study the Device",
        description: "Massive IP bonus + hidden note about Max's potential",
        outcomes: [
          { type: "rpBonus", amount: 100000 },
          { type: "unlockNote", noteId: "secret_max_potential" },
          { type: "queueTicker", text: "DEVICE ANALYZED — Operating principles: unknown. Power source: unknown. Builder's age: 11. Chen's assessment: \"He's not a scientist. He's a conduit.\" Gary asked him to never say that again." },
        ],
      },
      {
        label: "Ground Him (for Safety)",
        description: "+5,000 RP, concerned ticker",
        outcomes: [
          { type: "rpBonus", amount: 5000 },
          { type: "queueTicker", text: "Max was seen looking sadly at the garage from his bedroom window. The device still works without him nearby. It shouldn't. Gary locked it in a drawer. It hums at night." },
        ],
      },
    ],
  },

  {
    id: "secret_spiral_in_basement",
    title: "The Spiral in the Basement",
    body: "At orbital altitude, your deep-scan sensors finally had the resolution to see it clearly. A perfect logarithmic spiral, etched into bedrock 200 meters below your garage. Diameter: 47 meters. Age, according to geological analysis: 3.8 billion years. Older than complex life. Older than the atmosphere. It was carved into the earth before anything lived here. And it's identical to the spirals beneath the other six sites. Seven spirals. One pattern. Waiting.",
    trigger: { type: "labLevel", level: 4 },
    choices: [
      {
        label: "Analyze It Thoroughly",
        description: "Massive IP + hidden note about the planetary circuit",
        outcomes: [
          { type: "rpBonus", amount: 500000 },
          { type: "unlockNote", noteId: "secret_planetary_circuit" },
          { type: "queueTicker", text: "SPIRAL MAPPED COMPLETELY — It's not a carving. It's a circuit. The seven spirals are nodes in a planetary-scale machine. Purpose: unknown. Status: warming up. Has been warming up for 3.8 billion years." },
        ],
      },
      {
        label: "Attempt Activation",
        description: "Huge production buff but risky, +5 Reality Breaker",
        outcomes: [
          { type: "productionBuff", target: "all", multiplier: 10, durationSec: 60 },
          { type: "madnessAffinity", archetype: "realityBreaker", points: 5 },
          { type: "queueTicker", text: "ACTIVATION ATTEMPTED — For seventeen seconds, every light on Elm Street turned blue. Every dog sat down. Every person paused mid-sentence. Then normal. But the spiral is 0.001% brighter now. It noticed." },
        ],
      },
      {
        label: "Tell Everyone",
        description: "Unlocks hidden note + multiple NPC reaction tickers",
        outcomes: [
          { type: "unlockNote", noteId: "secret_spiral_revealed" },
          { type: "queueTicker", text: "THE SPIRAL REVEALED — Chen: \"Finally.\" Patterson: \"Harold always knew.\" Reeves: \"This changes the threat assessment.\" Linda: \"Under our HOUSE?\" Max, quietly: \"It says hello.\"" },
        ],
      },
    ],
  },

  {
    id: "secret_voss_returns",
    title: "Voss Returns",
    body: "A man appeared in your garage. Not walked in — appeared. One moment empty air, the next: a man in his 60s, disheveled, wearing a brown corduroy jacket with leather elbow patches that went out of style in 1987. Because that's when he last wore it. \"Hello,\" he said, blinking in the fluorescent light. \"I'm Harold. Harold Voss. I see you found my notes.\" He looked around the lab with wonder. \"You've done so much more than I ever did. How long have I been gone?\" You tell him. He sits down heavily. \"Thirty-nine years. It felt like an afternoon.\"",
    trigger: { type: "ascensionCount", count: 5 },
    choices: [
      {
        label: "Welcome Him Home",
        description: "Unlocks Voss's story + global production buff",
        outcomes: [
          { type: "unlockNote", noteId: "secret_voss_story" },
          { type: "productionBuff", target: "all", multiplier: 2, durationSec: 600 },
          { type: "queueTicker", text: "DR. HAROLD VOSS RETURNS — 39 years. Same clothes. Same smile. Mrs. Patterson brought cookies. She didn't say a word. Just held his hand for a very long time." },
        ],
      },
      {
        label: "Question Him About the Other Side",
        description: "Unlocks note about what happened + 50,000 IP",
        outcomes: [
          { type: "unlockNote", noteId: "secret_voss_otherside" },
          { type: "rpBonus", amount: 50000 },
          { type: "queueTicker", text: "VOSS DEBRIEFED — \"It's not another place. It's another... layer. Everything is the same but the rules are different. Time is optional. Space is a suggestion. And it's aware. It's been aware the whole time.\"" },
        ],
      },
      {
        label: "Call Reeves",
        description: "Unlocks reunion note + ticker + relationship hints",
        outcomes: [
          { type: "unlockNote", noteId: "secret_voss_reeves_reunion" },
          { type: "queueTicker", text: "REEVES AND VOSS REUNITED — Reeves stood in the doorway for thirty seconds. Then: \"You son of a bitch. I wrote the report. I closed your file. I—\" He hugged him. First known display of emotion from Agent Reeves." },
        ],
      },
    ],
  },

  {
    id: "secret_convergence_begins",
    title: "The Convergence Begins",
    body: "All seven nexus points are active. You can feel them — not metaphorically, literally. A warmth in your chest that pulses at 42.7-second intervals, synchronized with six other people in six other garages on six other continents. The planetary circuit is completing. After 3.8 billion years of patient waiting, the machine beneath the world is waking up. Voss says it's not a machine. Chen says it is. Reeves says it doesn't matter what it is, only what it does. And what it does... is open a door.",
    trigger: { type: "totalRPAllTime", amount: 1e80 },
    choices: [
      {
        label: "Embrace It",
        description: "Massive permanent buff, +3 all archetypes",
        outcomes: [
          { type: "productionBuff", target: "all", multiplier: 7, durationSec: 300 },
          { type: "madnessAffinity", archetype: "megalomaniac", points: 3 },
          { type: "madnessAffinity", archetype: "perfectionist", points: 3 },
          { type: "madnessAffinity", archetype: "realityBreaker", points: 3 },
          { type: "madnessAffinity", archetype: "unhinged", points: 3 },
          { type: "madnessAffinity", archetype: "gadgeteer", points: 3 },
          { type: "madnessAffinity", archetype: "accidentalGenius", points: 3 },
          { type: "queueTicker", text: "THE CONVERGENCE EMBRACED — Gary opened his arms and the garage filled with light. Every generator sang. Every note aligned. The spiral beneath pulsed once, strong, and somewhere, six other scientists did the same." },
        ],
      },
      {
        label: "Fear It",
        description: "Unlocks hidden note + 500,000 RP (caution has value)",
        outcomes: [
          { type: "unlockNote", noteId: "secret_convergence_fear" },
          { type: "rpBonus", amount: 500000 },
          { type: "queueTicker", text: "CONVERGENCE DELAYED — Gary hesitated. The pulse dimmed. Voss: \"That's okay. It waited 3.8 billion years. It can wait a little longer.\" But can it?" },
        ],
      },
      {
        label: "Lead It",
        description: "Unlocks note about Gary's role, +5 Megalomaniac",
        outcomes: [
          { type: "unlockNote", noteId: "secret_gary_role" },
          { type: "madnessAffinity", archetype: "megalomaniac", points: 5 },
          { type: "queueTicker", text: "GARY TAKES COMMAND — Seven sites. Seven scientists. One network. And Gary Flemming, suburban dad with a PhD and a garage, at the center of it all. The universe has a sense of humor." },
        ],
      },
    ],
  },

  {
    id: "secret_final_experiment",
    title: "The Final Experiment",
    body: "Everything has led to this. The spiral beneath your garage. The anomaly that's been humming for 3.8 billion years. The seven sites across the world. Voss, who went through and came back. Patterson, who kept the faith for four decades. Chen, who tracked the signal from space. Reeves, who broke every rule to keep you safe. Max, who can hear what no instrument can detect. Linda, who held it all together with dinner and patience and love. One last experiment. One button. The door opens — not for one person this time, but for everyone. You started with a notebook and a click. You'll end with a choice that changes everything. Or nothing. The click is yours.",
    trigger: { type: "totalRPAllTime", amount: 1e150 },
    choices: [
      {
        label: "Run the Final Experiment",
        description: "Ultimate production buff + final hidden note",
        outcomes: [
          { type: "productionBuff", target: "all", multiplier: 100, durationSec: 600 },
          { type: "unlockNote", noteId: "secret_final_experiment" },
          { type: "queueTicker", text: "THE FINAL EXPERIMENT — Gary pressed the button. The garage filled with light. The spiral sang. And for one perfect moment, every person on Elm Street understood everything. Then it was Tuesday again. But different. Better." },
        ],
      },
      {
        label: "Walk Away",
        description: "Reflective hidden note + 1,000,000 RP",
        outcomes: [
          { type: "unlockNote", noteId: "secret_walk_away" },
          { type: "rpBonus", amount: 1000000 },
          { type: "queueTicker", text: "GARY WALKS AWAY — From the lab. From the spiral. From the door. He went upstairs. Made pancakes. Helped Max with homework. The garage hums. It'll wait. It always waits." },
        ],
      },
      {
        label: "Let Max Do It",
        description: "Unlocks note about the future + next generation ticker",
        outcomes: [
          { type: "unlockNote", noteId: "secret_max_future" },
          { type: "queueTicker", text: "MAX PRESSES THE BUTTON — His hand was steady. He wasn't scared. \"It's okay, Dad. I've been talking to it my whole life.\" The light was warm. The hum became music. And the next chapter began — not Gary's. Not Voss's. Max's. The youngest scientist on Elm Street. The best one." },
        ],
      },
    ],
  },
];

// ── Lookup ──────────────────────────────────────────────────────────

const EVENT_MAP = new Map<string, EventDef>(
  EVENTS.map((e) => [e.id, e])
);

export function getEventDef(id: string): EventDef | undefined {
  return EVENT_MAP.get(id);
}
