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
];

// ── Lookup ──────────────────────────────────────────────────────────

const EVENT_MAP = new Map<string, EventDef>(
  EVENTS.map((e) => [e.id, e])
);

export function getEventDef(id: string): EventDef | undefined {
  return EVENT_MAP.get(id);
}
