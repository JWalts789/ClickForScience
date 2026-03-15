// ── Seasonal Content ───────────────────────────────────────────────
// Real-world date-triggered special tickers and lab notes.

export interface SeasonalContent {
  id: string;
  /** Month (1-12) and day range (inclusive). */
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
  tickers: string[];
  note?: {
    title: string;
    body: string;
  };
}

export const SEASONAL_CONTENT: SeasonalContent[] = [
  // ── New Year ────────────────────────────────────────────────────────
  {
    id: "new_year",
    startMonth: 12, startDay: 31,
    endMonth: 1, endDay: 2,
    tickers: [
      "HAPPY NEW YEAR — Gary's resolution: \"More science, less sleep.\" Linda's resolution: \"Fewer explosions.\" Compromise unlikely.",
      "NEW YEAR'S EVE IN THE LAB — Countdown conducted via particle accelerator. Ball dropped at 0.97c.",
      "GARY RINGS IN NEW YEAR — Neighbors report fireworks \"of unknown chemical composition\" from suburban garage.",
    ],
    note: {
      title: "New Year's Resolutions",
      body: "January 1st. Linda made me write resolutions. Hers: 'Be a better husband.' Mine: 'Achieve cold fusion by March.' She crossed mine out and wrote 'Also that one' under hers. I added a footnote about the fusion. She hasn't noticed yet.",
    },
  },

  // ── Valentine's Day ────────────────────────────────────────────────
  {
    id: "valentines",
    startMonth: 2, startDay: 13,
    endMonth: 2, endDay: 15,
    tickers: [
      "VALENTINE'S DAY — Gary builds Linda a card. It has moving parts. And a small laser. She appreciates the effort if not the singed eyebrows.",
      "ROMANTIC GESTURE BACKFIRES — Heart-shaped containment field collapses. \"It's the thought that counts,\" says Linda, extinguishing roses.",
      "LOVE IS IN THE AIR — Literally. Gary's latest experiment has aerosolized something pink. Doug sneezes hearts.",
    ],
    note: {
      title: "Valentine's Day",
      body: "Made Linda a card. Handmade. She specifically said handmade. She did NOT say 'hand-engineered with micro-servo articulation and embedded LEDs.' But she smiled. For a second, before the battery caught fire. I'll take it.",
    },
  },

  // ── April Fools ────────────────────────────────────────────────────
  {
    id: "april_fools",
    startMonth: 3, startDay: 31,
    endMonth: 4, endDay: 2,
    tickers: [
      "APRIL FOOLS — Gary reverses the polarity on Doug's sprinklers. Water goes UP. Doug is not amused. The neighborhood is.",
      "PRANK OR BREAKTHROUGH? — Local scientist's joke accidentally validates string theory. \"I was just messing around,\" he insists.",
      "APRIL 1ST INCIDENT — All clocks on Elm Street run backwards for 3 hours. \"Definitely a prank,\" says Gary, unconvincingly.",
    ],
    note: {
      title: "April 1st",
      body: "Told Linda I'd stop doing science for a day. She believed me for about four minutes. In my defense, the collider was already running when I made the promise. You can't just STOP a collider. That's dangerous. More dangerous than running it, anyway. Probably.",
    },
  },

  // ── Independence Day ───────────────────────────────────────────────
  {
    id: "july_4th",
    startMonth: 7, startDay: 3,
    endMonth: 7, endDay: 5,
    tickers: [
      "4TH OF JULY — Gary's homemade fireworks visible from low earth orbit. NASA sends polite cease-and-desist.",
      "INDEPENDENCE DAY CELEBRATION — Neighborhood BBQ enhanced with \"experimental marinades.\" Burgers achieve sentience briefly.",
      "PATRIOTIC SCIENCE — Gary flies homemade flag from garage antenna. Flag is slightly radioactive. \"It glows at night. Festive,\" he says.",
    ],
    note: {
      title: "July 4th",
      body: "Doug invited us to his cookout. I brought my improved charcoal lighter. In hindsight, plasma-based ignition is overkill for hot dogs. Doug's eyebrows will grow back. The hot dogs were perfect though. PERFECT.",
    },
  },

  // ── Halloween ──────────────────────────────────────────────────────
  {
    id: "halloween",
    startMonth: 10, startDay: 29,
    endMonth: 11, endDay: 1,
    tickers: [
      "HALLOWEEN ON ELM STREET — Gary's \"haunted garage\" too realistic. Three kids quit trick-or-treating permanently.",
      "BEST HALLOWEEN DECORATIONS — Local scientist's lab requires no additional decoration. \"It's already terrifying,\" says Doug.",
      "TRICK OR TREAT — Max goes as \"Dad\" for Halloween. Costume: lab coat, wild hair, thousand-yard stare. Wins first place.",
    ],
    note: {
      title: "Halloween Night",
      body: "Max wanted me to make the garage scary for trick-or-treaters. I just opened the door and turned the lights on. Three kids cried. One asked if I was a real mad scientist. I said no. Max said 'He's lying.' Linda made me close the door after that.",
    },
  },

  // ── Thanksgiving ───────────────────────────────────────────────────
  {
    id: "thanksgiving",
    startMonth: 11, startDay: 22,
    endMonth: 11, endDay: 28,
    tickers: [
      "THANKSGIVING — Gary is thankful for science. Linda is thankful the garage hasn't exploded this month. Both valid.",
      "TURKEY OPTIMIZATION — Local scientist cooks turkey \"at the molecular level.\" Family agrees it's the best they've had but won't ask how.",
      "HOLIDAY DINNER — Doug joins the Flemmings for Thanksgiving. Leaves early citing \"the table was levitating slightly.\"",
    ],
    note: {
      title: "Thanksgiving",
      body: "Linda asked what I'm thankful for. I started listing isotopes. She stopped me at Uranium-235 and said 'family, Gary, you're thankful for FAMILY.' She's right. I'm thankful for family. And Uranium-235. In that order. Mostly.",
    },
  },

  // ── Christmas ──────────────────────────────────────────────────────
  {
    id: "christmas",
    startMonth: 12, startDay: 23,
    endMonth: 12, endDay: 26,
    tickers: [
      "MERRY CHRISTMAS — Garage decorated with \"experimental lighting.\" Visible from three counties. Power grid strained.",
      "CHRISTMAS MORNING — Max unwraps gift from Dad. It's a working miniature collider. Linda's face: priceless. And furious.",
      "HOLIDAY SPIRIT — Gary builds robot to deliver presents. Robot achieves autonomy. Currently delivering presents unsupervised in neighboring state.",
    ],
    note: {
      title: "Christmas Day",
      body: "Got Max a chemistry set. A REAL one. Linda vetoed the uranium samples but let me keep the centrifuge. Compromise. That's what marriage is. Max already mixed something that changed the cat's fur color. I've never been more proud. Linda has never been more concerned. Christmas is perfect.",
    },
  },

  // ── Pi Day ─────────────────────────────────────────────────────────
  {
    id: "pi_day",
    startMonth: 3, startDay: 14,
    endMonth: 3, endDay: 14,
    tickers: [
      "HAPPY PI DAY — Gary recites pi to 10,000 digits. Unprompted. During dinner. Linda leaves the table at digit 847.",
      "PI DAY CELEBRATION — Local scientist bakes pie. Pie is circular to within 0.0001mm. \"It's about precision,\" he says, tears in his eyes.",
    ],
  },

  // ── Friday the 13th ────────────────────────────────────────────────
  {
    id: "friday_13th",
    startMonth: 0, startDay: 13, // Special: any month, day 13 + friday check
    endMonth: 0, endDay: 13,
    tickers: [
      "FRIDAY THE 13TH — Experiments yield 13% more results today. Coincidence? Gary doesn't believe in those anymore.",
      "UNLUCKY DAY? — Gary's equipment malfunctions in exactly 13 ways. Each malfunction accidentally improves output. \"Luck is just unrecognized science.\"",
    ],
  },
];

