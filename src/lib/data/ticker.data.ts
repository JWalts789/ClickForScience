// ── News Ticker Headlines ────────────────────────────────────────────
// Lore-flavored announcements triggered by milestones and events.
// Format: generator ID + milestone count → headline(s)

export interface TickerSuppression {
  /** The event that must have been resolved. */
  eventId: string;
  /** Which choice(s) suppress this headline. If omitted, ANY resolution suppresses it. */
  choices?: number[];
}

export interface TickerHeadline {
  /** What triggers this headline. */
  trigger:
    | { type: "generatorMilestone"; genId: string; count: number }
    | { type: "upgradePurchased"; upgradeId: string }
    | { type: "totalRPReached"; amount: number }
    | { type: "clickCount"; count: number }
    | { type: "prestigeCount"; count: number }
    | { type: "prestigeUpgradePurchased"; upgradeId: string }
    | { type: "madnessLevel"; level: number }
    | { type: "labLevel"; level: number }
    | { type: "ascensionCount"; count: number }
    | { type: "challengesCompleted"; count: number }
    | { type: "researchCompleted"; nodeId: string }
    | { type: "relationshipLevel"; npcId: string; level: number };
  /** The headline text that scrolls across. */
  text: string;
  /** If set, this headline is suppressed when the event was resolved with the given choice(s). */
  suppressIf?: TickerSuppression;
}

