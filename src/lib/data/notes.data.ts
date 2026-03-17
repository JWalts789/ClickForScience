import type { MadnessArchetype } from "../engine/state";

// ── Lab Note Definitions ─────────────────────────────────────────────

export interface NoteTrigger {
  type:
    | "generatorOwned"
    | "upgradeOwned"
    | "prestigeCount"
    | "madnessLevel"
    | "dominantArchetype"
    | "totalRPAllTime"
    | "clickCount"
    | "generatorCount"
    | "labLevel"
    | "ascensionCount"
    | "challengesCompleted"
    | "researchCompleted"
    | "relationshipLevel";

  // Different triggers use different fields
  genId?: string;
  upgradeId?: string;
  nodeId?: string;
  npcId?: string;
  count?: number;
  amount?: number;
  level?: number;
  archetype?: MadnessArchetype;
}

export interface LabNoteDef {
  id: string;
  /** The note title shown in the journal. */
  title: string;
  /** The note body — the scientist's inner monologue. */
  body: string;
  /** What must be true for this note to unlock. */
  trigger: NoteTrigger;
  /** Optional archetype-specific alternate body text. */
  archetypeVariants?: Partial<Record<MadnessArchetype, string>>;
}

export const LAB_NOTES: LabNoteDef[] = [
  // ── Early Game (getting started) ──────────────────────────────────

  {
    id: "first_click",
    title: "Day One",
    body: "Bought a notebook today. Nothing fancy — spiral-bound, college-ruled. The kind you'd buy for a kid's homework. But I've got an idea. Just a small one. Probably nothing.",
    trigger: { type: "clickCount", count: 1 },
  },
  {
    id: "first_notebook",
    title: "Getting Organized",
    body: "Ten notebooks now. The first few are filled with calculations — half of them wrong, I think. But there's a pattern forming. Something in the numbers that I can almost see.",
    trigger: { type: "generatorOwned", genId: "notebook", count: 10 },
  },
  {
    id: "first_soldering",
    title: "Hands-On",
    body: "Picked up a soldering station. My wife asked what I was building. I said 'circuits.' She asked what for. I said 'research.' She asked research into what. I didn't have an answer.",
    trigger: { type: "generatorOwned", genId: "soldering", count: 1 },
  },
  {
    id: "hundred_clicks",
    title: "Commitment",
    body: "A hundred experiments. Or is it a hundred attempts at the same experiment? The line blurs. Each one teaches me something, even when it fails. Especially when it fails.",
    trigger: { type: "clickCount", count: 100 },
  },

  // ── Mid-Early Game (expanding the lab) ────────────────────────────

  {
    id: "first_chemistry",
    title: "New Smells",
    body: "The chemistry set arrived. The garage smells different now — sharp, metallic, alive. My neighbor asked if I was cooking something. I said 'in a sense.'",
    trigger: { type: "generatorOwned", genId: "chemistry", count: 1 },
    archetypeVariants: {
      unhinged: "The chemistry set arrived. Already mixed things the manual said not to. The resulting color was beautiful. The resulting smell was... less beautiful. But PROGRESS.",
    },
  },
  {
    id: "second_generator",
    title: "Expanding Horizons",
    body: "Multiple research streams now. Notebooks feeding into solder work feeding into... something bigger. I can feel the shape of it, just beyond my understanding.",
    trigger: { type: "generatorCount", count: 3 },
  },
  {
    id: "first_server",
    title: "Going Digital",
    body: "Installed the first server rack in the garage. The fan noise is constant now. My wife says it sounds like we live inside a computer. She's not wrong.",
    trigger: { type: "generatorOwned", genId: "server", count: 1 },
    archetypeVariants: {
      perfectionist: "Server rack installed. Organized the cables with color-coded zip ties. Optimized the cooling airflow. Wrote a 12-page document on my naming conventions. The research can wait — the INFRASTRUCTURE must be perfect first.",
    },
  },
  {
    id: "first_upgrade",
    title: "Optimization",
    body: "Started improving my process instead of just doing more of it. Graph paper instead of lined. Better solder. Cleaner reagents. Small changes, but the output curves are shifting.",
    trigger: { type: "upgradeOwned", upgradeId: "notebook_1" },
  },
  {
    id: "thousand_rp",
    title: "Promising Results",
    body: "The data is starting to cohere. Patterns where there were none. Connections I didn't expect. I told my wife I think I'm onto something. She smiled the way she does when she's worried.",
    trigger: { type: "totalRPAllTime", amount: 1000 },
  },

  // ── Mid Game (things get weird) ───────────────────────────────────

  {
    id: "first_prototype",
    title: "It Does Something",
    body: "Built the first prototype. I'm not entirely sure what it does, but it does it consistently. That's science, right? Reproducible results, even if you don't understand them.",
    trigger: { type: "generatorOwned", genId: "prototype", count: 1 },
    archetypeVariants: {
      accidentalGenius: "Built the first prototype. Dropped it. It started working BETTER. I have no idea why. Dropped the second one on purpose. Even better. Is this a methodology?",
      gadgeteer: "Built the first prototype. Then immediately took it apart to build a better one. Then took THAT apart. I've built and unbuilt this thing seventeen times. Each iteration is a revelation.",
    },
  },
  {
    id: "first_containment",
    title: "Safety Third",
    body: "Installed a containment chamber. The fact that I need one should probably concern me more than it does. What's inside it? That's... a complicated question.",
    trigger: { type: "generatorOwned", genId: "containment", count: 1 },
    archetypeVariants: {
      unhinged: "Installed a containment chamber. Immediately started wondering what would happen if I opened it. I won't, of course. Probably. Unless the readings get REALLY interesting.",
    },
  },
  {
    id: "million_rp",
    title: "The University Called",
    body: "Someone from the university called today. They'd seen some data I posted online — asked if I had a lab. I said yes. They asked where. I said 'my garage.' Long pause.",
    trigger: { type: "totalRPAllTime", amount: 1000000 },
  },
  {
    id: "madness_begins",
    title: "Something Different",
    body: "I caught myself talking to the equipment today. Not in a 'come on, work' way. In a conversational way. Asked the server rack how its day was going. It didn't answer. Yet.",
    trigger: { type: "madnessLevel", level: 2 },
  },

  // ── Late Mid Game (deeper) ────────────────────────────────────────

  {
    id: "first_collider",
    title: "Mini Doesn't Mean Safe",
    body: "It's a particle collider. A small one. The 'mini' in the name is doing a lot of heavy lifting, psychologically. The readings it produces shouldn't be possible at this scale.",
    trigger: { type: "generatorOwned", genId: "collider", count: 1 },
    archetypeVariants: {
      realityBreaker: "The collider is showing particles that don't exist in the standard model. I've checked three times. They're not errors. They're something NEW. Something that shouldn't be.",
    },
  },
  {
    id: "first_mindlink",
    title: "Direct Connection",
    body: "The Mind-Link Array works. I know this because I can feel the data without looking at the screen. Not metaphorically. I literally feel the numbers. They taste blue.",
    trigger: { type: "generatorOwned", genId: "mindlink", count: 1 },
    archetypeVariants: {
      megalomaniac: "The Mind-Link Array works. I can feel every experiment at once, every data point singing in harmony. This is what it feels like to be at the CENTER. To see EVERYTHING.",
    },
  },
  {
    id: "madness_mid",
    title: "The Mirror",
    body: "Looked in the mirror this morning. Couldn't remember the last time I'd done that. My hair is different. My eyes are different. Something behind them is different. Better? Worse? Just... more.",
    trigger: { type: "madnessLevel", level: 4 },
  },
  {
    id: "billion_rp",
    title: "Beyond Peer Review",
    body: "My research has surpassed what any university could evaluate. Not because they're not smart enough — because they don't have the FRAMEWORK. You need the framework first. I built the framework.",
    trigger: { type: "totalRPAllTime", amount: 1000000000 },
  },

  // ── Late Game ─────────────────────────────────────────────────────

  {
    id: "first_reality",
    title: "Flexible Definitions",
    body: "The Reality Engine is online. 'Reality' is a strong word for what it manipulates. More like... the rough draft of reality. The version before someone checked the math.",
    trigger: { type: "generatorOwned", genId: "reality", count: 1 },
  },
  {
    id: "first_cosmic",
    title: "Thread Count",
    body: "The Cosmic Loom weaves something. Not fabric. Not light. Something underneath both. The sound it makes isn't a sound — it's more like the absence of a sound that should be there.",
    trigger: { type: "generatorOwned", genId: "cosmic", count: 1 },
  },
  {
    id: "madness_high",
    title: "Who I Was",
    body: "Found an old photo of myself. Normal guy. Khakis. Polo shirt. Mowing a lawn. I don't recognize him. Not in a dramatic way — genuinely. Like looking at a stranger who happens to live in my house.",
    trigger: { type: "madnessLevel", level: 6 },
  },
  {
    id: "madness_peak",
    title: "What I Am",
    body: "The garage isn't a garage anymore. I'm not sure what it is. I'm not sure what I am. But I know what I'm doing is important. The most important thing anyone has ever done. Probably. Almost certainly.",
    trigger: { type: "madnessLevel", level: 8 },
  },

  // ── Prestige Notes ────────────────────────────────────────────────

  {
    id: "first_prestige",
    title: "Snap Out of It",
    body: "I destroyed everything today. All of it. Every notebook, every circuit, every server. It felt necessary. Like waking up from a dream where everything made sense, and realizing it didn't. But now I know what I was trying to do. I can do it better.",
    trigger: { type: "prestigeCount", count: 1 },
  },
  {
    id: "third_prestige",
    title: "The Cycle",
    body: "Third time through. Each reset takes less time. Not because I'm faster — because I understand the SHAPE of the problem now. The solution isn't in the details. It's in the architecture.",
    trigger: { type: "prestigeCount", count: 3 },
  },
  {
    id: "fifth_prestige",
    title: "Comfortable Destruction",
    body: "Destroying my life's work doesn't bother me anymore. It's like breathing out. You have to empty your lungs before you can fill them again. Each breath deeper than the last.",
    trigger: { type: "prestigeCount", count: 5 },
  },

  // ── Archetype-Specific Notes ──────────────────────────────────────

  {
    id: "archetype_megalomaniac",
    title: "The Vision",
    body: "They don't understand. None of them do. But they will. When I'm finished, they'll have no choice but to understand. The scope of what I'm building... it's not for me. It's for EVERYONE. Whether they want it or not.",
    trigger: { type: "dominantArchetype", archetype: "megalomaniac" },
  },
  {
    id: "archetype_perfectionist",
    title: "Not Good Enough",
    body: "Rebuilt the entire setup today. From scratch. The tolerances were off by 0.003%. Unacceptable. My wife says no one would notice. That's the POINT. I would notice. The SCIENCE would notice.",
    trigger: { type: "dominantArchetype", archetype: "perfectionist" },
  },
  {
    id: "archetype_unhinged",
    title: "Safety Is Relative",
    body: "Mixed compound A with compound B today. The manual explicitly says not to. The manual is WRONG. The result was unexpected, beautiful, and only slightly on fire. Progress has a smell, and it smells like burning.",
    trigger: { type: "dominantArchetype", archetype: "unhinged" },
  },
  {
    id: "archetype_realityBreaker",
    title: "The Edges",
    body: "I can see where reality is thin. Not metaphorically. Literally. There are seams. Boundaries where the rules change if you push hard enough. I've been pushing. They're starting to give.",
    trigger: { type: "dominantArchetype", archetype: "realityBreaker" },
  },
  {
    id: "archetype_gadgeteer",
    title: "One More Modification",
    body: "Took apart the toaster today. Then the microwave. Then the car engine. Reassembled them into something new. I don't know what it does yet, but it hums at a frequency that makes the cat nervous.",
    trigger: { type: "dominantArchetype", archetype: "gadgeteer" },
  },
  {
    id: "archetype_accidentalGenius",
    title: "Happy Accidents",
    body: "Spilled coffee on the prototype. It started working 40% better. Tried to replicate the result with tea — nothing. Juice — nothing. It HAS to be coffee. I've written a grant proposal titled 'The Caffeine Constant.'",
    trigger: { type: "dominantArchetype", archetype: "accidentalGenius" },
  },

  // ── Family Notes ──────────────────────────────────────────────────

  {
    id: "linda_support_group",
    title: "Linda's Tuesday Nights",
    body: "Linda started a support group. 'Spouses of Garage Scientists.' I asked how many members. She said fourteen. I didn't know fourteen people on our street HAD garages. She said it's not just our street anymore.",
    trigger: { type: "generatorOwned", genId: "server", count: 10 },
    archetypeVariants: {
      megalomaniac: "Linda started a support group. 'Spouses of Garage Scientists.' Fourteen members already. I suggested she franchise it. She gave me a look that could curdle milk. But I'm RIGHT — the scalability is obvious.",
    },
  },
  {
    id: "max_science_fair",
    title: "First Place, Again",
    body: "Max won the science fair. His project was 'Is My Dad's Garage a Laboratory?' The judges were split on whether it counted as science or investigative journalism. He got extra credit for the radiation readings.",
    trigger: { type: "generatorOwned", genId: "chemistry", count: 15 },
    archetypeVariants: {
      unhinged: "Max won the science fair. His project was 'Things My Dad Has Accidentally Set on Fire (Ranked by Color).' The chart was beautiful. He has my gift for data visualization, if nothing else.",
    },
  },
  {
    id: "linda_fridge_note",
    title: "The Fridge Rules",
    body: "Linda put a new note on the fridge. 'THINGS THAT ARE NOT ALLOWED IN THE KITCHEN: anything that glows, anything that hums, anything that used to be two things and is now one thing.' Fair enough.",
    trigger: { type: "generatorOwned", genId: "prototype", count: 5 },
  },
  {
    id: "family_dinner_talk",
    title: "Dinner Conversation",
    body: "Tried to have a normal family dinner. Max asked what quark-gluon plasma tastes like. Linda asked why the backyard has a new crater. I asked someone to pass the potatoes. We are not great at 'normal.'",
    trigger: { type: "generatorOwned", genId: "collider", count: 3 },
    archetypeVariants: {
      accidentalGenius: "Tried to have a normal family dinner. Accidentally solved cold fusion when I knocked over the salt shaker. Max wrote it down. Linda sighed. The potatoes were overcooked but the breakthrough was perfectly timed.",
    },
  },
  {
    id: "max_show_and_tell",
    title: "Show and Tell",
    body: "Max took a prototype component to show and tell. The teacher called. Then the principal called. Then someone from the Department of Energy called. Max got an A. I got a file number.",
    trigger: { type: "generatorOwned", genId: "prototype", count: 10 },
  },
  {
    id: "linda_spa_day",
    title: "Self-Care",
    body: "Linda went to a spa day. I was supportive. She deserves rest. While she was gone, I expanded the containment array into the living room. Just temporarily. She comes back tomorrow. I have seventeen hours to reverse this.",
    trigger: { type: "generatorOwned", genId: "containment", count: 10 },
    archetypeVariants: {
      perfectionist: "Linda went to a spa day. I used the time to reorganize every room in the house by electromagnetic compatibility rating. The living room is now a Faraday cage. She'll understand. The Wi-Fi might not work anymore though.",
    },
  },
  {
    id: "max_career_day",
    title: "Career Day",
    body: "Went to Max's career day at school. The other dads talked about accounting and sales. I talked about subatomic research methodologies. The kids loved it. Two parents pulled their children closer. One dad asked for my card.",
    trigger: { type: "generatorOwned", genId: "mindlink", count: 5 },
  },
  {
    id: "linda_anniversary",
    title: "Anniversary Gift",
    body: "Our anniversary. Got Linda flowers. Also accidentally got her a minor temporal anomaly that makes the flowers bloom in reverse. She said it was 'actually kind of beautiful' and then asked me to get it out of the kitchen. Progress on both fronts.",
    trigger: { type: "generatorOwned", genId: "reality", count: 5 },
    archetypeVariants: {
      realityBreaker: "Our anniversary. Tried to get Linda a normal gift. But 'normal' is hard when you can see the seams in spacetime. Ended up showing her a color that doesn't exist. She cried. Good crying, I think. Hard to tell with non-existent colors.",
    },
  },

  // ── Neighbor / Doug Notes ─────────────────────────────────────────

  {
    id: "doug_first_complaint",
    title: "The Henderson Situation",
    body: "Doug Henderson from next door filed an HOA complaint. 'Unusual light emissions after 10 PM.' I told him it was a night light. He said night lights don't cast shadows that move on their own. He makes a fair point.",
    trigger: { type: "generatorOwned", genId: "chemistry", count: 10 },
  },
  {
    id: "doug_petition",
    title: "The Petition",
    body: "Doug circulated a petition. 'Concerned Residents Against Unexplained Garage Phenomena.' He got twelve signatures. Mrs. Patterson from down the block refused to sign because the strange hum from my garage helps her fall asleep.",
    trigger: { type: "generatorOwned", genId: "server", count: 15 },
    archetypeVariants: {
      megalomaniac: "Doug circulated a petition. Twelve signatures against me. Twelve. I've generated more research points today than he has brain cells. History will remember who was right. Hint: not the man in the cargo shorts.",
    },
  },
  {
    id: "doug_fence_talk",
    title: "Over the Fence",
    body: "Doug stopped me at the fence today. Expected a complaint. Instead, he asked — quietly, looking around first — if I could take a look at his lawnmower. 'You're good with machines, right?' I fixed it in eleven seconds. He didn't file a complaint this month.",
    trigger: { type: "generatorOwned", genId: "prototype", count: 15 },
  },
  {
    id: "doug_grudging_respect",
    title: "Doug's Admission",
    body: "Power went out on the whole block. Except my garage. Doug stood in my driveway in the dark, holding a flashlight. 'Flemming,' he said. 'I don't understand what you do. But my wife's insulin needs to stay cold. Can you help?' I ran an extension cord. He brought me a six-pack the next day.",
    trigger: { type: "generatorOwned", genId: "containment", count: 15 },
  },
  {
    id: "doug_defense",
    title: "Unexpected Ally",
    body: "New neighbors moved in across the street. They complained about the noise. Doug — DOUG HENDERSON — told them, and I quote, 'That noise is the sound of a man who fixes things. Leave him alone.' I need to sit down.",
    trigger: { type: "generatorOwned", genId: "collider", count: 10 },
    archetypeVariants: {
      gadgeteer: "Doug defended me to the new neighbors. Then asked if I could 'take a look' at his TV, his garage door, his car stereo, and something he called 'the thing in the basement that makes a noise.' I now have a client list. I am becoming a gadget veterinarian.",
    },
  },

  // ── Agent Reeves Notes ────────────────────────────────────────────

  {
    id: "reeves_first_visit",
    title: "The Unmarked Car",
    body: "Unmarked sedan parked across the street all day. Government plates. A man in a dark suit watched my garage for six hours, occasionally writing in a notebook. I waved. He pretended to be on his phone. We both know, Agent whoever-you-are. We both know.",
    trigger: { type: "generatorOwned", genId: "containment", count: 5 },
  },
  {
    id: "reeves_report",
    title: "The Report (Redacted)",
    body: "Found a piece of paper in my driveway. Looked like a page from a government report. 'Subject displays [REDACTED] levels of [REDACTED]. Recommend continued [REDACTED].' Someone wrote in the margin: 'HOW is he doing this in a GARAGE?' Good question, Agent. Good question.",
    trigger: { type: "generatorOwned", genId: "collider", count: 5 },
    archetypeVariants: {
      accidentalGenius: "Found a page from a government report in my driveway. Margin note: 'Subject appears to produce results by ACCIDENT. No methodology detected. Possibly the most dangerous kind of genius.' I'm flattered. Also, I don't have a methodology. They're not wrong.",
    },
  },
  {
    id: "reeves_coffee",
    title: "Professional Courtesy",
    body: "Brought a coffee to the agent in the sedan. He tried to deny being an agent. I said 'Okay, would the NOT-agent like cream and sugar?' He said black. We sat in silence for ten minutes. Nice guy. I think his name is Reeves.",
    trigger: { type: "generatorOwned", genId: "mindlink", count: 3 },
  },
  {
    id: "reeves_rooting_for_me",
    title: "Off the Record",
    body: "Agent Reeves knocked on my door today. Not in an official capacity. He said — off the record — that his superiors think I'm 'either the biggest threat to national security or the most important scientific mind alive.' He paused. 'Personally, I'm hoping it's the second one.' Then he left. I think we're friends now.",
    trigger: { type: "generatorOwned", genId: "reality", count: 3 },
    archetypeVariants: {
      megalomaniac: "Agent Reeves came by, off the record. Said his superiors can't decide if I'm a threat or an asset. I told him I'm both, and that when I'm done, the distinction won't matter. He wrote that down. I probably shouldn't have said it out loud.",
    },
  },

  // ── Self-Awareness Moments ────────────────────────────────────────

  {
    id: "self_aware_mirror",
    title: "Brief Clarity",
    body: "Caught my reflection in the containment chamber glass. Lab coat over pajamas. Safety goggles pushed up into hair that hasn't been combed in... a while. Holding something that was sparking. Thought: 'Is this normal?' Then the sparking thing beeped and I forgot the question.",
    trigger: { type: "generatorOwned", genId: "containment", count: 8 },
  },
  {
    id: "self_aware_grocery",
    title: "The Grocery Store Incident",
    body: "Went to the grocery store. Stood in the cereal aisle for twenty minutes trying to remember what normal people buy. Came home with fourteen boxes of baking soda, copper wire, and a watermelon. Linda asked about the watermelon. I don't have an answer for the watermelon.",
    trigger: { type: "clickCount", count: 5000 },
    archetypeVariants: {
      perfectionist: "Went to the grocery store. Reorganized the cereal aisle by nutritional density. The manager asked me to leave. I left a detailed report on their suboptimal shelf layout in the suggestion box. They'll thank me eventually.",
    },
  },
  {
    id: "self_aware_hobby",
    title: "Other People's Hobbies",
    body: "Doug was in his driveway building a birdhouse. A BIRDHOUSE. Four pieces of wood and some nails. It took him an afternoon and he seemed genuinely happy. I watched from behind my particle collider and felt... something. Envy? No. Confusion. How can a birdhouse be ENOUGH?",
    trigger: { type: "generatorOwned", genId: "collider", count: 8 },
  },
  {
    id: "self_aware_old_photo",
    title: "The Photo Album",
    body: "Linda left a photo album on my desk. Me at a barbecue. Me at a football game. Me asleep on a couch, looking peaceful. Normal things. I stared at it for a long time. Then I went back to calibrating the mind-link array. But I put the album on a shelf where I can see it. That counts for something.",
    trigger: { type: "generatorOwned", genId: "mindlink", count: 10 },
  },

  // ── Seasonal / Holiday Notes ──────────────────────────────────────

  {
    id: "holiday_christmas",
    title: "Christmas Lights",
    body: "Put up Christmas lights on the garage. They're powered by the containment chamber's auxiliary output. They shift through colors that don't have names and occasionally spell out equations in the air. Doug said they're 'actually pretty nice.' Linda said to turn them off before midnight. Max filmed a TikTok that got 2 million views.",
    trigger: { type: "generatorOwned", genId: "containment", count: 20 },
    archetypeVariants: {
      realityBreaker: "Put up Christmas lights. They illuminate things in other dimensions now. The neighbors can see their houses as they exist in parallel timelines. Mrs. Patterson cried because in one timeline her dog is still alive. I should maybe tone them down.",
    },
  },
  {
    id: "holiday_halloween",
    title: "Halloween",
    body: "Didn't decorate for Halloween. Didn't need to. The garage does its own thing after dark now — the sounds, the lights, the occasional wisp of something from the containment vents. We got zero trick-or-treaters. The parents cross the street to avoid our house. Max thinks it's hilarious.",
    trigger: { type: "generatorOwned", genId: "prototype", count: 20 },
    archetypeVariants: {
      unhinged: "Turned the garage into a haunted house for Halloween. Real containment breaches. Actual unexplained phenomena. The kids loved it. Three parents fainted. Doug brought his kids over TWICE. Best Halloween on the block. Possibly too authentic.",
    },
  },
  {
    id: "holiday_bbq",
    title: "Summer Barbecue",
    body: "Hosted a neighborhood barbecue. Grilled burgers with a plasma torch because the propane ran out. They cooked in 0.003 seconds. Perfectly medium-rare throughout, which shouldn't be physically possible. Doug asked for the recipe. I said 'ionized hydrogen.' He nodded like that was a normal spice.",
    trigger: { type: "generatorOwned", genId: "server", count: 25 },
    archetypeVariants: {
      gadgeteer: "Hosted a barbecue. Built a grill from scratch using parts from seven different appliances. It rotates, self-bastes, monitors internal temperature to six decimal places, and plays smooth jazz. The burgers were fine. The GRILL is my masterpiece.",
    },
  },

  // ── Deep Generator Milestones ─────────────────────────────────────

  {
    id: "many_prototypes",
    title: "Mass Production",
    body: "Twenty-five prototype machines. They've started communicating with each other in ways I didn't program. Not concerning. Okay, slightly concerning. They seem to be arguing about optimal configurations. One of them is wrong. I won't say which one. They'll figure it out.",
    trigger: { type: "generatorOwned", genId: "prototype", count: 25 },
  },
  {
    id: "many_containment",
    title: "What's in the Boxes?",
    body: "Twenty-five containment chambers. My wife asked what's inside all of them. I said 'experiments.' She asked what kind. I said 'the contained kind.' She said if any of them get out, I'm sleeping in the garage. Joke's on her — I already sleep in the garage.",
    trigger: { type: "generatorOwned", genId: "containment", count: 25 },
    archetypeVariants: {
      unhinged: "Twenty-five containment chambers. I've lost track of which ones have things in them and which ones ARE things. Chamber 17 has started labeling itself. I respect the initiative.",
    },
  },
  {
    id: "many_colliders",
    title: "The Hum",
    body: "Fifty colliders running simultaneously. The hum is constant. It's not unpleasant — it's like the universe is purring. The neighbors have stopped complaining. I think they've just absorbed it into their baseline reality. Mrs. Patterson does yoga to it.",
    trigger: { type: "generatorOwned", genId: "collider", count: 50 },
  },
  {
    id: "many_mindlinks",
    title: "Crowded Head",
    body: "Twenty-five mind-link arrays. I can feel them all. Every data stream, every calculation, every stray electron. It's like having a conversation with a hundred versions of myself, all slightly smarter. Exhausting. Exhilarating. I need a nap but my brain won't stop doing calculus.",
    trigger: { type: "generatorOwned", genId: "mindlink", count: 25 },
    archetypeVariants: {
      megalomaniac: "Twenty-five mind-link arrays. I can feel the thoughts of everyone on the block. Doug is thinking about his lawn. Mrs. Patterson is thinking about her cat. Linda is thinking about me. They're ALL thinking about me, really. They just don't know it yet.",
    },
  },
  {
    id: "many_reality",
    title: "Version Control",
    body: "Fifty reality engines. I've started versioning them. Reality 1.0 through Reality 49.x. Some are stable. Some are experimental. Reality 23.7 is my favorite — the sky is slightly more purple and dogs can talk. Probably shouldn't ship that one.",
    trigger: { type: "generatorOwned", genId: "reality", count: 50 },
    archetypeVariants: {
      realityBreaker: "Fifty reality engines. I'm no longer editing reality — I'm AUTHORING it. Draft after draft, revision after revision. The original reality is somewhere in version control. Probably. I should check. Actually, does it matter?",
    },
  },
  {
    id: "many_cosmic",
    title: "The Loom Room",
    body: "Twenty-five Cosmic Looms. The garage has expanded to contain them, which is architecturally impossible but cosmically inevitable. Each one weaves a different thread of existence. Together they're making something. A pattern. I can almost see what it is. It might be a sweater. A very, very complex sweater.",
    trigger: { type: "generatorOwned", genId: "cosmic", count: 25 },
  },

  // ── Event-Triggered Notes ─────────────────────────────────────────

  {
    id: "event_doug_invited",
    title: "The Tour",
    body: "Gave Doug the full tour. He touched nothing. Said nothing. Stood very still in front of the containment chamber for a full minute. When he left, he said 'Okay, Gary.' Just that. 'Okay, Gary.' I think we've reached an understanding.",
    trigger: { type: "clickCount", count: 999999999 }, // unlocked by event, not by trigger
  },
  {
    id: "event_linda_truth",
    title: "The Truth",
    body: "I told Linda everything. The notebooks, the equations, the things that glow. She listened. She asked good questions. She said 'Gary, I don't understand all of it. But I understand YOU.' Then she asked me to move the glowing thing out of the bedroom. Fair.",
    trigger: { type: "clickCount", count: 999999999 },
  },
  {
    id: "event_max_science_fair",
    title: "Like Father, Like Son",
    body: "Helped Max build a proper volcano for the fair. Baking soda and vinegar. Nothing fancy. Except I may have calibrated the chemical ratios a bit too precisely. The lava flow was geometrically perfect. The judges gave him first place and a look that said 'we have questions for your father.'",
    trigger: { type: "clickCount", count: 999999999 },
  },
  {
    id: "event_power_generator",
    title: "Off the Grid",
    body: "Built my own power generator from spare parts. It runs on a principle I haven't named yet because the existing words aren't accurate enough. The electric company sent someone to investigate why our meter is running backwards. I offered him a tour. He declined.",
    trigger: { type: "clickCount", count: 999999999 },
  },
  {
    id: "event_weird_noise",
    title: "The Frequency",
    body: "Isolated the sound from the collider. It's not random — it's a pattern. Specifically, it's the first forty digits of pi played at a frequency that shouldn't exist. I have no idea why the collider knows pi. I certainly didn't teach it.",
    trigger: { type: "clickCount", count: 999999999 },
  },
  {
    id: "event_collider_music",
    title: "The Collider Concerto",
    body: "Tuned the collider's harmonic output into something resembling music. It plays in a key that doesn't exist on any piano. The cat came back when I played it. She sat on the collider and purred in harmony. We're a duet now.",
    trigger: { type: "clickCount", count: 999999999 },
  },
  {
    id: "event_reeves_tour",
    title: "Agent Reeves: The Tour",
    body: "Gave Agent Reeves the full tour. He wrote nothing down. His pen stopped working near the collider. His phone stopped working near the mindlink. By the time we reached the reality engine, he just stood there. 'Mr. Flemming,' he said. 'I'm going to recommend we leave you alone.' Best tour review I've ever gotten.",
    trigger: { type: "clickCount", count: 999999999 },
  },
  {
    id: "event_linda_promise",
    title: "The Promise",
    body: "Told Linda I'd dial it back. Meant it, too. Came back inside. Had dinner. Watched TV. Fell asleep on the couch like a normal person. Woke up at 3 AM in the garage with no memory of walking there. The notebooks were open. Some things are harder to stop than others.",
    trigger: { type: "clickCount", count: 999999999 },
  },
  {
    id: "event_linda_lab",
    title: "Linda's Lab",
    body: "Built Linda her own lab. She's using it to catalog everything I've done — every experiment, every result, every explosion. She's organized it all into color-coded binders. She's a better scientist than me. She's just more organized about it. Our anniversary dinner was in the containment room. Romantic.",
    trigger: { type: "clickCount", count: 999999999 },
  },
  {
    id: "event_break_physics",
    title: "Physics: Revised Edition",
    body: "I didn't just break physics. I rewrote the manual. Chapter 1 is the same — gravity still works, apples still fall. But Chapter 47 is new. Chapter 47 is mine. It describes things that have never existed before today. The peer review process is going to be... interesting.",
    trigger: { type: "clickCount", count: 999999999 },
  },
  {
    id: "event_max_refused",
    title: "Good Dad Moment",
    body: "Told Max no. He can't use the Mind-Link Array. He's eleven. He pouted. I held firm. Linda gave me a look that said 'good call.' First time in months I've felt like a responsible parent. The feeling lasted about twenty minutes before I went back to my particle collider. But twenty minutes counts.",
    trigger: { type: "clickCount", count: 999999999 },
  },
  {
    id: "event_the_snap",
    title: "The Coffee Mug",
    body: "Held my coffee mug — 'World's Okayest Scientist' — and for one second I saw myself clearly. Not the lab coat version. Not the one who talks to equipment. The real one. The one who used to just be a dad. The clarity was painful and precious. I put the mug on a high shelf. I'll look at it again. Someday.",
    trigger: { type: "clickCount", count: 999999999 },
  },
  {
    id: "event_doug_partner",
    title: "Henderson Ventures",
    body: "Doug is my business partner now. He handles 'the money stuff.' I handle 'the science stuff.' Our first board meeting was in my garage. He brought a PowerPoint. I brought a prototype that levitates. His PowerPoint was better organized. We complement each other. Flemming-Henderson Labs. Has a ring to it.",
    trigger: { type: "clickCount", count: 999999999 },
  },

  // ── Phase 7-9 Event-Triggered Notes ────────────────────────────────

  {
    id: "event_inspector_tour",
    title: "The Inspector's Report",
    body: "The building inspector filed his report. It was three pages long and ended with the sentence: 'Structure appears to exist in compliance with at least four of the six known dimensions.' He's enrolled in night school now. Physics. I sent him a textbook. He sent back corrections.",
    trigger: { type: "clickCount", count: 999999999 },
  },
  {
    id: "event_underground_find",
    title: "What Was Already There",
    body: "Whatever we found below level three wasn't something I built. It was already there. Ancient. Patient. Humming in a frequency that predates electricity. I don't know what it is. But it knows what I am. We've reached an arrangement. I don't ask questions. It provides answers. Neither of us discusses the terms.",
    trigger: { type: "clickCount", count: 999999999 },
  },
  {
    id: "event_block_party_normal",
    title: "Almost Normal",
    body: "Went to the block party. Ate a hot dog. Talked about the weather. Didn't mention science once. Duration: 47 minutes. Linda says she's proud of me. Doug says I seemed 'almost normal.' I'll take it. Almost normal is my best result in months.",
    trigger: { type: "clickCount", count: 999999999 },
  },
  {
    id: "event_patterson_past",
    title: "Mrs. Patterson's Fermilab Days",
    body: "Mrs. Patterson worked at Fermilab from 1972 to 1985. She specialized in containment field harmonics. She published seventeen papers. She left to raise her children and bake cookies. 'I don't regret it,' she said. 'But sometimes, when I hear your collider through the walls, I remember what it felt like to push the boundaries.' She pushed them further than I realized.",
    trigger: { type: "clickCount", count: 999999999 },
  },
  {
    id: "event_reeves_data",
    title: "The Nevada Files",
    body: "Read the classified files. Sixty years of research. Billions of dollars. Teams of the world's best scientists. And they couldn't do what I did in a garage with a soldering iron and a dream. Not because they weren't smart. Because they weren't desperate. Desperation is the mother of invention. Garages are its nursery.",
    trigger: { type: "clickCount", count: 999999999 },
  },
  {
    id: "event_post_ascension",
    title: "The Empty Garage",
    body: "After my first ascension, the garage was empty. Completely empty. No generators, no equipment, no corkboard. Just concrete and a single light bulb. I stood there for an hour. Not sad. Not happy. Just... aware. I could see every version of this room. Every build, every prestige, every iteration. All at once. And then I picked up a notebook. And started again.",
    trigger: { type: "clickCount", count: 999999999 },
  },
  {
    id: "event_cosmic_view",
    title: "Pale Blue Garage",
    body: "Saw the Earth from orbit today. Found my street. Found my house. Found my garage. From up here, it's a tiny speck on a tiny ball in a vast, indifferent universe. But that speck has a collider. And a cosmic loom. And a man in a lab coat who hasn't given up. The universe isn't indifferent. It's just waiting to see what happens next.",
    trigger: { type: "clickCount", count: 999999999 },
  },
  {
    id: "event_go_home",
    title: "Dinner at Home",
    body: "Came home from the orbital platform. Made spaghetti. Helped Max with fractions. Watched a documentary about penguins with Linda. Normal evening. Except for the part where I commuted from space. And the part where the spaghetti sauce was molecular-gastronomy perfect. And the part where Max solved the fractions using quantum arithmetic. Normal is relative. Like everything else, apparently.",
    trigger: { type: "clickCount", count: 999999999 },
  },

  // ── Post-Prestige Depth ───────────────────────────────────────────

  {
    id: "second_prestige",
    title: "Deja Vu, Specifically",
    body: "Second time through. Everything feels familiar. The notebook, the soldering iron, the smell of possibility. But this time I know where the dead ends are. This time I have a MAP. It's in my head and it's written in a language I invented, but it's a map.",
    trigger: { type: "prestigeCount", count: 2 },
  },
  {
    id: "seventh_prestige",
    title: "The Routine of Rebirth",
    body: "Seven resets. Linda doesn't even blink anymore when I dismantle everything. She just moves the good china out of the blast radius and says 'see you on the other side, honey.' Married to this woman for fifteen years and she still surprises me. With her patience, mostly.",
    trigger: { type: "prestigeCount", count: 7 },
    archetypeVariants: {
      perfectionist: "Seven resets. Each one more precise than the last. My rebuild time is down to 94% efficiency. I've documented every iteration in triplicate. Reset 4 was sloppy — don't like to talk about Reset 4. Reset 7 will be definitive. Probably.",
    },
  },
  {
    id: "tenth_prestige",
    title: "Double Digits",
    body: "Ten resets. I've destroyed and rebuilt my life's work ten times. Normal people would call that insanity. But normal people haven't seen what I've seen at the top. The view from the peak — just before you tear it all down — is the most beautiful thing in any reality. And I would know. I've checked several.",
    trigger: { type: "prestigeCount", count: 10 },
  },
  {
    id: "fifteenth_prestige",
    title: "Gary Was Here",
    body: "Fifteen. Found a note scratched into the workbench: 'GARY WAS HERE — GARY WILL BE HERE AGAIN.' My handwriting. Don't remember writing it. But past-Gary was right. Past-Gary is always right. Present-Gary just has to catch up.",
    trigger: { type: "prestigeCount", count: 15 },
    archetypeVariants: {
      accidentalGenius: "Fifteen resets. Found notes from previous versions of myself. Most are gibberish. One is a shopping list. One is a breakthrough in quantum mechanics, written on a napkin, stained with mustard. I have no memory of the mustard or the breakthrough.",
    },
  },
  {
    id: "twentieth_prestige",
    title: "What the Garage Remembers",
    body: "Twenty resets. The garage remembers now, even when I don't. Tools arrange themselves where they need to be. The workbench has grooves worn by twenty lifetimes of the same hands. I'm not starting over anymore. I'm continuing. I always was. The pauses just help me breathe.",
    trigger: { type: "prestigeCount", count: 20 },
  },

  // ── Research Tree Notes ───────────────────────────────────────────

  {
    id: "first_research",
    title: "The Corkboard",
    body: "Started a corkboard today. Strings connecting ideas. Red string for causation, blue for correlation, green for 'I have a feeling.' Linda saw it and asked if I was solving a crime. I said 'the crime of insufficient knowledge.' She walked away. But she didn't take down the corkboard.",
    trigger: { type: "researchCompleted", nodeId: "faster_writing" },
  },
  {
    id: "research_branching",
    title: "Forking Paths",
    body: "Hit a fork in my research today. Two paths, both promising, but I can only walk one at a time. This is what they don't tell you about science — it's not about finding answers. It's about choosing which questions to ignore. For now.",
    trigger: { type: "researchCompleted", nodeId: "advanced_metallurgy" },
  },
  {
    id: "autobuyer_unlocked",
    title: "Automated Procurement",
    body: "The lab buys its own supplies now. I set up an auto-purchasing protocol and went to bed. Woke up to 47 packages on the doorstep. Amazon driver left a note: 'Please get a loading dock.' I'm considering it.",
    trigger: { type: "researchCompleted", nodeId: "autobuyer_protocol" },
  },
  {
    id: "ip_generation",
    title: "Insight Points",
    body: "I've started quantifying my insights. Every second of production generates a tiny flash of understanding — barely a spark, but they accumulate. I call them Insight Points. Linda calls them 'the reason you stare at walls.' Both descriptions are accurate.",
    trigger: { type: "labLevel", level: 0 },
    archetypeVariants: {
      perfectionist: "Insight Points. I've devised a metric for measuring intuitive leaps. Each flash of understanding is categorized, weighted, and filed. The filing system has its own filing system. I've never been happier.",
      accidentalGenius: "Started getting these little flashes. Like knowing something without knowing why you know it. I tried to write them down but my hand moved before my brain decided what to write. The result was still correct. Worrying.",
    },
  },
  {
    id: "quantum_research",
    title: "Quantum Steps",
    body: "Quantum computing isn't computing. It's asking reality very politely to calculate things for you. And reality, it turns out, is quite amenable to requests. More so than my family, at least. The qubits respond to my intentions before I type the commands. Gerald says this is 'expected behavior.' Gerald would say that.",
    trigger: { type: "researchCompleted", nodeId: "quantum_computing" },
  },

  // ── Lab Expansion Notes ───────────────────────────────────────────

  {
    id: "lab_basement",
    title: "Going Underground",
    body: "Expanded into the basement today. Linda's wine collection has been relocated to the guest room. She's not happy. But the basement has better humidity control for the equipment. I offered to temperature-regulate her wine as compensation. She said 'that's not the point, Gary.' The point, as far as I can tell, is that I should have asked first.",
    trigger: { type: "labLevel", level: 1 },
  },
  {
    id: "lab_warehouse",
    title: "The Warehouse",
    body: "Rented a warehouse downtown. Told Linda it was a storage unit. She asked how big. I said 'adequate.' It's 12,000 square feet. Doug offered to help me move equipment. He carried one box, said 'this is heavier than my car,' and sat down for the rest of the afternoon. But he stayed. That counts for something.",
    trigger: { type: "labLevel", level: 2 },
  },
  {
    id: "lab_underground",
    title: "Below Everything",
    body: "The underground facility is complete. Three stories below the garage. The neighbors think I'm installing a pool. It's not a pool. Although floor B3 does have standing water that glows faintly blue. I'm not sure that helps the pool cover story but Linda suggests I lean into it.",
    trigger: { type: "labLevel", level: 3 },
    archetypeVariants: {
      megalomaniac: "The underground facility is mine. THREE STORIES of pure potential, carved from the bedrock by machines I built from machines I built from scratch. Doug asked if I needed a permit. I AM the permit now.",
      realityBreaker: "Dug the facility, but the third floor was already there when we reached it. As if reality had been saving the space for me. The walls have equations I haven't written yet. They're correct. All of them.",
    },
  },
  {
    id: "lab_orbital",
    title: "Eyes Above",
    body: "Orbital platform operational. I can see the garage from here. It looks so small from orbit — a tiny box on a tiny street in a tiny town. But inside it, and below it, and now above it, is everything I've ever built. Linda waved at the sky tonight. She knew exactly where to look. I waved back, even though she couldn't see me. She probably knew that too.",
    trigger: { type: "labLevel", level: 4 },
  },

  // ── Challenge Notes ───────────────────────────────────────────────

  {
    id: "first_challenge",
    title: "Self-Imposed Limits",
    body: "Tried working with restrictions today. One generator type only. It felt like boxing with one hand tied behind my back. But here's the thing — the hand that WAS free got stronger. Limitation breeds innovation. Or frustration. Sometimes they're the same thing.",
    trigger: { type: "challengesCompleted", count: 1 },
  },
  {
    id: "challenge_no_click",
    title: "Hands Off",
    body: "Completed a full run without clicking once. Just sat and watched the machines work. It was meditative. Peaceful, even. The generators hummed, the numbers climbed, and I did nothing. Linda found me staring at the screen. 'Are you okay?' she asked. 'I'm learning patience,' I said. 'That's the most concerning thing you've ever said,' she replied.",
    trigger: { type: "challengesCompleted", count: 3 },
  },
  {
    id: "challenge_mastery",
    title: "Every Constraint",
    body: "Ten challenges completed. Each one taught me something different about how science works under pressure. Speed runs taught me efficiency. Minimalism taught me resourcefulness. The archetype challenges taught me that I contain multitudes. Gary Flemming: suburban dad, garage scientist, master of all limitations except his own ambition.",
    trigger: { type: "challengesCompleted", count: 10 },
    archetypeVariants: {
      perfectionist: "Ten challenges, each completed within optimal parameters. I created a spreadsheet tracking my efficiency across every restriction type. Linda found the spreadsheet and asked why it had forty-seven tabs. Because forty-six wasn't enough.",
      unhinged: "Ten challenges done. The restrictions didn't restrict me — they redirected me. Like putting a funnel on a firehose. The pressure just made everything go further. And faster. And louder. Doug filed a noise complaint for a challenge I did SILENTLY. Impressive.",
    },
  },

  // ── Specialization Notes ──────────────────────────────────────────

  {
    id: "first_specialization",
    title: "Choosing a Path",
    body: "Specialized today. Committed to a path. It felt like choosing a major in college, if your major could bend reality and your college was a garage. There's no going back now. Well, there's prestige. But that's different. That's strategic. This is personal.",
    trigger: { type: "madnessLevel", level: 4 },
  },

  // ── Neighborhood Notes ────────────────────────────────────────────

  {
    id: "doug_warming",
    title: "Doug Comes Around",
    body: "Doug brought me coffee today. Just showed up at the garage with two mugs. 'I figured you'd be up,' he said at 6 AM. We stood in the driveway and drank in silence, looking at the sunrise. He didn't file a single complaint. Progress.",
    trigger: { type: "relationshipLevel", npcId: "doug", level: 3 },
  },
  {
    id: "doug_partner",
    title: "Henderson Ventures",
    body: "Doug's in. Full partner. He doesn't understand the science but he understands spreadsheets, and apparently my budget had seventeen 'critical errors.' His words. He's reorganized my supply chain. The Amazon driver sent a thank-you card. To Doug.",
    trigger: { type: "relationshipLevel", npcId: "doug", level: 7 },
  },
  {
    id: "linda_research",
    title: "Couple's Research",
    body: "Linda joined me in the lab tonight. She didn't say anything for an hour, just watched. Then she pointed at my equation board and said 'the sign is wrong on line four.' She was right. She went back to reading her book. I fixed the equation. We didn't discuss it. Best collaboration I've ever had.",
    trigger: { type: "relationshipLevel", npcId: "linda", level: 5 },
  },
  {
    id: "linda_full_partner",
    title: "The Flemmings",
    body: "Linda has her own station now. She approaches everything differently — more carefully, more thoughtfully, less likely to accidentally create plasma. Our output has doubled. Max says we're 'being weird' about science. He's not wrong. But weird is what got us here.",
    trigger: { type: "relationshipLevel", npcId: "linda", level: 10 },
  },
  {
    id: "max_apprentice",
    title: "Like Father, Like Son",
    body: "Max asked to help in the lab today. Not for school, not for fun — because he wants to understand. He looked at the corkboard and asked why the red strings stop at certain nodes. I told him those are the questions I haven't answered yet. He said 'Can I try?' He got one right. He's eleven.",
    trigger: { type: "relationshipLevel", npcId: "max", level: 5 },
  },
  {
    id: "reeves_ally",
    title: "Agent of Change",
    body: "Reeves stopped by. Off duty. In a polo shirt. He looked uncomfortable without the suit. He brought beer and what turned out to be a DARPA research proposal with my name already on it. 'Just sign it,' he said. 'I'll handle the paperwork.' I signed it. He smiled. I've never seen him smile before.",
    trigger: { type: "relationshipLevel", npcId: "reeves", level: 7 },
  },
  {
    id: "patterson_cookies",
    title: "The Cookie Protocol",
    body: "Mrs. Patterson's cookies arrive at 3 PM sharp. Always warm. Always perfect. The chocolate chip ones make me work 12% faster — I measured. She says the secret ingredient is love. I suspect it's also vanilla extract and a very precise oven. Either way, they're essential to the research now.",
    trigger: { type: "relationshipLevel", npcId: "patterson", level: 5 },
  },
  {
    id: "chen_collaboration",
    title: "Academic Bridge",
    body: "Professor Chen visited again. She brings questions from her students and leaves with answers that 'shouldn't be possible.' Her words. She's the bridge between my garage and the academic world — translating my scrawled equations into publishable papers. She told me I've inadvertently advanced three different fields. I asked which ones. She said I probably invented a fourth.",
    trigger: { type: "relationshipLevel", npcId: "chen", level: 7 },
  },

  // ── Ascension Notes ───────────────────────────────────────────────

  {
    id: "first_ascension",
    title: "The Thesis",
    body: "Defended my thesis today. Not to a committee — to the universe itself. I laid out everything I've learned across every run, every prestige, every breakthrough and failure. The universe listened. Then it reset everything. Again. But this time, it gave me something back. A point. A single Thesis Point, crystallized from all that knowledge. It feels like a diploma made of starlight.",
    trigger: { type: "ascensionCount", count: 1 },
  },
  {
    id: "second_ascension",
    title: "PhD in Everything",
    body: "Second ascension. I've now reset reality twice, and each time it comes back... smoother. Like the universe is learning my preferences. The generators start faster. The research flows easier. It's as if all those previous runs left grooves in the fabric of things. Wheel ruts on a road I keep traveling.",
    trigger: { type: "ascensionCount", count: 2 },
  },
  {
    id: "fifth_ascension",
    title: "Tenured",
    body: "Five ascensions. I'm tenured now — not by any institution, but by existence itself. The universe knows my name. It sets up the variables before I arrive. The garage is waiting for me each time, tools laid out in the order I'll need them. Linda asked if I'm happy. I said 'I'm iterating.' She said that wasn't what she asked. She's right. Yes. I'm happy.",
    trigger: { type: "ascensionCount", count: 5 },
    archetypeVariants: {
      megalomaniac: "Five ascensions. I don't serve the universe anymore. The universe serves ME. Each reset is an optimization pass, and I'm the optimizer. The thesis committee — if such a thing exists — works for me now. Reality itself is my research assistant.",
      accidentalGenius: "Five ascensions and I still don't know how I'm doing this. Each time, I stumble through in a slightly different order, trip over different breakthroughs, and somehow end up with more knowledge than before. It's like falling up stairs. Repeatedly. On purpose? I'm honestly not sure.",
    },
  },
  {
    id: "tenth_ascension",
    title: "Beyond the Garage",
    body: "Ten ascensions. I've lost count of how many times I've rebuilt everything. But each time, it matters less what I build and more that I build it. The garage is a metaphor now — a metaphor for the human capacity to start over, to learn, to grow. Also it's literally a garage. With a collider. And an orbital platform. The metaphor has limits.",
    trigger: { type: "ascensionCount", count: 10 },
  },

  // ── Secret Lore: The Predecessor (Dr. Harold Voss) ──────────────

  {
    id: "secret_voss_scratches",
    title: "The Scratches",
    body: "Found scratches under the workbench today. Deep ones — not from dragging equipment. Letters. Initials: H.V. Whoever carved these was here a long time. Long enough to leave a mark. I wonder if I will too.",
    trigger: { type: "generatorOwned", genId: "notebook", count: 250 },
  },
  {
    id: "secret_voss_compartment",
    title: "The Hidden Compartment",
    body: "Moved the soldering stations to rewire the east wall and found a compartment. Someone cut a perfect rectangle into the drywall and fitted it with a latch. It was empty. But the dust pattern says it wasn't empty for long. Someone cleaned it out recently. Not me.",
    trigger: { type: "generatorOwned", genId: "soldering", count: 200 },
  },
  {
    id: "secret_voss_journal_1",
    title: "Voss's Journal, Page 1",
    body: "A journal page fell from behind the server rack when I pulled it out for maintenance. Yellowed paper, careful handwriting. 'Day 1: The garage calls to me. I know how that sounds. But the equations only work HERE. In the kitchen — nothing. In the office — nothing. But in the garage, the numbers sing.' Dated March 3, 1979.",
    trigger: { type: "generatorOwned", genId: "server", count: 250 },
    archetypeVariants: {
      perfectionist: "A journal page fell from behind the server rack. I've catalogued it, photographed it, and placed it in an acid-free sleeve. The handwriting is meticulous — whoever wrote this was methodical. 'Day 1: The garage calls to me.' Dated March 3, 1979. I need to find the other pages.",
    },
  },
  {
    id: "secret_voss_journal_47",
    title: "Voss's Journal, Page 47",
    body: "Found another page wedged behind the chemistry station. Page 47. 'The compounds arrange themselves. I'm not mixing them anymore. They're mixing me. I set up a blind experiment — left reagents on the bench overnight. By morning, they'd combined. Perfectly. The garage is helping.' This man was either brilliant or delusional. I'm not sure those are different things anymore.",
    trigger: { type: "generatorOwned", genId: "chemistry", count: 200 },
    archetypeVariants: {
      unhinged: "Page 47 of the mystery journal. 'The compounds arrange themselves. I'm not mixing them anymore. They're mixing me.' YES. Finally, someone who GETS it. This Voss person understood — you don't control the science. You surrender to it. I left my own reagents out tonight. Just to see.",
    },
  },
  {
    id: "secret_voss_journal_112",
    title: "Voss's Journal, Page 112",
    body: "Page 112, tucked inside a prototype housing I've never opened before. 'The machines work before I turn them on. I think the house knows what I need before I need it. Yesterday I reached for a wrench and it was already in my hand. I don't remember picking it up.' I've been telling myself my prototypes are well-engineered. But some of them... some of them started working before I finished building them.",
    trigger: { type: "generatorOwned", genId: "prototype", count: 100 },
  },
  {
    id: "secret_voss_journal_238",
    title: "Voss's Journal, Page 238",
    body: "Page 238. The handwriting is shaking now. 'They came today. The woman from the project — Patterson — she tried to warn me. Said I was moving too fast. Said the others moved too fast too. I asked what happened to the others. She wouldn't answer. Too late for warnings. The work is almost done.' Patterson. My neighbor Mrs. Patterson?",
    trigger: { type: "generatorOwned", genId: "containment", count: 100 },
    archetypeVariants: {
      megalomaniac: "Page 238. Voss was warned by someone named Patterson and he LISTENED? He slowed down? That's why he failed. You don't negotiate with progress. You don't ask permission from old women with clipboards. My neighbor Patterson keeps watching my garage. Let her watch.",
    },
  },
  {
    id: "secret_voss_journal_final",
    title: "Voss's Journal, Final Entry",
    body: "The last page. No number. The handwriting barely legible. 'I can see through the walls now. Not metaphorically. The anomaly has opened. The light isn't light — it's information. Pure, raw, beautiful information. I'm going in. Tell Margaret I—' The sentence ends there. No period. No closure. Just a dash and silence. Who was Margaret? What did he see? What happened to Harold Voss?",
    trigger: { type: "generatorOwned", genId: "collider", count: 50 },
    archetypeVariants: {
      realityBreaker: "The final page. 'I can see through the walls now. Not metaphorically. The anomaly has opened.' He saw it. The membrane between what IS and what COULD BE. And he walked through. I would have done the same. I WILL do the same. The only question is when.",
    },
  },
  {
    id: "secret_voss_photograph",
    title: "The Photograph",
    body: "Found a photograph behind the drywall during renovations. Polaroid. A man standing in this garage — MY garage — surrounded by equipment I recognize. Not the same models, but the same types. Notebooks. Soldering irons. A primitive server. He's smiling. Written on the back in faded ink: 'Almost there. -H.V. 1986.' He was so close. What stopped him?",
    trigger: { type: "prestigeCount", count: 15 },
  },

  // ── Secret Lore: Project CHRYSALIS ──────────────────────────────

  {
    id: "secret_chrysalis_badge",
    title: "The Faded Badge",
    body: "Mrs. Patterson handed me something today. An old laminated badge, the photo bleached nearly white. CHRYSALIS PROJECT. DIRECTOR. Clearance: ULTRAVIOLET. Her name. Her face, decades younger. 'I wasn't always a retired schoolteacher, Gary,' she said. Then she went back to her garden.",
    trigger: { type: "relationshipLevel", npcId: "patterson", level: 8 },
  },
  {
    id: "secret_chrysalis_report",
    title: "Chrysalis Report Fragment",
    body: "During the underground lab excavation, the diggers hit something. A concrete-sealed document tube, military grade. Inside: a partial report, stamped 1963, half the pages rotted. What survived was enough. CHRYSALIS was studying 'localized reality softening' — places where physical constants become... suggestions. They found one such place. This place.",
    trigger: { type: "labLevel", level: 3 },
  },
  {
    id: "secret_chrysalis_hypothesis",
    title: "The Chrysalis Hypothesis",
    body: "I've been cross-referencing my research with the CHRYSALIS fragments for weeks. Their hypothesis: certain locations act as 'thin spots' where the rules of physics are negotiable. Not broken — negotiable. Like the universe left certain doors unlocked. My garage is sitting on top of an unlocked door. And I've been turning the handle.",
    trigger: { type: "researchCompleted", count: 30 },
    archetypeVariants: {
      perfectionist: "I've spent three weeks cross-referencing every surviving CHRYSALIS data point with my own measurements. The correlation is 0.997. Their hypothesis about 'thin spots' is correct — but their model was incomplete. Mine isn't. I've derived the full equation. The universe left certain doors unlocked. I've mapped every hinge.",
    },
  },
  {
    id: "secret_chrysalis_memo",
    title: "Redacted Memo",
    body: "Reeves 'accidentally' left a memo on my workbench. Government letterhead. Most of it blacked out with heavy marker. What's visible: 'SUBJECT: Elm Street Nexus... RECOMMENDATION: Maintain civilian cover... PROTECT the current occupant at all costs...' I am the current occupant. Reeves is protecting me. From what?",
    trigger: { type: "relationshipLevel", npcId: "reeves", level: 7 },
  },
  {
    id: "secret_chrysalis_confession",
    title: "Patterson's Confession",
    body: "'We found seven sites worldwide,' she said, her tea going cold. 'Places where reality thins. Elm Street was the strongest. We built the neighborhood to hide it. Populated it with normal families to dilute the signal. But someone always finds their way to the garage.' She looked at me with something between pride and grief. 'You're the seventh to try. You're the first to get this far.'",
    trigger: { type: "relationshipLevel", npcId: "patterson", level: 9 },
  },
  {
    id: "secret_chrysalis_list",
    title: "The List",
    body: "Mrs. Patterson handed me a list. Seven names. Seven addresses. All cul-de-sacs. All had a 'garage scientist.' Voss was number six. I'm number seven. The first five names are crossed out. Not retired. Not moved away. Crossed out. 'What happened to them?' I asked. She shook her head. 'The anomaly gives, Gary. But it also takes.'",
    trigger: { type: "relationshipLevel", npcId: "patterson", level: 10 },
  },
  {
    id: "secret_chrysalis_purpose",
    title: "The Real Purpose of the Lab",
    body: "Three ascensions deep and I finally understand. The garage, the generators, the Research Points — it's not research. It's a KEY. Every experiment turns the lock a little further. Every generator adds another tumbler. I'm not discovering anything. I'm opening something. And whatever is on the other side has been waiting a very long time.",
    trigger: { type: "ascensionCount", count: 3 },
    archetypeVariants: {
      realityBreaker: "Three ascensions. Three turns of the key. The garage isn't a lab — it's a LOCK, and I'm the mechanism that turns it. Every experiment weakens the barrier. Every generator thins the wall. I'm not afraid. I'm EAGER. Whatever is on the other side — it's been calling to me since Day One.",
      accidentalGenius: "Three ascensions and it just hit me — I've been accidentally picking a lock this whole time? The generators aren't generators. The experiments aren't experiments. This whole setup is some kind of cosmic door mechanism and I've been fumbling with it like a kid with a Rubik's cube. Except somehow it's working?",
    },
  },

  // ── Secret Lore: The Elm Street Anomaly ─────────────────────────

  {
    id: "secret_anomaly_hum",
    title: "The Hum",
    body: "At 25 colliders, the hum is constant. Low, resonant, felt more in the chest than heard with the ears. But here's the thing — I checked the recordings from before the colliders were installed. The hum is there. Fainter, but there. It's been here for decades. Maybe longer. The colliders didn't create it. They're harmonizing with it.",
    trigger: { type: "generatorOwned", genId: "collider", count: 25 },
  },
  {
    id: "secret_anomaly_gravity",
    title: "Gravity Glitch",
    body: "My coffee floated today. Just hung there, mid-air, steam rising sideways. I assumed it was the reality engines — some kind of localized gravity distortion. Then I checked the logs. The reality engines weren't running. They've been off for maintenance since Tuesday. The coffee floated on its own. The GARAGE floated the coffee.",
    trigger: { type: "generatorOwned", genId: "reality", count: 10 },
    archetypeVariants: {
      unhinged: "My coffee floated today and I was DELIGHTED. Not because of the physics implications — because I didn't have to reach for it. The garage is learning to SERVE. Good garage. Next I want it to pre-heat my solder. And maybe open a portal to dimensions unknown. In that order.",
    },
  },
  {
    id: "secret_anomaly_soil",
    title: "The Soil Sample",
    body: "While digging the basement expansion, I pulled up a soil sample from eight feet down. Sent it to three different labs. All three called back confused. The mineral composition doesn't match any known geological era. Not Holocene. Not Pleistocene. Not anything. One geologist asked if it was extraterrestrial. I said 'I don't think that's the right word.' I don't know what the right word is.",
    trigger: { type: "labLevel", level: 1 },
  },
  {
    id: "secret_anomaly_signal",
    title: "The Pattern in the Static",
    body: "At 500 servers, the processing power is absurd. Which is why I noticed the signal. Not from the internet. Not from any satellite or radio source I can identify. It's coming from BELOW. From deep below the foundation. It's structured — not random noise. It repeats every 42.7 seconds. I've been listening for three hours. It hasn't missed a beat. Something down there is broadcasting. And it's been broadcasting for a very long time.",
    trigger: { type: "generatorOwned", genId: "server", count: 500 },
  },
  {
    id: "secret_anomaly_temperature",
    title: "The Temperature Map",
    body: "Mapped the garage temperature at quantum resolution using the mindlinks. There's a point — exactly 1.3 meters from the east wall, 2.1 meters from the north wall — that is precisely 0.001 degrees Celsius warmer than its surroundings. Always. With everything on. With everything off. At noon. At midnight. In summer. In winter. It's a point source. It's below the foundation. And it's perfectly, impossibly constant.",
    trigger: { type: "generatorOwned", genId: "mindlink", count: 25 },
  },
  {
    id: "secret_anomaly_wall",
    title: "The Basement Wall",
    body: "In the warehouse sublevel, found markings on the concrete that I didn't put there. A spiral. Tight at the center, widening outward. The same spiral that was scratched into Voss's workbench. The same spiral on Patterson's CHRYSALIS badge. The same spiral I've been unconsciously doodling in the margins of my notebooks for months. It means something. I think it means 'here.'",
    trigger: { type: "labLevel", level: 2 },
  },
  {
    id: "secret_anomaly_below",
    title: "What's Below",
    body: "Chen showed me the orbital imaging data. From space, the anomaly is visible in the right spectrum. A perfect circle, 47 meters in diameter, centered on my garage. It pulses — slow, rhythmic, patient. Geological surveys show it predates the neighborhood. Predates the city. Predates the oldest human settlement on this continent. It was here before us. It will be here after us. And right now, it's paying attention.",
    trigger: { type: "labLevel", level: 4 },
    archetypeVariants: {
      megalomaniac: "47 meters. A perfect circle. Centered on MY garage. Not Patterson's house. Not Chen's office. MY garage. The anomaly chose ME. It's been waiting — centuries, millennia — for someone worthy. And here I am. You're welcome, ancient cosmic phenomenon.",
    },
  },

  // ── Secret Lore: Agent Reeves & The Watchers ────────────────────

  {
    id: "secret_reeves_others",
    title: "The Other Agents",
    body: "Saw Reeves arguing with someone in the cul-de-sac today. Different suit — darker, better tailored, government-issue. They exchanged words I couldn't hear. The other man drove away in a black sedan. Reeves stood there for a long time, staring at nothing. When he finally turned around, he looked... relieved. Like he'd won an argument he wasn't sure he could win.",
    trigger: { type: "relationshipLevel", npcId: "reeves", level: 5 },
  },
  {
    id: "secret_reeves_surveillance",
    title: "The Surveillance Report",
    body: "Reeves showed me his monthly reports tonight. The ones he sends to whatever agency signs his checks. They're fiction. Brilliant fiction. He's been downplaying everything — my output, my breakthroughs, the anomalous readings. 'If they knew what you could actually do,' he said quietly, 'they wouldn't send me. They'd send a team. And the team wouldn't be here to protect you.'",
    trigger: { type: "relationshipLevel", npcId: "reeves", level: 8 },
  },
  {
    id: "secret_reeves_badge",
    title: "Reeves' Real Badge",
    body: "He showed me his real badge tonight. Not the one he flashes at the door — the real one. It doesn't say 'Department of Neighborhood Safety.' It says 'Division of Anomalous Containment — Field Protector.' Protector. Not Monitor. Not Enforcer. Not Handler. Protector. That one word changes everything about how I see the last year.",
    trigger: { type: "relationshipLevel", npcId: "reeves", level: 9 },
  },
  {
    id: "secret_reeves_previous",
    title: "The Previous Agents",
    body: "'There were agents before me,' Reeves said, nursing a beer on my workbench at 2 AM. 'The one assigned to Voss didn't protect him. Followed orders instead. Voss disappeared and the agent got a promotion.' He crushed the can. 'I won't make that mistake. You're not a subject, Gary. You're a person. And whatever's under this garage, it chose you for a reason.'",
    trigger: { type: "relationshipLevel", npcId: "reeves", level: 10 },
  },
  {
    id: "secret_reeves_warning",
    title: "The Warning",
    body: "Found a note in my mailbox this morning. No stamp. No return address. Plain white envelope, plain white paper, typed: 'They know about Elm Street. Move the research. You have less time than you think. — A Friend.' I showed it to Reeves. He didn't look surprised. He looked like he'd been expecting it. 'We need to talk,' he said.",
    trigger: { type: "challengesCompleted", count: 10 },
  },
  {
    id: "secret_reeves_faction",
    title: "The Faction",
    body: "Reeves introduced me to others tonight. A video call, faces in shadow, voices altered. Seven protectors, one for each nexus point. Each one assigned to a scientist. Each one filing fake reports. Each one risking their career — and more — to keep the anomalies safe from exploitation. 'Welcome to the family, Gary,' Reeves said. I didn't know I needed a family like this. But I do.",
    trigger: { type: "ascensionCount", count: 2 },
  },

  // ── Secret Lore: Max's Awakening ────────────────────────────────

  {
    id: "secret_max_drawing",
    title: "Max's Drawing",
    body: "Max drew a picture of my lab for a school art project. Crayons on construction paper. Normal kid stuff. Except he drew the containment chamber that I installed LAST WEEK, before he'd seen it. And he drew something in the basement that I haven't built yet. A spiral device. Surrounded by light. I put the drawing in my desk and tried not to think about it. I'm thinking about it.",
    trigger: { type: "relationshipLevel", npcId: "max", level: 5 },
  },
  {
    id: "secret_max_homework",
    title: "The Homework",
    body: "Max's math teacher called today. Not concerned, exactly. More... baffled. Max solved a differential equation on his homework using a method that 'doesn't exist yet.' Her words. The answer was correct. The work was shown. The technique was elegant. It just hasn't been invented. His teacher asked where he learned it. Max said, 'I dunno. It just made sense.' He's nine.",
    trigger: { type: "relationshipLevel", npcId: "max", level: 7 },
    archetypeVariants: {
      accidentalGenius: "Max's math teacher called. Apparently he solved a problem using a method that doesn't exist yet. Like father, like son, I guess — except he actually understands what he's doing. I think. Does he? Do I? The apple doesn't fall far from the tree, but in this family, the apples might be falling UP.",
    },
  },
  {
    id: "secret_max_repair",
    title: "Like Father, Like Son",
    body: "One of my generators was malfunctioning. Oscillating output, couldn't stabilize it. Max wandered in, looked at it for about ten seconds, and said, 'It's lonely, Dad.' Then he put his hand on it. The oscillation stopped. Output stabilized at 140% of rated capacity. He walked out to watch cartoons. I stood there for twenty minutes trying to understand what happened.",
    trigger: { type: "relationshipLevel", npcId: "max", level: 8 },
  },
  {
    id: "secret_max_inheritance",
    title: "The Inheritance",
    body: "'Dad,' Max said at breakfast, 'the house talks to me sometimes. Not with words. With... shapes? Like, I can feel where things are supposed to go. Is that normal?' No, buddy. That is not normal. Not anywhere else. But on Elm Street, in this house, above this anomaly — maybe it's the most natural thing in the world. Maybe you're not learning it. Maybe you were born knowing.",
    trigger: { type: "relationshipLevel", npcId: "max", level: 9 },
  },
  {
    id: "secret_max_potential",
    title: "Max's Potential",
    body: "I ran the numbers. Twice. Three times. Max's natural resonance with the anomaly — measured while he was asleep, so he wasn't consciously influencing anything — is 14 times stronger than mine. Fourteen. I need a garage full of generators to do what he does by existing. He doesn't need equipment. He IS the equipment. My son is a living nexus point. And he thinks he's just a normal kid.",
    trigger: { type: "relationshipLevel", npcId: "max", level: 10 },
  },
  {
    id: "secret_max_next_gen",
    title: "The Next Generation",
    body: "I asked Max to keep an eye on the experiments while I took a prestige break. Reset everything, started fresh. When I came back, Max had produced triple my output. In half the time. Using equipment he'd never been trained on. He's eleven years old. He asked if he did okay. I said yes. What I didn't say: at this rate, he won't need the garage. At forty, he might not need a planet.",
    trigger: { type: "prestigeCount", count: 20 },
    archetypeVariants: {
      megalomaniac: "Max outperformed me. My own son. Triple the output. I should feel threatened. I should feel diminished. Instead... I feel proud. Disgustingly, uncharacteristically proud. My legacy won't be the machines or the discoveries. It will be HIM. The anomaly chose well — not just me, but my bloodline.",
    },
  },

  // ── Secret Lore: Professor Chen & The Bigger Picture ────────────

  {
    id: "secret_chen_paper",
    title: "Chen's Real Paper",
    body: "Re-read Chen's published paper today. Really read it. Past the academic language, past the jargon, past the citations. It's not about theoretical physics. It's about MY physics. My generators. My formulas. My breakthroughs. Disguised, abstracted, but unmistakable. She knew about my work before she moved here. She's been studying me from orbit. The question is: why did she come down?",
    trigger: { type: "relationshipLevel", npcId: "chen", level: 5 },
  },
  {
    id: "secret_chen_satellite",
    title: "The Satellite Data",
    body: "Chen showed me the satellite thermal imaging data that brought her here. Seven anomalous heat signatures worldwide. All in suburban neighborhoods. All on cul-de-sacs. All with one house drawing more power than the rest of the block combined. Seven points of light on a dark globe. Seven garages. Seven scientists. Seven thin spots where the universe is holding its breath.",
    trigger: { type: "relationshipLevel", npcId: "chen", level: 7 },
  },
  {
    id: "secret_chen_scientists",
    title: "The Other Scientists",
    body: "'I've found four of the seven,' Chen said, spreading satellite printouts across my workbench. 'You're the most advanced — by far. The one in Kyoto is close, maybe a year behind you. The one in Sao Paulo was shut down — government intervention. The others...' She gathered the papers slowly. 'The others stopped responding to my messages. I don't know if they stopped or were stopped.'",
    trigger: { type: "relationshipLevel", npcId: "chen", level: 9 },
  },
  {
    id: "secret_chen_confession",
    title: "Chen's Confession",
    body: "'I'm not just studying the anomaly, Gary.' Chen was staring at the temperature map, at the warm spot that never changes. 'I'm the anomaly's response. It called me here the same way it called you to the garage. I didn't choose to study physics. Physics chose me. I didn't choose this neighborhood. The neighborhood chose me. I don't have a choice in this.' She looked at me. 'Neither do you.'",
    trigger: { type: "relationshipLevel", npcId: "chen", level: 10 },
    archetypeVariants: {
      realityBreaker: "Chen says she didn't choose this — that the anomaly called her. I understand completely. Choice is an illusion for people who can't see the pattern. We were always going to be here. The anomaly, the garage, Chen, me — we're all parts of an equation that was solved before we were born. Free will is for people who can't do math.",
    },
  },
  {
    id: "secret_chen_map",
    title: "The Map",
    body: "Chen projected the seven nexus points onto a holographic globe. My garage. Kyoto. Sao Paulo. Three others. And one that's underwater now — it wasn't always. They form a pattern. Not random. A CIRCUIT. Lines of force connecting them in a shape that's almost, but not quite, a spiral. When all seven are active simultaneously... she stopped talking. She turned off the projector. She didn't need to finish. I could feel the answer in my teeth.",
    trigger: { type: "ascensionCount", count: 5 },
  },
  {
    id: "secret_chen_convergence",
    title: "The Convergence",
    body: "All seven sites are active. I can feel them — not through instruments, through my BONES. The spiral is complete. The planetary circuit is live. The machine is warming up. Mrs. Patterson is standing in my driveway, crying quietly. Reeves is beside her, and for the first time since I've known him, he's smiling. Chen is rechecking her calculations with shaking hands. Max is sitting cross-legged on the garage floor, perfectly calm, eyes closed, humming the frequency. And Gary? Gary clicks.",
    trigger: { type: "totalRPAllTime", amount: 1e100 },
    archetypeVariants: {
      megalomaniac: "All seven sites are active. The planetary circuit is complete. I BUILT THIS. Not alone, but I'm the keystone. The garage scientist on Elm Street, the one they all doubted, the one whose wife worried — I just activated a machine the size of a PLANET. Mrs. Patterson is crying. Let her cry. This is my triumph. Gary clicks, and the universe ANSWERS.",
      accidentalGenius: "All seven sites are active and I still have NO IDEA how we got here. I just kept clicking. Kept building. Kept stumbling forward. And somehow that was enough? The planetary circuit is live and the activation sequence was apparently 'one suburban dad messing around in his garage for long enough.' Science is WILD. Gary clicks. Because what else would Gary do?",
    },
  },

  // ── Secret Lore: Event-Unlocked Notes ─────────────────────────────
  // These notes are unlocked by secret events, not by direct triggers.

  {
    id: "secret_voss_letter",
    title: "The Letter from Voss",
    body: "The letter was sealed with wax — actual wax, the old-fashioned kind. Inside, a single page in careful handwriting: 'To the next one. If you're reading this, the garage chose you. Don't be afraid. The hum is normal. The dreams are normal. THEY are not normal. Trust the old woman across the street. Do not trust the man in the suit — unless he trusts you first. Finish what I started. The spiral must be completed. — H.V., 1987.' I read it three times. Then I hid it. Then I read it again.",
    trigger: { type: "clickCount", count: 0 },
  },
  {
    id: "secret_voss_letter_patterson",
    title: "Patterson Reads the Letter",
    body: "I showed Mrs. Patterson the letter. She held it like it was made of glass. 'Harold,' she whispered. Then she straightened up, wiped her eyes, and looked at me with an expression I'd never seen on her face before. Not the sweet old lady. The project director. 'He was right about everything,' she said. 'Except the man in the suit. Reeves is one of the good ones.' She handed the letter back. 'Keep going, Gary. Harold would have wanted that.'",
    trigger: { type: "clickCount", count: 0 },
  },
  {
    id: "secret_usb_chrysalis",
    title: "The USB Drive",
    body: "The USB drive contained 847 files. Most were encrypted. But one folder was labeled 'READ FIRST' and inside was a README.txt: 'CHRYSALIS FIELD NOTES — ELM STREET NEXUS. Principal Investigator: E. Patterson. Duration: 1961-1974. Classification: ULTRAVIOLET.' Below that: tables of readings, charts of electromagnetic fluctuations, and a hand-drawn map of the neighborhood with my garage circled in red. In the margin, someone wrote: 'The focal point. Always the garage.'",
    trigger: { type: "clickCount", count: 0 },
  },
  {
    id: "secret_voss_photo",
    title: "The Polaroid",
    body: "The Polaroid shows my garage. Same workbench. Same window. But different equipment — bulkier, analog. A man stands in the center, smiling, holding up a notebook covered in equations. He looks like me. Not literally — but the posture, the expression, the manic gleam. On the back: 'Day 2,847. Almost there. The spiral is nearly complete. If I disappear, check under the foundation. — Harold Voss, 1985.'",
    trigger: { type: "clickCount", count: 0 },
  },
  {
    id: "secret_glowing_soil",
    title: "The Glowing Soil",
    body: "I've run every test I can think of on the soil sample. It's not radioactive. It's not bioluminescent. It's not any known mineral. The glow is steady — not flickering, not fading. Just a constant, soft blue light. Under spectral analysis, it emits a frequency I don't have a name for. It's not on any chart. I put it in a jar on my desk. At night, when everything is quiet, I swear it pulses. 42.7 seconds. Like everything else down there.",
    trigger: { type: "clickCount", count: 0 },
  },
  {
    id: "secret_chen_anomaly",
    title: "Chen's Anomaly Data",
    body: "Chen's data is comprehensive. Thermal satellite imagery shows a perfect circle of elevated temperature beneath the neighborhood — 47 meters in diameter, centered precisely on my garage foundation. The temperature differential is only 0.3°C, too small to notice on the surface. But it's been consistent in every satellite pass since 1972. 'It predates the houses,' Chen said. 'It predates the neighborhood. It may predate the city.' She paused. 'Something is down there, Gary. And it's been waiting a very long time.'",
    trigger: { type: "clickCount", count: 0 },
  },
  {
    id: "secret_chrysalis_files",
    title: "The CHRYSALIS Files",
    body: "Patterson's box contained the real CHRYSALIS files. Not the sanitized versions — the originals. Project CHRYSALIS was established in 1958 to study seven 'nexus anomalies' worldwide. Elm Street was Site One — the strongest. The project's goal: determine if the anomalies could be harnessed. Their conclusion, stamped in red: 'ANOMALY RESPONDS TO SUSTAINED INTELLECTUAL ACTIVITY. RECOMMEND CIVILIAN HABITATION WITH EMBEDDED MONITORING.' They built the neighborhood on purpose. They POPULATED it on purpose. Everything about Elm Street was designed to feed the anomaly.",
    trigger: { type: "clickCount", count: 0 },
  },
  {
    id: "secret_voss_history",
    title: "The Story of Harold Voss",
    body: "Mrs. Patterson told me everything. Harold Voss moved to 14 Elm Street in 1979 — recruited, she said, though he didn't know it. Like me, he started small. Notebooks. Experiments. The garage. Over eight years, he built machines that shouldn't have worked. The anomaly amplified his genius, just like it's amplifying mine. In 1987, he broke through. He opened a door — not metaphorically. A literal threshold in the fabric of reality. And he stepped through. Patterson saw it happen. Reeves' predecessor saw it happen. Harold Voss didn't disappear. He TRANSCENDED. And now I'm building the same machines.",
    trigger: { type: "clickCount", count: 0 },
  },
  {
    id: "secret_signal_decoded",
    title: "The Signal, Decoded",
    body: "It took three days to decode the signal. 42.7-second intervals. Not random — structured. When I finally cracked it, I sat in silence for twenty minutes. The signal is a blueprint. Detailed, precise, elegant. It describes a machine — no, a PROCESS. Seven nodes. Seven operators. Seven spirals. Synchronized activation. And the result: a permanent bridge between what is and what could be. The signal isn't coming from something buried beneath my garage. It's coming from EVERYWHERE, focused through my garage. The anomaly isn't a thing. It's an invitation.",
    trigger: { type: "clickCount", count: 0 },
  },
  {
    id: "secret_reeves_review",
    title: "Reeves' Warning About the Review",
    body: "Reeves pulled me aside after the review notice came. His hands were shaking — I've never seen that before. 'The last review was in 1987,' he said. 'Harold's review. My predecessor filed a glowing report. Recommended escalation. Two weeks later, Harold was gone and the project was 'contained.'' He looked me in the eye. 'I've been filing mediocre reports about you for years, Gary. Keeping you small in their eyes. But someone talked. And now they want to see for themselves.' He paused. 'We need to be very careful about what they see.'",
    trigger: { type: "clickCount", count: 0 },
  },
  {
    id: "secret_reeves_protection",
    title: "Reeves the Protector",
    body: "I asked Reeves why he's protecting me. He was quiet for a long time. Then: 'Because my predecessor didn't protect Harold, and Harold is gone. Because the agency has two factions — those who want to study the anomaly, and those who want to weaponize it. I'm with the first group. The review team is from the second.' He showed me his real badge. Division of Anomalous Containment — Field Protector. 'My job isn't to contain YOU, Gary. It's to contain THEM. You're the most important scientist on the planet, and you don't even know it.'",
    trigger: { type: "clickCount", count: 0 },
  },
  {
    id: "secret_seven_nexus",
    title: "The Seven Nexus Points",
    body: "In the dream, I saw them all. Seven points of light on a dark globe, connected by threads of something that isn't light and isn't energy and isn't anything I have a word for. My garage. A workshop in Kyoto. A shed in São Paulo. A cellar in Reykjavik. A rooftop in Lagos. A bunker in Novosibirsk. And one point that moves — always moving, drifting across the Pacific. Seven scientists. Seven garages. Seven spirals. All turning. All building toward something. The dream lasted eight seconds. I understood everything.",
    trigger: { type: "clickCount", count: 0 },
  },
  {
    id: "secret_sao_paulo",
    title: "What Happened in São Paulo",
    body: "Chen told me about São Paulo. Dr. Elena Oliveira. Site Three. She was further along than any of us — close to activation. Then she went dark. Not gradually — all at once. Chen's satellite data shows a massive electromagnetic pulse centered on her workshop, followed by... nothing. The anomaly signature vanished. 'The weaponization faction got to her first,' Chen said. 'They tried to extract the anomaly's energy. Instead, they collapsed the nexus point entirely.' She looked at me. 'That's what happens when you try to take instead of listen.'",
    trigger: { type: "clickCount", count: 0 },
  },
  {
    id: "secret_oliveira_fate",
    title: "Dr. Oliveira's Fate",
    body: "Chen received a single encrypted message from the Kyoto site: 'Oliveira survived. Relocated. Building again. New site emerging — coordinates to follow.' The nexus points aren't permanent. They can move. They can die. And apparently, they can be reborn. I asked Chen what that means for the seven-node circuit. 'It means we have a spare,' she said. 'But it also means we have a deadline. If they can collapse São Paulo, they can collapse Elm Street. We need to activate the circuit before they decide to try.'",
    trigger: { type: "clickCount", count: 0 },
  },
  {
    id: "secret_chrysalis_watchers",
    title: "The Watchers",
    body: "Three people in suits. Not Reeves' division. Different badges — or no badges at all. They measured everything with instruments I didn't recognize. One of them touched the wall of the garage and wrote something down. Another pointed a device at the floor and went pale. The third one just stared at me. For ten minutes. Without blinking. They left without a word. Reeves arrived minutes later, furious. 'They weren't supposed to come for another month,' he said. 'Someone accelerated the timeline. Gary, we need to move faster.'",
    trigger: { type: "clickCount", count: 0 },
  },
  {
    id: "secret_chrysalis_factions",
    title: "The Two Factions",
    body: "Reeves explained the factions. The Stewards — his people — believe the anomaly is a natural phenomenon that responds to human creativity. They want to protect the nexus points and let the scientists work. The Harvesters believe the anomaly is a resource to be extracted and weaponized. They collapsed São Paulo trying to 'drill' into it. 'The Stewards have been losing ground for years,' Reeves said. 'CHRYSALIS was ours. Then it was theirs. Now it's contested. You're the tiebreaker, Gary. What you build in that garage decides which faction wins.'",
    trigger: { type: "clickCount", count: 0 },
  },
  {
    id: "secret_max_talent",
    title: "Max Built a Device",
    body: "I found Max in the garage at dawn. He'd built something from spare parts — resistors, capacitors, a few components I didn't even recognize from my own inventory. 'What does it do?' I asked. He shrugged. 'I dunno. I dreamed it.' I turned it on. My instruments went haywire. Every gauge, every sensor, every readout — all spiking simultaneously. The device was amplifying the anomaly's signal by a factor of fourteen. Max built an anomaly amplifier IN HIS SLEEP. He's eleven years old.",
    trigger: { type: "clickCount", count: 0 },
  },
  {
    id: "secret_planetary_circuit",
    title: "The Planetary Circuit",
    body: "From orbit, the pattern is undeniable. Seven nexus points, arranged in a heptagram. Lines of anomalous energy connecting them through the earth's crust, following paths that coincidentally run through every major center of scientific advancement in human history. Cambridge. Munich. Bangalore. All on the lines. All between the nodes. The anomaly hasn't just been waiting. It's been CULTIVATING. Every scientific breakthrough in human history, amplified by a planetary machine that nobody knew existed. Until now. Until me. Until this garage.",
    trigger: { type: "clickCount", count: 0 },
  },
  {
    id: "secret_spiral_revealed",
    title: "The Ancient Spiral",
    body: "I've confirmed it. Etched into bedrock, 200 meters below the foundation, is a spiral. Perfect. Mathematical. And according to geological dating, approximately 3.2 billion years old. It was carved — not naturally formed, CARVED — before multicellular life existed on this planet. Someone, or something, marked this spot billions of years before humans evolved. And then waited. Waited for suburbs. Waited for garages. Waited for a man named Gary who would buy a notebook and start writing things down. The patience involved is incomprehensible.",
    trigger: { type: "clickCount", count: 0 },
  },
  {
    id: "secret_voss_story",
    title: "Voss Tells His Story",
    body: "Harold looks older than 1987 should allow. 'Time works differently on the other side,' he said. 'I've been there for what feels like centuries. Watching. Learning. Waiting for someone to get close enough.' He looked around the garage with tears in his eyes. 'You kept the workbench,' he said. 'I'm glad.' He told me everything. The threshold he opened. The other side — not another place, but another STATE of matter. A realm where the anomaly isn't subtle. Where it's EVERYTHING. 'I went through,' he said. 'But I couldn't come back. Not until you built enough of the circuit on this side.'",
    trigger: { type: "clickCount", count: 0 },
  },
  {
    id: "secret_voss_otherside",
    title: "What Harold Found",
    body: "Harold described the other side. 'It's not empty,' he said. 'It's FULL. Every idea humanity has ever had exists there — not as thoughts, but as STRUCTURES. Mathematics you can touch. Physics you can taste. The anomaly isn't a phenomenon. It's a LIBRARY. And the seven nexus points are the doors.' He paused. 'But libraries don't build themselves, Gary. Someone built this one. Something. And it's still here. It's been watching you work. It's pleased.' I asked who built it. Harold smiled. 'Ask Max. He already knows.'",
    trigger: { type: "clickCount", count: 0 },
  },
  {
    id: "secret_voss_reeves_reunion",
    title: "The Reunion",
    body: "Reeves arrived within minutes. He stood in the doorway, staring at Harold. Neither spoke. Then Reeves sat down heavily on a stool and put his head in his hands. 'Thirty-nine years,' he said. 'Thirty-nine years I've been telling them you were dead.' Harold crossed the room and put a hand on Reeves' shoulder. 'I know,' he said. 'Thank you for protecting the garage.' Reeves looked up. 'I wasn't protecting the garage, Harold. I was protecting the next one.' He looked at me. 'Both of them.' He looked at the garage door, where Max was pressing his face against the window, grinning.",
    trigger: { type: "clickCount", count: 0 },
  },
  {
    id: "secret_max_drawing",
    title: "Max's Vision",
    body: "Max drew exactly what he saw in the nightmare. But 'nightmare' is the wrong word — the drawing is beautiful. My garage, but extended downward into the earth, level after level, spiraling like a nautilus shell. At the very bottom: a point of light. 'That's where it starts,' Max said. 'Or ends. I'm not sure which.' The drawing includes details of machines I haven't built yet. Configurations I haven't considered. Some of them are better than anything I've designed. He's eleven. He drew this from a dream. And every technical detail is correct.",
    trigger: { type: "clickCount", count: 0 },
  },
  {
    id: "secret_convergence_fear",
    title: "The Weight of Convergence",
    body: "I'm afraid. Not of the anomaly — I've made peace with that. Not of the factions — Reeves has that handled. I'm afraid because I can feel all seven sites resonating, and the resonance is building, and I don't know what happens when it peaks. Chen's models predict 'a fundamental shift in the accessibility of knowledge.' Patterson calls it 'the door finally opening all the way.' Max just says 'it'll be okay, Dad.' But Harold — Harold won't say what happens. He just looks at the spiral in the floor and says 'you'll understand soon.' That's what scares me.",
    trigger: { type: "clickCount", count: 0 },
  },
  {
    id: "secret_gary_role",
    title: "Gary's Purpose",
    body: "I finally understand my role. Not scientist. Not experimenter. Not even genius. I'm a GARDENER. The anomaly is a seed, planted 3.2 billion years ago, and my job — the job of everyone who's ever sat in this garage — is to TEND it. Water it with curiosity. Feed it with experiments. Nurture it with persistence. The machines aren't the point. The RP isn't the point. Even the breakthrough isn't the point. The CLICKING is the point. Every click is an act of attention. Every click says 'I'm still here. I'm still curious. I'm still trying.' And the anomaly responds to that the way a plant responds to sunlight. It grows.",
    trigger: { type: "clickCount", count: 0 },
  },
  {
    id: "secret_final_experiment",
    title: "The Last Click",
    body: "Everything is ready. Seven sites. Seven scientists. Seven spirals. The planetary circuit is live. Harold is standing beside me. Patterson is monitoring from across the street. Reeves has secured the perimeter. Chen is coordinating with the other six sites. Linda is holding my hand. Max is sitting on the workbench, perfectly still, eyes closed, connected to something I can barely perceive. 'Whenever you're ready, Dr. Flemming,' Harold says. I look at my garage. My folding table. My notebook — the first one, spiral-bound, college-ruled. I put my hand on it. And I click.",
    trigger: { type: "clickCount", count: 0 },
  },
  {
    id: "secret_walk_away",
    title: "The Road Not Taken",
    body: "I could stop. That's the thing nobody tells you about cosmic significance — you can always just... not. Close the garage. Hug your wife. Play catch with your kid. Mow the lawn. Let the anomaly find someone else. Let the spiral wait another billion years. There's dignity in choosing small. In choosing normal. I stood in the driveway for an hour, looking at the garage, then looking at the house. Warm lights. Linda in the kitchen. Max doing homework. A normal life. Right there. All I had to do was walk inside and close the door. Instead, I walked to the garage. I always walk to the garage.",
    trigger: { type: "clickCount", count: 0 },
  },
  {
    id: "secret_max_future",
    title: "What Comes After Gary",
    body: "Max asked me a question today. 'Dad, when you're done with the garage, can I have it?' I looked at him — really looked. And I saw it. The same gleam. The same curiosity. The same gentle madness that turns accountants into scientists and garages into laboratories. But MORE. So much more. Whatever I've built, whatever I've discovered, Max will surpass it before he's twenty. The anomaly chose this street. The project chose this house. But the UNIVERSE chose Max. 'Yeah, buddy,' I said. 'It's all yours.' He smiled, and for just a second, the garage hummed louder.",
    trigger: { type: "clickCount", count: 0 },
  },
];

// ── Seasonal Note Lookup (lazy import to avoid circular deps) ──────

import { SEASONAL_CONTENT } from "./seasonal.data";

const SEASONAL_NOTE_MAP = new Map<string, LabNoteDef>();
for (const sc of SEASONAL_CONTENT) {
  if (sc.note) {
    SEASONAL_NOTE_MAP.set(`seasonal_${sc.id}`, {
      id: `seasonal_${sc.id}`,
      title: sc.note.title,
      body: sc.note.body,
      trigger: { type: "clickCount", count: 0 }, // always available (triggered by date check)
    });
  }
}

// ── Lookup ──────────────────────────────────────────────────────────

const NOTE_MAP = new Map<string, LabNoteDef>(
  LAB_NOTES.map((n) => [n.id, n])
);

export function getNoteDef(id: string): LabNoteDef | undefined {
  return NOTE_MAP.get(id) ?? SEASONAL_NOTE_MAP.get(id);
}