/**
 * Check if a date falls within a seasonal content window.
 * Month 0 = special handling (e.g., any month with day check).
 */
function isDateInRange(
  month: number,
  day: number,
  content: SeasonalContent
): boolean {
  // Special case: Friday the 13th
  if (content.id === "friday_13th") {
    const today = new Date();
    return day === 13 && today.getDay() === 5; // Friday = 5
  }

  const { startMonth, startDay, endMonth, endDay } = content;

  // Handle year-wrap (e.g., Dec 31 - Jan 2)
  if (startMonth > endMonth) {
    // Either in the end-of-year portion or start-of-year portion
    if (month === startMonth) return day >= startDay;
    if (month === endMonth) return day <= endDay;
    if (month > startMonth || month < endMonth) return true;
    return false;
  }

  // Same month
  if (startMonth === endMonth) {
    return month === startMonth && day >= startDay && day <= endDay;
  }

  // Multi-month range
  if (month === startMonth) return day >= startDay;
  if (month === endMonth) return day <= endDay;
  return month > startMonth && month < endMonth;
}

/**
 * Get all active seasonal content for the current date.
 */
export function getActiveSeasonalContent(): SeasonalContent[] {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();

  return SEASONAL_CONTENT.filter((c) => isDateInRange(month, day, c));
}