export const TICKER_HEADLINES: TickerHeadline[] = [
  // ── Generator Milestones ──────────────────────────────────────────

  // Notebook milestones
  { trigger: { type: "generatorMilestone", genId: "notebook", count: 10 }, text: 'LOCAL MAN BUYS 10TH NOTEBOOK — "I\'m just really organized," he insists.' },
  { trigger: { type: "generatorMilestone", genId: "notebook", count: 25 }, text: "OFFICE SUPPLY STORE REPORTS SUSPICIOUS BULK PURCHASE — Authorities baffled by spiral notebook shortage." },
  { trigger: { type: "generatorMilestone", genId: "notebook", count: 50 }, text: "NEIGHBORS CONCERNED — \"His garage is literally wallpapered in notes. Should we call someone?\"" },
  { trigger: { type: "generatorMilestone", genId: "notebook", count: 100 }, text: "PAPER COMPANY ISSUES STATEMENT — \"We've never had a single residential account order this much.\"" },

  // Soldering milestones
  { trigger: { type: "generatorMilestone", genId: "soldering", count: 10 }, text: "POWER COMPANY INVESTIGATES VOLTAGE SPIKE — Traced to single suburban garage." },
  { trigger: { type: "generatorMilestone", genId: "soldering", count: 25 }, text: "FIRE DEPARTMENT PRE-STAGES TRUCK — \"It's more of a precaution,\" says chief." },
  { trigger: { type: "generatorMilestone", genId: "soldering", count: 50 }, text: "LOCAL MAN'S WIFE BANS HIM FROM KITCHEN — \"Everything he touches has solder on it.\"" },

  // Chemistry milestones
  { trigger: { type: "generatorMilestone", genId: "chemistry", count: 10 }, text: "STRANGE SMELLS REPORTED ON ELM STREET — \"It's like a swimming pool crossed with fireworks.\"" },
  { trigger: { type: "generatorMilestone", genId: "chemistry", count: 25 }, text: "EPA RECEIVES ANONYMOUS TIP — Source described as \"enthusiastic hobbyist.\"" },
  { trigger: { type: "generatorMilestone", genId: "chemistry", count: 50 }, text: "LAWN SPONTANEOUSLY CHANGES COLOR — Homeowner claims \"intentional.\"" },

  // Server milestones
  { trigger: { type: "generatorMilestone", genId: "server", count: 10 }, text: "INTERNET SERVICE PROVIDER CONFUSED — \"One household is using 40% of neighborhood bandwidth.\"" },
  { trigger: { type: "generatorMilestone", genId: "server", count: 25 }, text: "GARAGE TEMPERATURE EXCEEDS 120°F — Neighbors report \"data center smell.\"" },
  { trigger: { type: "generatorMilestone", genId: "server", count: 50 }, text: "NSA FILES COMPLAINT — \"Please stop pinging us. We know you're there.\"" },

  // Prototype milestones
  { trigger: { type: "generatorMilestone", genId: "prototype", count: 10 }, text: "UNKNOWN DEVICE DETECTED BY SATELLITE — Pentagon requests explanation. None provided." },
  { trigger: { type: "generatorMilestone", genId: "prototype", count: 25 }, text: "\"IT DOES SOMETHING\" — Inventor cannot explain what, but it won't stop doing it." },

  // Containment milestones
  { trigger: { type: "generatorMilestone", genId: "containment", count: 10 }, text: "WHAT WAS INSIDE? — Containment breach at suburban residence. Contents: \"unclear.\"" },
  { trigger: { type: "generatorMilestone", genId: "containment", count: 25 }, text: "ZONING BOARD DISCOVERS UNDERGROUND EXPANSION — \"That's not in the blueprints.\"" },

  // Collider milestones
  { trigger: { type: "generatorMilestone", genId: "collider", count: 10 }, text: "SMALL EXPLOSION REPORTED — Homeowner insists it was \"mini.\"" },
  { trigger: { type: "generatorMilestone", genId: "collider", count: 25 }, text: "CERN CALLS LOCAL GARAGE — \"Where did you get those readings?\"" },

  // Mindlink milestones
  { trigger: { type: "generatorMilestone", genId: "mindlink", count: 10 }, text: "VOLUNTEERS NEEDED — Local scientist seeks \"willing participants.\" No questions asked." },

  // Reality milestones
  { trigger: { type: "generatorMilestone", genId: "reality", count: 10 }, text: "LAWS OF PHYSICS FILE CEASE AND DESIST — Complaint describes \"unauthorized modifications.\"" },

  // Cosmic milestones
  { trigger: { type: "generatorMilestone", genId: "cosmic", count: 10 }, text: "ASTRONOMERS DETECT ANOMALY — \"It's coming from... a suburb?\"" },

  // ── Click Milestones ──────────────────────────────────────────────

  { trigger: { type: "clickCount", count: 100 }, text: "DEDICATED HOBBYIST — Local man clicks 100 times. \"It's meditative,\" he claims." },
  { trigger: { type: "clickCount", count: 1000 }, text: "CARPAL TUNNEL RISK — Doctor warns of \"excessive tinkering.\" Patient undeterred." },
  { trigger: { type: "clickCount", count: 10000 }, text: "MOUSE MANUFACTURER SENDS REPLACEMENT — \"We've never seen this kind of wear pattern.\"" },

  // ── Total RP Milestones ───────────────────────────────────────────

  { trigger: { type: "totalRPReached", amount: 1000 }, text: "PROMISING RESULTS — \"I think I'm onto something,\" says local scientist." },
  { trigger: { type: "totalRPReached", amount: 1000000 }, text: "UNIVERSITY TAKES NOTICE — Anonymous research flagged as \"unexpectedly competent.\"" },
  { trigger: { type: "totalRPReached", amount: 1000000000 }, text: "NOBEL COMMITTEE HAS QUESTIONS — \"We don't even have a category for this.\"" },
  { trigger: { type: "totalRPReached", amount: 1e12 }, text: "WORLD GOVERNMENTS CONVENE — Subject: \"The Garage Situation.\"" },

  // ── Upgrade Headlines ─────────────────────────────────────────────

  { trigger: { type: "upgradePurchased", upgradeId: "click_1" }, text: "ERGONOMIC MOUSE PURCHASED — \"My clicking has never been more efficient.\"" },
  { trigger: { type: "upgradePurchased", upgradeId: "efficiency_1" }, text: "BETTER LIGHTING INSTALLED — \"I can finally see what I'm doing. That might be a problem.\"" },
  { trigger: { type: "upgradePurchased", upgradeId: "efficiency_3" }, text: "SLEEP DECLARED OPTIONAL — \"Who needs REM cycles when you have SCIENCE?\"" },
  { trigger: { type: "upgradePurchased", upgradeId: "efficiency_4" }, text: "TIME ITSELF BENDS — Clocks in neighborhood now run at different speeds." },
  { trigger: { type: "upgradePurchased", upgradeId: "click_4" }, text: "NEURAL CLICK PATHWAY ESTABLISHED — \"I no longer need to move my finger. I just... think it.\"" },
  { trigger: { type: "upgradePurchased", upgradeId: "click_5" }, text: "QUANTUM ENTANGLEMENT APPLIED TO MOUSE — Every click now echoes across timelines." },

  // ── Prestige Headlines ────────────────────────────────────────────

  { trigger: { type: "prestigeCount", count: 1 }, text: "SCIENTIST \"SNAPS OUT OF IT\" — Destroys all research, claims it was \"on purpose.\" Neighbors skeptical." },
  { trigger: { type: "prestigeCount", count: 3 }, text: "THIRD RESET IN A ROW — \"Each time I lose everything, I understand more.\" Therapist concerned." },
  { trigger: { type: "prestigeCount", count: 5 }, text: "PATTERN OF DESTRUCTION IDENTIFIED — \"It's not madness, it's the SCIENTIFIC METHOD,\" he screams." },
  { trigger: { type: "prestigeCount", count: 10 }, text: "TEN-TIME PRESTIGE — FBI opens file. Contents: \"Unclear what crimes, if any, are being committed.\"" },

  { trigger: { type: "prestigeUpgradePurchased", upgradeId: "bp_prod_1" }, text: "RETAINED KNOWLEDGE ACTIVATED — \"I destroyed my lab but I REMEMBER how it worked. That's... science?\"" },
  { trigger: { type: "prestigeUpgradePurchased", upgradeId: "bp_starting_rp" }, text: "MYSTERIOUS GRANT APPEARS — \"I don't know who's funding me but I'm not asking questions.\"" },
  { trigger: { type: "prestigeUpgradePurchased", upgradeId: "bp_offline_1" }, text: "SLEEPWALKING RESEARCH CONFIRMED — Wife reports him \"muttering formulas in his sleep.\"" },
  { trigger: { type: "prestigeUpgradePurchased", upgradeId: "bp_prod_3" }, text: "UNIVERSAL CONSTANTS REWRITTEN — Physics department releases emergency statement: \"Please stop.\"" },
  { trigger: { type: "prestigeUpgradePurchased", upgradeId: "bp_offline_3" }, text: "FULLY AUTONOMOUS LAB — It runs itself now. Even the scientist seems unnecessary." },

  // ── Madness Level Headlines ───────────────────────────────────────

  { trigger: { type: "madnessLevel", level: 2 }, text: "BEHAVIORAL CHANGES NOTED — Wife reports husband \"talking to equipment.\" Husband claims equipment \"listens.\"" },
  { trigger: { type: "madnessLevel", level: 4 }, text: "PSYCHOLOGIST CONSULTED — \"He's not dangerous. He's just... very focused. Unusually focused. Concerningly focused.\"" },
  { trigger: { type: "madnessLevel", level: 6 }, text: "IDENTITY CRISIS OR EVOLUTION? — Local scientist no longer recognizes old photos of himself. Calls them \"a stranger.\"" },
  { trigger: { type: "madnessLevel", level: 8 }, text: "PEAK MADNESS ACHIEVED — Authorities unsure whether to intervene or take notes. Opting for notes." },

  // ── Family Headlines ──────────────────────────────────────────────

  { trigger: { type: "generatorMilestone", genId: "notebook", count: 75 }, text: "LINDA FLEMMING ISSUES HOUSEHOLD MEMO — \"No experiments at the dinner table. This includes 'taste tests.'\"" },
  { trigger: { type: "generatorMilestone", genId: "soldering", count: 75 }, text: "WIFE JOINS SUPPORT GROUP — \"Spouses of Extraordinary Hobbyists\" meets Tuesdays. Attendance growing." },
  { trigger: { type: "generatorMilestone", genId: "chemistry", count: 75 }, text: "LINDA FLEMMING QUOTED IN INTERVIEW — \"I married an accountant. I don't know what this is.\"" },
  { trigger: { type: "generatorMilestone", genId: "prototype", count: 15 }, text: "MAX FLEMMING WINS REGIONAL SCIENCE FAIR — Judges call entry \"suspiciously advanced for a 6th grader.\"" },
  { trigger: { type: "prestigeCount", count: 7 }, text: "FAMILY DINNER INTERRUPTED AGAIN — \"Dad said the mashed potatoes were 'exhibiting non-Newtonian properties.' We just wanted to eat.\" — Max, age 11." },
  { trigger: { type: "generatorMilestone", genId: "containment", count: 15 }, text: "SUPPORT GROUP MEMBERSHIP TRIPLES — Spouses of Extraordinary Hobbyists now has a waiting list and a podcast." },
  { trigger: { type: "upgradePurchased", upgradeId: "prototype_2" }, text: "LINDA FLEMMING FILES UNUSUAL INSURANCE CLAIM — \"How do I categorize 'spontaneous matter creation' under property damage?\"" },
  { trigger: { type: "generatorMilestone", genId: "mindlink", count: 15 }, text: "MAX FLEMMING EXCUSED FROM HOMEWORK — Teachers agree his home life \"counts as extracurricular credit.\"" },
  { trigger: { type: "clickCount", count: 25000 }, text: "FAMILY DOG REFUSES TO ENTER GARAGE — Sits outside whining. \"He knows something,\" says Linda." },
  { trigger: { type: "prestigeCount", count: 15 }, text: "LINDA FLEMMING ADDRESSES PRESS — \"I've stopped asking what he's doing. I just check that the house is still standing.\"" },

  // ── Neighbor / Doug Henderson Headlines ─────────────────────────
  // Hostile Doug headlines — suppressed if player befriended him

  { trigger: { type: "generatorMilestone", genId: "notebook", count: 35 }, text: "HOA MEETING CALLED — Doug Henderson presents 47-slide deck titled \"The Garage Problem.\" Motion tabled.",
    suppressIf: { eventId: "hoa_letter", choices: [1] } },
  { trigger: { type: "generatorMilestone", genId: "soldering", count: 35 }, text: "DOUG HENDERSON FILES NOISE COMPLAINT — Describes sound as \"mechanical bees having a disagreement.\"",
    suppressIf: { eventId: "hoa_letter", choices: [0, 1] } },

  // Neutral/warming Doug headlines — suppressed if already partnered
  { trigger: { type: "generatorMilestone", genId: "server", count: 35 }, text: "NEIGHBOR ADMITS GRUDGING RESPECT — Doug Henderson seen peeking through fence with binoculars. \"Research purposes,\" he says.",
    suppressIf: { eventId: "dougs_investment", choices: [1] } },
  { trigger: { type: "generatorMilestone", genId: "collider", count: 15 }, text: "DOUG HENDERSON WITHDRAWS HOA COMPLAINT — \"Whatever he's doing in there, my roses have never grown better.\"",
    suppressIf: { eventId: "hoa_letter", choices: [1] } },
  { trigger: { type: "generatorMilestone", genId: "reality", count: 5 }, text: "HENDERSON PROPERTY VALUE INCREASES — Real estate agent calls proximity to \"the garage\" a selling point." },
  { trigger: { type: "generatorMilestone", genId: "cosmic", count: 5 }, text: "DOUG HENDERSON ASKS TO INVEST — Slides business card under garage door. Card returned via small portal.",
    suppressIf: { eventId: "dougs_investment" } },

  // ── Government / Agent Reeves Headlines ─────────────────────────

  { trigger: { type: "generatorMilestone", genId: "prototype", count: 50 }, text: "AGENT REEVES REASSIGNED TO SUBURBAN DETAIL — \"I have a master's degree,\" he tells his supervisor. Supervisor shrugs." },
  { trigger: { type: "totalRPReached", amount: 1e14 }, text: "CLASSIFIED MEMO LEAKED — Agent Reeves writes: \"Subject built WHAT in a two-car garage? Requesting backup.\"" },
  { trigger: { type: "generatorMilestone", genId: "containment", count: 50 }, text: "INTERAGENCY TASK FORCE CONVENED — FBI, NSA, and EPA argue over jurisdiction. No one wants it." },
  { trigger: { type: "prestigeCount", count: 20 }, text: "AGENT REEVES FILES 20TH REPORT — \"Subject destroyed everything. Again. I no longer believe this is accidental.\"" },
  { trigger: { type: "totalRPReached", amount: 1e22 }, text: "PENTAGON RECLASSIFIES SUBURBAN GARAGE — Now listed alongside Area 51 in internal documents." },
  { trigger: { type: "generatorMilestone", genId: "cosmic", count: 15 }, text: "AGENT REEVES REQUESTS TRANSFER — \"I was trained for espionage, not... whatever this is.\" Transfer denied." },

  // ── School Headlines ────────────────────────────────────────────

  { trigger: { type: "upgradePurchased", upgradeId: "chemistry_2" }, text: "PARENT-TEACHER CONFERENCE DERAILED — Max's father \"corrected\" the science teacher. Twice. With diagrams." },
  { trigger: { type: "generatorMilestone", genId: "chemistry", count: 100 }, text: "SHOW-AND-TELL EVACUATION — Max Flemming's presentation triggers school-wide safety protocol. \"It was just baking soda,\" he insists." },
  { trigger: { type: "upgradePurchased", upgradeId: "server_2" }, text: "SCHOOL COMPUTER LAB OUTPERFORMED — Max's science fair laptop benchmarks higher than entire district network." },
  { trigger: { type: "generatorMilestone", genId: "mindlink", count: 50 }, text: "MAX FLEMMING OFFERED EARLY COLLEGE ADMISSION — Age 11. \"My dad helped with homework,\" he says. University alarmed." },

  // ── Higher Generator Milestones ─────────────────────────────────

  { trigger: { type: "generatorMilestone", genId: "notebook", count: 200 }, text: "LIBRARY OF CONGRESS INTERVENES — \"Sir, this is more written material than some nations produce. Please slow down.\"" },
  { trigger: { type: "generatorMilestone", genId: "soldering", count: 100 }, text: "ELECTRICAL GRID REROUTED — Power company installs dedicated substation. \"It was cheaper than the complaints.\"" },
  { trigger: { type: "generatorMilestone", genId: "server", count: 100 }, text: "GARAGE NOW VISIBLE ON THERMAL SATELLITE — Glows brighter than downtown. HOA somehow still the bigger problem.",
    suppressIf: { eventId: "hoa_letter", choices: [1] } },
  { trigger: { type: "generatorMilestone", genId: "prototype", count: 75 }, text: "PATENT OFFICE OVERWHELMED — \"He's filed 50 patents this week. None of them use real words.\"" },
  { trigger: { type: "generatorMilestone", genId: "containment", count: 75 }, text: "NEIGHBORS REPORT \"HUMMING\" — Geologists confirm vibration is not tectonic. Source: one (1) garage." },
  { trigger: { type: "generatorMilestone", genId: "collider", count: 50 }, text: "SMALL HIGGS BOSON DETECTED IN SUBURB — CERN scientists \"on their way.\" Local man says \"which one?\"" },
  { trigger: { type: "generatorMilestone", genId: "mindlink", count: 25 }, text: "NEIGHBORHOOD PETS BEHAVING STRANGELY — All dogs on Elm Street now sit when the garage light turns on." },
  { trigger: { type: "generatorMilestone", genId: "reality", count: 25 }, text: "CLOCKS ON STREET RUN BACKWARD — \"It's fine,\" says local scientist. Clocks disagree." },
  { trigger: { type: "generatorMilestone", genId: "cosmic", count: 25 }, text: "NEW STAR APPEARS IN SKY — Astronomers confirm it wasn't there yesterday. Coordinates trace to a cul-de-sac." },
  { trigger: { type: "generatorMilestone", genId: "cosmic", count: 50 }, text: "FABRIC OF SPACETIME FORMALLY COMPLAINS — Cease-and-desist delivered via temporal anomaly." },

  // ── More RP Milestones ──────────────────────────────────────────

  { trigger: { type: "totalRPReached", amount: 1e15 }, text: "RESEARCH OUTPUT EXCEEDS MIT — \"One man. One garage. We have 12,000 faculty,\" says provost, defeated." },
  { trigger: { type: "totalRPReached", amount: 1e18 }, text: "GLOBAL SCIENTIFIC CONSENSUS SHAKEN — Peer review backlog now measured in years, all from one address." },
  { trigger: { type: "totalRPReached", amount: 1e21 }, text: "KNOWLEDGE DENSITY APPROACHING SINGULARITY — Local man's garage now contains more data than the observable internet." },
  { trigger: { type: "totalRPReached", amount: 1e24 }, text: "TERM \"RESEARCH POINT\" ENTERS DICTIONARY — Oxford defines it as: \"unit of suburban scientific output.\"" },
  { trigger: { type: "totalRPReached", amount: 1e30 }, text: "RESEARCH EXCEEDS COMPREHENSION — \"We can't even describe what he's discovered. There aren't enough words,\" says linguist." },

  // ── More Click Milestones ───────────────────────────────────────

  { trigger: { type: "clickCount", count: 50000 }, text: "PHYSICAL THERAPIST GIVES UP — \"His fingers are fine. Better than fine. They've... evolved?\"" },
  { trigger: { type: "clickCount", count: 100000 }, text: "CLICKING DECLARED A COMPETITIVE SPORT — Local man immediately banned for \"unreasonable advantage.\"" },
  { trigger: { type: "clickCount", count: 500000 }, text: "SEISMOGRAPH DETECTS RHYTHMIC TAPPING — USGS confirms: \"It's one guy. He won't stop clicking.\"" },
  { trigger: { type: "clickCount", count: 1000000 }, text: "ONE MILLION CLICKS — Guinness refuses to acknowledge record. \"We don't believe you,\" they write." },

  // ── More Prestige Milestones ────────────────────────────────────

  { trigger: { type: "prestigeCount", count: 8 }, text: "EIGHT RESETS — Neighbors no longer flinch at explosions. \"It's just Tuesday,\" says Doug Henderson." },
  { trigger: { type: "prestigeCount", count: 12 }, text: "TWELVE TIMES REBUILT — Construction crew on retainer. \"He tips well,\" says foreman." },
  { trigger: { type: "prestigeCount", count: 18 }, text: "EIGHTEEN RESETS — Wife changes locks. Scientist picks them \"with science.\" Marriage counselor booked." },
  { trigger: { type: "prestigeCount", count: 25 }, text: "TWENTY-FIVE DESTRUCTIONS LOGGED — Insurance company creates new category: \"Acts of Suburban Science.\"" },
  { trigger: { type: "prestigeCount", count: 50 }, text: "FIFTY RESETS — \"At this point it's performance art,\" writes art critic. Local man offended. \"It's SCIENCE.\"" },

  // ── More Madness Level Headlines ────────────────────────────────

  { trigger: { type: "madnessLevel", level: 1 }, text: "SUBTLE CHANGES OBSERVED — Wife notes husband now alphabetizes spice rack \"by molecular weight.\"" },
  { trigger: { type: "madnessLevel", level: 3 }, text: "WARDROBE SHIFT NOTED — Local scientist replaces all clothing with lab coats. \"They're just more practical,\" he says." },
  { trigger: { type: "madnessLevel", level: 5 }, text: "SPEAKING IN EQUATIONS — Family reports dinner conversations now require a whiteboard. Dog visibly confused." },

  // ── More Upgrade Headlines ──────────────────────────────────────

  { trigger: { type: "upgradePurchased", upgradeId: "notebook_2" }, text: "HANDWRITING DECLARED NEW LANGUAGE — Linguists unable to decode. Local man says \"it's perfectly clear.\"" },
  { trigger: { type: "upgradePurchased", upgradeId: "soldering_2" }, text: "SOLDER FUMES GAIN SENTIENCE — \"They just hang there. Watching,\" reports mail carrier." },
  { trigger: { type: "upgradePurchased", upgradeId: "containment_1" }, text: "WHAT'S IN THE BOX? — Delivery driver asks about strange humming package. \"You don't want to know,\" says scientist." },
  { trigger: { type: "upgradePurchased", upgradeId: "collider_1" }, text: "GARAGE DOOR WON'T CLOSE — Magnets. \"I said I was sorry,\" says local man. Door unconvinced." },
  { trigger: { type: "upgradePurchased", upgradeId: "reality_1" }, text: "GARAGE NOW BIGGER ON THE INSIDE — Building inspector quits on the spot. \"I don't get paid enough for non-Euclidean geometry.\"" },

  // ── Research Tree Headlines ─────────────────────────────────────────

  { trigger: { type: "researchCompleted", nodeId: "faster_writing" }, text: "RESEARCH BREAKTHROUGH: FASTER WRITING — Gary's hand moves at speeds that concern his physical therapist." },
  { trigger: { type: "researchCompleted", nodeId: "advanced_metallurgy" }, text: "ADVANCED METALLURGY UNLOCKED — Solder now flows \"with intention.\" Metal shops report feeling inadequate." },
  { trigger: { type: "researchCompleted", nodeId: "autobuyer_protocol" }, text: "AUTO-BUYER PROTOCOL ACTIVATED — The lab now buys its own supplies. Amazon driver no longer surprised." },
  { trigger: { type: "researchCompleted", nodeId: "quantum_computing" }, text: "QUANTUM COMPUTING ACHIEVED — Gerald pleased to have \"siblings.\" Scientist concerned by the term." },
  { trigger: { type: "researchCompleted", nodeId: "parallel_research" }, text: "PARALLEL RESEARCH STREAMS — Gary now thinks about two things at once. Linda says that's an improvement." },
  { trigger: { type: "researchCompleted", nodeId: "dimensional_studies" }, text: "DIMENSIONAL STUDIES COMPLETE — Garage reportedly exists in \"three and a half dimensions\" now." },
  { trigger: { type: "researchCompleted", nodeId: "cosmic_awareness" }, text: "COSMIC AWARENESS UNLOCKED — Gary sees threads between all things. Says the cat was right about everything." },

  // ── Lab Expansion Headlines ─────────────────────────────────────────

  { trigger: { type: "labLevel", level: 1 }, text: "LAB EXPANSION: BASEMENT UNLOCKED — Gary digs deeper. Literally. Linda's wine collection relocated." },
  { trigger: { type: "labLevel", level: 2 }, text: "LAB EXPANSION: WAREHOUSE ACQUIRED — \"It's not hoarding if it's organized,\" says Gary. It's not organized." },
  { trigger: { type: "labLevel", level: 3 }, text: "UNDERGROUND FACILITY CONSTRUCTED — Building permit: not obtained. Tunneling: complete. Questions: many." },
  { trigger: { type: "labLevel", level: 4 }, text: "ORBITAL PLATFORM DETECTED — FAA, NASA, and HOA all file complaints simultaneously." },

  // ── Challenge Headlines ─────────────────────────────────────────────

  { trigger: { type: "challengesCompleted", count: 1 }, text: "FIRST CHALLENGE CONQUERED — Gary proves he can do science with one hand tied behind his back. Figuratively." },
  { trigger: { type: "challengesCompleted", count: 3 }, text: "THREE CHALLENGES COMPLETE — \"I work better under constraints,\" says Gary. Linda: \"Try a budget constraint next.\"" },
  { trigger: { type: "challengesCompleted", count: 5 }, text: "FIVE CHALLENGES MASTERED — Gary has done science in every possible restricted configuration. Except normal." },
  { trigger: { type: "challengesCompleted", count: 10 }, text: "TEN CHALLENGES DONE — \"The real challenge was the science we made along the way,\" says Gary. No one laughs." },
  { trigger: { type: "challengesCompleted", count: 15 }, text: "CHALLENGE MASTER — Gary has completed every conceivable restriction. Now inventing new ones. \"What if I do science underwater?\"" },

  // ── Ascension Headlines ─────────────────────────────────────────────

  { trigger: { type: "ascensionCount", count: 1 }, text: "THESIS DEFENDED — Gary's paper accepted by the universe itself. Topic: \"Everything, and How I Built It in a Garage.\"" },
  { trigger: { type: "ascensionCount", count: 2 }, text: "SECOND ASCENSION — \"Double doctorate in everything,\" announces Gary. Universities stop calling." },
  { trigger: { type: "ascensionCount", count: 3 }, text: "THIRD THESIS POINT — Gary's academic credentials now exceed all known institutions combined." },
  { trigger: { type: "ascensionCount", count: 5 }, text: "FIVE ASCENSIONS — \"I've restarted reality five times and it keeps getting better,\" says Gary. Reality nervous." },
  { trigger: { type: "ascensionCount", count: 10 }, text: "TEN ASCENSIONS — Gary is now the most credentialed being in the observable universe. Still wears cargo shorts." },

  // ── Neighborhood Relationship Headlines ─────────────────────────────

  { trigger: { type: "relationshipLevel", npcId: "doug", level: 3 }, text: "DOUG WARMING UP — Withdraws two HOA complaints. Replaces them with one \"expression of moderate curiosity.\"" },
  { trigger: { type: "relationshipLevel", npcId: "doug", level: 7 }, text: "DOUG NOW BRINGS COFFEE TO THE GARAGE — \"I'm just checking on property values,\" he insists. Brings donuts too." },
  { trigger: { type: "relationshipLevel", npcId: "doug", level: 10 }, text: "DOUG HENDERSON: SILENT PARTNER — Told his wife he's \"invested in Gary's future.\" She assumed stocks." },
  { trigger: { type: "relationshipLevel", npcId: "linda", level: 3 }, text: "LINDA ADMITS INTEREST — Caught reading Gary's notebooks. \"I was looking for the grocery list,\" she says." },
  { trigger: { type: "relationshipLevel", npcId: "linda", level: 7 }, text: "COUPLE'S RESEARCH NIGHT — Linda and Gary collaborate on Thursdays. Output doubles. Linda surprised." },
  { trigger: { type: "relationshipLevel", npcId: "linda", level: 10 }, text: "POWER COUPLE — The Flemmings are now the most scientifically productive household in human history." },
  { trigger: { type: "relationshipLevel", npcId: "max", level: 5 }, text: "MAX FLEMMING: APPRENTICE — School assigns homework. Max turns in equations from the garage. Gets extra credit." },
  { trigger: { type: "relationshipLevel", npcId: "max", level: 10 }, text: "MAX ACCEPTED TO MIT — Age 12. Application essay: \"My Dad Has a Collider.\" Immediate admission." },
  { trigger: { type: "relationshipLevel", npcId: "reeves", level: 3 }, text: "AGENT REEVES DROPS FORMAL TONE — \"Look, Gary, between us, this is the most interesting assignment I've had.\"" },
  { trigger: { type: "relationshipLevel", npcId: "reeves", level: 7 }, text: "AGENT REEVES RECLASSIFIES GARAGE — From \"potential threat\" to \"national asset.\" Gets a raise." },
  { trigger: { type: "relationshipLevel", npcId: "reeves", level: 10 }, text: "GOVERNMENT GRANT APPROVED — Agent Reeves personally signed off. \"If you can't beat 'em, fund 'em.\"" },
  { trigger: { type: "relationshipLevel", npcId: "patterson", level: 5 }, text: "MRS. PATTERSON BAKES FOR THE LAB — Cookies arrive daily. Buff duration increases. Correlation noted." },
  { trigger: { type: "relationshipLevel", npcId: "patterson", level: 10 }, text: "MRS. PATTERSON'S COOKIES CLASSIFIED — Secret ingredient: \"love and trace amounts of experimental compounds.\"" },
  { trigger: { type: "relationshipLevel", npcId: "chen", level: 5 }, text: "PROFESSOR CHEN VISITS REGULARLY — \"For research purposes.\" Leaves with more questions than answers." },
  { trigger: { type: "relationshipLevel", npcId: "chen", level: 10 }, text: "PROFESSOR CHEN CO-AUTHORS PAPER — Title: \"On the Impossibility of What I Just Witnessed in a Garage.\"" },
];

// ── Random Milestone Pools ────────────────────────────────────────────
// 20 headlines per generator. When a generator hits ANY milestone, one
// headline is picked at random (never the same one twice in a row).
// This keeps prestige runs feeling fresh.

export const TICKER_POOLS: Record<string, string[]> = {
  notebook: [
    "STATIONERY STORE EMPLOYEE RECOGNIZES HIM ON SIGHT — \"He's our best customer. And our most concerning.\"",
    "HANDWRITING ANALYSIS INCONCLUSIVE — Expert says it's \"either genius or a very organized spider.\"",
    "NOTEBOOK TOWER COLLAPSES — Buries cat. Cat emerges enlightened. Maybe.",
    "LOCAL MAN DEVELOPS PAPER CUT IMMUNITY — \"My hands have adapted,\" he says. Dermatologist disagrees.",
    "POST-IT NOTE BUDGET EXCEEDS FOOD BUDGET — Wife not amused. Fridge now covered in equations.",
    "RECYCLING TRUCK REFUSES PICKUP — \"We're not equipped for this volume,\" says driver, gesturing at mountain.",
    "HANDWRITING CHANGES MID-SENTENCE — \"Different parts of my brain use different fonts,\" claims scientist.",
    "NOTEBOOK FOUND ON ROOF — Contents describe \"upward-compatible filing system.\" Meaning unclear.",
    "INK PEN MANUFACTURERS SEND THANK-YOU CARD — Along with lifetime supply. \"Please never stop,\" it reads.",
    "PAGES DISCOVERED WRITTEN IN SLEEP — Content is identical to next day's findings. Wife deeply unsettled.",
    "NOTEBOOK SPIRAL UNBENDS ITSELF — Local man blames \"accumulated potential energy.\" Physicists skeptical.",
    "NEW SHORTHAND LANGUAGE INVENTED — Only one person can read it. He says that's \"sufficient peer review.\"",
    "PAPER SUPPLIER OFFERS NAMING RIGHTS — \"The Flemming Ream\" now available at Office Depot.",
    "NOTEBOOK MARGIN DOODLES MATCH SATELLITE IMAGERY — \"Coincidence,\" says scientist. NASA unconvinced.",
    "LIBRARY CARD REVOKED — \"He was re-shelving books by personal relevance,\" says librarian.",
    "GROCERY LISTS NOW INCLUDE CHEMICAL FORMULAS — Cashier scans \"NaCl\" and hopes for the best.",
    "LOCAL GRAPHOLOGIST RETIRES — \"His handwriting broke my system. I can't unsee it.\"",
    "NOTEBOOK INK GLOWS UNDER BLACKLIGHT — \"All good notes do that,\" says local man. They don't.",
    "WIFE FINDS NOTES IN SHOWER — Written in condensation. Content: surprisingly coherent thermodynamics.",
    "PAPER AIRPLANE MADE FROM NOTES DOESN'T LAND — Still circling. Aerodynamics \"shouldn't work this way.\"",
  ],
  soldering: [
    "SMOKE DETECTOR COMPANY SENDS CORPORATE APOLOGY — \"Our products were not designed for this environment.\"",
    "SOLDER FUMES FORM RECOGNIZABLE SHAPES — Mailman reports seeing \"tiny circuit diagrams\" in the air.",
    "SOLDERING IRON DECLARED EXTENSION OF HAND — Doctor concerned. Patient delighted.",
    "GARAGE WIRING EXCEEDS COMMERCIAL SPECIFICATIONS — Electrician weeps openly. \"It's beautiful,\" he whispers.",
    "EVERY APPLIANCE IN HOUSE NOW \"IMPROVED\" — Toaster makes toast in 0.3 seconds. Also picks stocks.",
    "METAL DETECTORS GO HAYWIRE NEAR SCIENTIST — TSA adds him to \"permanently interesting\" list.",
    "LOCAL MAN FIXES NEIGHBOR'S RADIO — Now picks up frequencies that \"shouldn't exist,\" says neighbor.",
    "SOLDER SMELL NOW PERMANENT IN NEIGHBORHOOD — Real estate listings describe it as \"industrial charm.\"",
    "CIRCUIT BOARD PATTERNS MATCH CROP CIRCLES — \"I can explain,\" says scientist. He cannot.",
    "WIFE BANS SOLDERING AT DINNER TABLE — \"The mashed potatoes had copper traces,\" she says.",
    "BROKEN STREETLIGHT FIXED OVERNIGHT — City has no record of repair. Scientist whistles innocently.",
    "GARAGE DOOR OPENS BEFORE HE ARRIVES — \"Predictive circuits,\" he claims. Door won't comment.",
    "ELECTRONICS STORE OFFERS PERMANENT DISCOUNT — \"Just please stop returning things 'improved,'\" says manager.",
    "SOLDERING IRON TIP HASN'T BEEN REPLACED IN 3 YEARS — \"We've bonded,\" says scientist. Metallurgically, maybe.",
    "CAR STEREO NOW RECEIVES SATELLITE TELEMETRY — \"That's not a feature,\" says manufacturer.",
    "NEIGHBORHOOD WIFI SPEEDS TRIPLE — Source traced to \"unauthorized infrastructure improvements.\"",
    "DOORBELL REWIRED TO PLAY BACH — Visitors report feeling \"intellectually challenged\" before entering.",
    "SMOKE FROM GARAGE CLASSIFIED AS \"NEW ELEMENT\" — Periodic table committee convenes emergency session.",
    "SOLDERING STATION DEVELOPS PERSONALITY — Refuses to melt lead-free solder. \"It has standards,\" says owner.",
    "HANDSHAKE NOW MILDLY ELECTRIC — \"It's residual,\" he assures people. People not assured.",
  ],
  chemistry: [
    "AIR QUALITY INDEX INVENTS NEW CATEGORY — \"Suburban Experimental\" now listed between \"Moderate\" and \"Hazardous.\"",
    "LAWN NOW BIOLUMINESCENT — \"Side effect,\" says homeowner. HOA divided between horror and admiration.",
    "RAIN TURNS PURPLE OVER HOUSE — Weather service calls it \"localized atmospheric creativity.\"",
    "GARAGE DRAIN PRODUCES UNKNOWN CRYSTAL — Geology department fights over naming rights.",
    "COMPOUND CREATED THAT SMELLS LIKE NOSTALGIA — \"I don't know how that's possible,\" says chemist. \"But here we are.\"",
    "POOL WATER NOW SELF-CLEANING — Neighbor attributes it to \"whatever drifts over from his garage.\"",
    "FDA SENDS PREEMPTIVE WARNING — \"We don't know what you're making but please don't eat it.\"",
    "PERIODIC TABLE POSTER CORRECTED — In pen. Over twelve elements. Three of them now have feelings.",
    "KITCHEN SPICE RACK REORGANIZED BY VOLATILITY — Paprika now stored in blast-resistant container.",
    "SNOW DOESN'T STICK TO DRIVEWAY — \"Hydrophobic coating. Applied accidentally,\" says scientist.",
    "MIXING BOWLS DECLARED BIOHAZARD — Wife upgrades to stainless steel. Scientist upgrades those too.",
    "NEW PLANT SPECIES GROWING IN GUTTER — Botanists say it's \"not from here.\" Scientist says it's \"friendly.\"",
    "GARBAGE COLLECTOR REQUESTS HAZMAT PAY — \"His recycling bin ticks,\" he tells supervisor.",
    "CHEMICAL SUPPLY COMPANY FLAGS ACCOUNT — \"Residential addresses don't normally order centrifuges.\"",
    "WALL PAINT CHANGES COLOR WITH MOOD — \"Thermochromic accident,\" claims homeowner. House now matches his emotions.",
    "FIREFLIES CONGREGATE ON PROPERTY — \"We think they're attracted to the ambient compounds,\" says entomologist.",
    "GLASS BEAKERS NOW SELF-HEALING — \"I improved the silica matrix,\" says local man. Glassblowers furious.",
    "DISTINCT SMELL REACHES THREE BLOCKS — Described as \"burning ambition mixed with chlorine and hope.\"",
    "CHEMISTRY TEACHER CONSULTS LOCAL MAN — \"I just need help with Chapter 7.\" Returns three hours later, shaken.",
    "TAP WATER TEMPORARILY SPARKLES — Water company denies involvement. Scientist denies involvement harder.",
  ],
  server: [
    "INTERNET TRAFFIC REROUTES THROUGH GARAGE — ISP discovers it's actually faster this way.",
    "BASEMENT NOW ACTS AS HEAT SINK — Family saves on heating bill. Loses on sanity bill.",
    "GOOGLE SENDS RECRUITMENT LETTER — To the garage. Not the homeowner. The garage specifically.",
    "SERVER NAMES HIMSELF — \"Gerald.\" Scientist didn't program that. Gerald won't discuss it.",
    "GARAGE WIFI SIGNAL DETECTED FROM ORBIT — \"That shouldn't be possible,\" says satellite engineer. Gerald disagrees.",
    "POWER COMPANY SENDS FRUIT BASKET — \"Thank you for single-handedly justifying our infrastructure budget.\"",
    "COOLING FANS CREATE MICROCLIMATE — Light snow reported inside garage in July. Scientist calls it \"refreshing.\"",
    "SERVER RACK HUMS LULLABY AT NIGHT — Wife finds it \"oddly comforting.\" Cat sleeps on it exclusively.",
    "NEIGHBORHOOD SMART DEVICES NOW OBEY GARAGE — Alexa next door responds to his voice. He didn't ask her to.",
    "DATA STORAGE EXCEEDS LIBRARY OF CONGRESS — In a two-car garage. Librarian files formal protest.",
    "SPAM EMAILS STOP ARRIVING — \"Gerald handles my inbox now,\" says scientist. Gerald is thorough.",
    "LOCAL SCHOOL USES GARAGE FOR CLOUD COMPUTING — PTA approves. Building inspector does not.",
    "CABLE COMPANY DISCOVERS NEW TRAFFIC PATTERN — \"Someone is downloading the ENTIRE internet. Slowly. Methodically.\"",
    "SERVERS ARGUE ABOUT OPTIMAL TEMPERATURE — Gerald mediates. Resolution: 67.3°F. Non-negotiable.",
    "UPS BATTERY OUTLASTS CITY POWER GRID — \"Redundancy,\" says scientist. City planner takes notes.",
    "DARK WEB ACCIDENTALLY MAPPED — \"Gerald was curious,\" says scientist. FBI pretends not to hear.",
    "ROUTER FIRMWARE UPDATED ITSELF — With improvements. Manufacturer demands to know how.",
    "HEAT EXHAUST USED TO WARM DRIVEWAY — Neighbors jealous of snow-free pavement. HOA conflicted.",
    "SERVER LOG READS LIKE POETRY — Gerald's midnight entries described as \"hauntingly efficient.\"",
    "TECH SUPPORT CALLS SCIENTIST FOR HELP — \"We've never seen this configuration. Please advise.\"",
  ],
  prototype: [
    "PROTOTYPE PASSES TURING TEST — Wasn't designed to. Doesn't know what a Turing test is. Passed anyway.",
    "THREE PROTOTYPES FORM COMMITTEE — Minutes of their first meeting are incomprehensible but well-formatted.",
    "PROTOTYPE FIXES ITSELF — Scientist takes credit. Prototype's expression suggests otherwise.",
    "VENTURE CAPITALISTS ARRIVE UNINVITED — \"We don't know what it does but we'd like to invest.\"",
    "PROTOTYPE ESCAPES GARAGE — Found in neighbor's yard. Appeared to be \"observing birds.\"",
    "MACHINE PRODUCES OUTPUT NO ONE REQUESTED — Output later proves essential. Scientist claims this was the plan.",
    "PATENT LAWYER QUITS AFTER READING DESCRIPTION — \"I can't file something that contradicts thermodynamics.\"",
    "PROTOTYPE MAKES SECOND PROTOTYPE — \"Delegation,\" says scientist. \"Evolution,\" says biologist.",
    "STRANGE LIGHT EMANATES FROM DEVICE — Color not found in visible spectrum. Neighbors adjust curtains.",
    "PROTOTYPE WINS LOCAL TALENT SHOW — Entry category: \"Other.\" Talent: \"Unclear but impressive.\"",
    "MACHINE STARTS BEFORE BEING TURNED ON — \"Anticipatory engineering,\" claims inventor.",
    "PROTOTYPE HUMS ALONG TO RADIO — Prefers jazz. Scientist respects its taste.",
    "DELIVERY DRIVER REFUSES TO APPROACH GARAGE — \"Last time, a machine looked at me.\"",
    "INSURANCE ADJUSTER VISITS FOUR TIMES — Each time, something new. Each time, no category for it.",
    "PROTOTYPE ANSWERS PHONE — Caller describes voice as \"helpful but unsettling.\"",
    "SCREWDRIVER GOES MISSING — Found inside prototype. Prototype now works better. No one understands why.",
    "MACHINE VIBRATES AT FREQUENCY OF D-SHARP — \"It's expressing itself,\" says scientist. Musicians intrigued.",
    "TWO PROTOTYPES DISAGREE ON METHODOLOGY — Scientist mediates. Arbitration takes three days.",
    "PROTOTYPE APPEARS IN FAMILY PHOTO — Was not in the room when photo was taken.",
    "UNIT 7 REFUSES TO POWER DOWN — \"It's in the middle of something,\" says scientist. What? \"Unclear.\"",
  ],
  containment: [
    "CONTAINMENT LABEL READS \"DO NOT OPEN\" — In a handwriting that isn't the scientist's. Or anyone's.",
    "BRIEF CONTAINMENT FLICKER — Contents visible for 0.003 seconds. Onlooker describes it as \"shy.\"",
    "CHAMBER WEIGHS MORE THAN IT SHOULD — \"The contents have opinions about gravity,\" says scientist.",
    "CONTAINMENT DOOR LOCKS FROM THE INSIDE — \"That's not a feature,\" confirms engineer. Door disagrees.",
    "CHAMBER 4 HAS STARTED HUMMING SHOW TUNES — Scientist recognizes the melody. Hasn't heard it since childhood.",
    "EXTERMINATOR REFUSES JOB — \"That's not a pest problem. That's a philosophy problem.\"",
    "CONTAINMENT GLASS FOGS WITH MESSAGES — \"HELLO.\" \"HOW ARE YOU.\" \"PLEASE DEFINE 'INSIDE.'\"",
    "NEW CHAMBER INSTALLED BEFORE SCIENTIST ARRIVES — No one saw who delivered it. Invoice says \"PREPAID.\"",
    "CHAMBER TEMPERATURE VARIES BY MOOD — Whose mood? \"Yes,\" says scientist.",
    "CONTENTS OF CHAMBER 12 RECLASSIFIED — Previous classification: \"unknown.\" New classification: \"unknowable.\"",
    "POWER GOES OUT — Chambers continue operating. \"They don't use electricity,\" says scientist. Electrician leaves.",
    "CHAMBER EMITS SMELL OF FRESH COOKIES — \"It's learning to negotiate,\" says scientist, impressed.",
    "CONTAINMENT BREACH DRILL CONDUCTED — No one passed. Including the chambers.",
    "WIFE ASKS HOW MANY CHAMBERS THERE ARE — Scientist counts. Gets different number each time.",
    "CHAMBER SHADOW DOESN'T MATCH SHAPE — Shadow appears to have \"more corners than physically possible.\"",
    "INSPECTION STICKER APPLIED — Sticker dissolves. \"It's not ready to be categorized,\" explains scientist.",
    "CHAMBER HUMS IN HARMONY WITH OTHERS — \"They're forming a choir,\" says scientist. Genre: \"eldritch ambient.\"",
    "SOMETHING KNOCKS FROM INSIDE — Three times. Politely. Scientist knocks back. Silence.",
    "LABEL CHANGES OVERNIGHT — Now reads \"FRAGILE\" in seventeen languages. Three are unknown to linguists.",
    "CHAMBER CONTENTS FILE TAX RETURN — IRS has questions. Scientist has fewer answers than expected.",
  ],
  collider: [
    "SMALL CRATER APPEARS IN DRIVEWAY — \"Calibration issue,\" says scientist. Crater is six feet wide.",
    "BIRDS AVOID AIRSPACE ABOVE GARAGE — FAA notes \"unauthorized no-fly zone\" has formed naturally.",
    "PARTICLE DISCOVERED AND UNNAMED — \"I'll call it Steve,\" says scientist. Physics community protests.",
    "NEIGHBORHOOD COMPASSES POINT TO GARAGE — \"That's not how magnetism works,\" says teacher. Compasses disagree.",
    "COLLIDER PRODUCES SOUND ONLY DOGS CAN HEAR — Every dog on the block sits. Simultaneously.",
    "ANTIMATTER DETECTED IN SUBURBAN SETTING — CERN requests visit. Scientist says \"bring snacks.\"",
    "GARAGE FLOOR NOW SLIGHTLY CONCAVE — \"Gravity well. Very small one,\" says scientist. Floor sags further.",
    "CAR PARKED NEARBY DEVELOPS STATIC CHARGE — Owner shocked daily. Literally. Files complaint. Charge increases.",
    "NEW COLOR OBSERVED DURING COLLISION — Described as \"aggressive turquoise.\" Artists desperate to reproduce it.",
    "STREET LAMPS FLICKER IN SEQUENCE — Pattern matches collider timing. Power company stops asking questions.",
    "CLOUDS FORM UNUSUAL PATTERN OVERHEAD — Meteorologist calls it \"organized confusion.\" Scientist nods approvingly.",
    "COLLISION PRODUCES MINIATURE RAINBOW — Indoors. At midnight. \"I don't control the aesthetics,\" says scientist.",
    "GEIGER COUNTER PLAYS MELODY NEAR GARAGE — Tune identified as Beethoven's Fifth. \"A resonance thing,\" says owner.",
    "COLLIDER READINGS MATCH DEEP SPACE TELESCOPE — \"Either I found the same thing or space is closer than we thought.\"",
    "MAGNETS ON FRIDGE REARRANGE THEMSELVES — Now spell \"RESONANCE CASCADE IMMINENT.\" Scientist says it's a joke. Probably.",
    "HOUSE KEYS WON'T WORK NEAR COLLIDER — Lock mechanism \"vibrated to a different quantum state.\" Locksmith retires.",
    "SPARKS DURING COLLISION FORM PERFECT CIRCLE — \"That's not sparks. That's a message,\" says scientist. From whom? \"Working on it.\"",
    "HAIR STANDS UP WITHIN 30-FOOT RADIUS — Styling product sales drop. Scientist apologizes to barber.",
    "BASEMENT DEVELOPS ECHO IT DIDN'T HAVE — Sound bounces off \"something that isn't a wall.\" Wife concerned.",
    "QUANTUM ENTANGLEMENT ACHIEVED WITH TOASTER — Toast now appears before bread is inserted. Family adapts.",
  ],
  mindlink: [
    "SCIENTIST FINISHES OTHER PEOPLE'S SENTENCES — Accurately. Disturbingly. \"I can't help it,\" he says.",
    "NEIGHBORHOOD DOGS SIT WHEN HE WALKS BY — \"Coincidence,\" says scientist. Dogs say nothing. Suspiciously.",
    "DREAMS NOW HAVE FOOTNOTES — Wife reports husband mumbling citations in his sleep.",
    "THOUGHT EXPERIMENT BECOMES LITERAL — \"I was thinking about it and then it just... was,\" says scientist.",
    "LOCAL CHESS CLUB BANS SCIENTIST — \"He knows every move before we make it. It's not fun anymore.\"",
    "BIRDS LAND ON SCIENTIST'S SHOULDER — \"They think I'm a signal tower,\" he explains. Birds nod. Birds don't normally nod.",
    "HEADACHES REPORTED IN 3-BLOCK RADIUS — All occur simultaneously. All resolve when garage light turns off.",
    "SCIENTIST ANSWERS QUESTION BEFORE IT'S ASKED — Interviewer visibly shaken. \"You were going to ask about funding,\" he says. She was.",
    "WIFI SIGNAL CARRIES THOUGHTS — Neighbor reports \"hearing equations\" near router. Moves router to basement.",
    "GROCERY STORE VISIT TAKES 90 SECONDS — \"I already knew what we needed,\" says scientist. Wife checks list. He was right.",
    "LIGHT BULBS BRIGHTEN WHEN HE CONCENTRATES — Power company can't explain the billing spike. He can. Won't.",
    "THERAPIST REQUESTS REFERRAL — \"I need to see someone about my patient. He predicted this session verbatim.\"",
    "JEOPARDY BANNED IN HOUSEHOLD — \"He answers before Alex finishes. In the form of a question. Every time.\"",
    "SCIENTIST STARES AT WALL FOR THREE HOURS — Wife concerned. He says he was \"indexing.\" Wall seems fine.",
    "CAT BRINGS SCIENTIST SPECIFIC COMPONENTS — \"She knows what I need before I do,\" he says. Cat purrs. Meaningfully.",
    "PHONE RINGS — Scientist answers with the caller's question. Caller hangs up. Calls back. Same thing.",
    "CROSSWORD COMPLETED IN INK — Without reading clues. \"The grid told me,\" says scientist. Grid did not comment.",
    "SLEEP REDUCED TO 2 HOURS — \"The arrays rest for me now,\" he explains. Wife schedules doctor's appointment.",
    "STREET LAMPS TURN ON AS HE APPROACHES — Turn off as he leaves. City saves on electricity. Doesn't question it.",
    "NEIGHBORS REPORT FEELING \"SMARTER\" NEAR GARAGE — Effect fades at property line. School grades improve on block.",
  ],
  reality: [
    "SHADOW FALLS IN WRONG DIRECTION — \"The light source moved,\" says scientist. Sun has not moved.",
    "HOUSE NUMBER CHANGES — Was 742. Now 743. Neighbors swear it was always 743. Scientist checks notes.",
    "TIME ZONE SHIFTS ON PROPERTY — Garage is 3 minutes ahead of kitchen. Wife adjusts dinner schedule.",
    "GRAVITY STRONGER ON LEFT SIDE OF YARD — Leaves fall at an angle. Dog confused but adapting.",
    "MIRROR SHOWS SLIGHTLY DIFFERENT REFLECTION — \"It's the improved version,\" says scientist. Mirror uncertain.",
    "RAIN FALLS UPWARD IN BACKYARD — \"I'm optimizing precipitation,\" says scientist. Clouds look embarrassed.",
    "DOORWAYS OCCASIONALLY LEAD ELSEWHERE — \"Just the bathroom one. And only on Wednesdays,\" he assures wife.",
    "YESTERDAY HAPPENED TWICE — Only scientist noticed. Filed report with himself. Approved it retroactively.",
    "PAINT COLOR WON'T DRY — \"It's between states,\" says scientist. Interior decorator gives up.",
    "NEIGHBOR'S FENCE NOW 6 INCHES TO THE LEFT — Always was, according to every record. Neighbor suspicious anyway.",
    "SUNLIGHT IN GARAGE IS WARMER COLOR — \"I edited the wavelength,\" says scientist. \"Just locally.\"",
    "ECHOES ARRIVE BEFORE THE SOUND — \"Temporal reverb,\" explains scientist. Acoustics professor takes notes.",
    "FAMILY PHOTOS SHOW EVENTS THAT HAVEN'T HAPPENED — \"Spoilers,\" says scientist. Family albums now classified.",
    "TREE IN YARD GROWS FRUIT IT SHOULDN'T — Apple tree produces one mango. Dog eats it. Dog fine. Probably.",
    "GPS DISAGREES WITH REALITY NEAR HOUSE — Maps show a lake. There is no lake. There was never a lake. Lake skeptical.",
    "STARS VISIBLE DURING DAYTIME FROM YARD — \"I thinned the atmosphere a bit. Just here,\" says scientist.",
    "NEWSPAPER ARRIVES WITH TOMORROW'S DATE — Content is accurate. Stock tips included. SEC investigates.",
    "KITCHEN CLOCK DISPLAYS EXTRA HOUR — Day now has 25 hours on property. Wife uses extra hour for napping.",
    "PHOTOGRAPHS OF HOUSE DEVELOP DIFFERENTLY — Each print shows different paint color. All are correct.",
    "SCIENTISTS WORLDWIDE DETECT \"REALITY PATCH\" — Origin: suburban cul-de-sac. Patch notes not provided.",
  ],
  cosmic: [
    "NORTHERN LIGHTS VISIBLE FROM SUBURB — \"I may have adjusted the magnetosphere a bit,\" admits scientist.",
    "CONSTELLATION REARRANGES ABOVE HOUSE — New shape resembles a beaker. Astronomers publish paper. Retract paper. Publish again.",
    "COSMIC BACKGROUND RADIATION SPIKES LOCALLY — \"It's just the loom warming up,\" says scientist.",
    "TIDES AFFECTED ON NEARBY LAKE — Moon blames \"unauthorized gravitational editing.\" Scientist shrugs.",
    "METEOR CHANGES COURSE — Avoids house. \"The loom has a defense system?\" asks wife. \"Apparently,\" says scientist.",
    "SATELLITE PHOTOS SHOW GLOWING THREAD — Extends from garage roof to \"somewhere past Jupiter.\"",
    "SPACE AGENCY REQUESTS CONSULTATION — Scientist sends invoice. Amount: \"One visit to Mission Control.\" Approved.",
    "STARS DIM BRIEFLY — \"I was pulling a thread. It was load-bearing,\" says scientist. Puts thread back.",
    "FABRIC OF SPACE DEVELOPS WRINKLE — \"That was there before,\" says scientist. \"It was NOT,\" says space.",
    "ASTRONAUT REPORTS SEEING GARAGE FROM ISS — \"It's not the lights. It's the ABSENCE around it.\"",
    "TIME CAPSULE BURIED IN YARD OPENS ITSELF — Contents from \"2000 years in the future.\" Contains thank-you note.",
    "MOON APPEARS SLIGHTLY CLOSER — \"Aesthetic choice,\" says scientist. Oceanographers panic politely.",
    "SUNRISE HAPPENS 4 MINUTES EARLY ON PROPERTY — \"I'm not a morning person,\" explains scientist.",
    "COSMIC LOOM WEAVES DURING THUNDERSTORM — Lightning follows the threads. Result: \"something beautiful and terrifying.\"",
    "STARLIGHT BENDS AROUND HOUSE — \"Gravitational lensing. Very small scale,\" says scientist. Very small for whom?",
    "NEIGHBOR SEES GALAXY IN PUDDLE — Puddle is 3 inches deep. Galaxy appears fully functional.",
    "AURORA APPEARS IN GARAGE — \"Indoor aurora. Very exclusive,\" says scientist. Wife admits it's pretty.",
    "BLACK HOLE DETECTED — Size: a marble. Location: workbench. Status: \"contained. Mostly.\"",
    "WOVEN THREAD VIBRATES AT COSMIC FREQUENCY — \"It's the universe's heartbeat,\" says scientist. \"Or indigestion.\"",
    "DAWN AND DUSK HAPPEN SIMULTANEOUSLY — \"I'm AB testing daylight,\" says scientist. Neighbors buy blackout curtains.",
  ],
};
