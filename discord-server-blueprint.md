# CandleSmoke Games — Discord Server Blueprint

## Server Name
CandleSmoke Games

## Server Description
Home of Click, For Science! and future CandleSmoke Games titles. Bug reports, strategy discussion, patch notes, and community vibes.

---

## Roles (top to bottom, highest priority first)

| Role | Color | Permissions | How to Get |
|------|-------|-------------|------------|
| 🕯️ Developer | `#FF6B35` (orange) | Administrator | You (and any future team members) |
| 🧪 Beta Tester | `#C792EA` (purple) | View beta channels, attach files | Manually assigned to trusted testers |
| 🏆 Leaderboard Champion | `#FFD700` (gold) | Display role | Top 3 on any leaderboard category |
| 🔬 Mad Scientist | `#C3E88D` (green) | Display role | Reached Ascension in-game |
| 🧑‍🔬 Lab Assistant | `#82AAFF` (blue) | Display role | Auto-assigned on join (default role) |
| 🤖 Bot | `#99AAB5` (gray) | Send messages, embed links | Bot accounts |

---

## Channel Structure

### 📢 INFO
> *Read-only channels for official communications*

**#welcome**
> Welcome to the CandleSmoke Games community! 🕯️
>
> **Click, For Science!** is an idle clicker about a normal guy in his garage who slowly becomes a mad scientist.
>
> 🎮 **Play now:** [link to Vercel deployment]
> 📋 **Quick links:**
> • `#patch-notes` — Latest updates
> • `#bug-reports` — Found a bug? Report it here
> • `#strategy` — Tips, tricks, and builds
> • `#leaderboards` — Compete with other scientists
>
> **Rules:**
> 1. Be respectful — Gary's garage has room for everyone
> 2. No spoilers without spoiler tags — use `||spoiler text||`
> 3. Bug reports go in `#bug-reports`, not general chat
> 4. No cheating discussion or save editing tools
> 5. Self-promotion in `#your-creations` only
>
> Pick up your lab coat and enjoy your stay! 🔬

**#rules**
> (Mirror the rules from #welcome in a clean embed format)

**#patch-notes**
> *Developer-only posting. Players can react but not message.*
> Post format:
> ```
> ## v0.X.X — [Patch Name]
> **Date:** YYYY-MM-DD
>
> ### New Features
> - Feature description
>
> ### Balance Changes
> - Change description
>
> ### Bug Fixes
> - Fix description
>
> 🔗 Play now: [link]
> ```

**#roadmap**
> *Developer-only posting. Pin the current roadmap image/text.*
> Shows upcoming features, what's in progress, and what's planned.

---

### 💬 COMMUNITY
> *General hangout channels*

**#general**
> General discussion about Click, For Science! and CandleSmoke Games.
> Keep it friendly — this is Gary's neighborhood after all.

**#introductions**
> New here? Tell us about yourself! What's your archetype? How far along are you?

**#off-topic**
> Not about the game? That's fine. Talk about whatever here.
> Keep it SFW and respectful.

**#memes-and-screenshots**
> Post your funniest lab notes, cursed archetype combos, and flex screenshots.
> *Slowmode: 30 seconds*

**#your-creations**
> Fan art, fan fiction, spreadsheets, calculators, or anything you've made inspired by the game.

---

### 🔬 CLICK, FOR SCIENCE!
> *Game-specific channels*

**#strategy**
> Share builds, optimal prestige timing, archetype tier lists, challenge run strats, and generator priority guides.

**#leaderboards**
> Discuss leaderboard rankings, celebrate new records, and challenge each other.
> *Weekly recap posts encouraged.*

**#lore-and-story**
> Discuss the narrative, lab notes, events, NPC dialogue, and the deep lore of Gary's descent into madness.
> ⚠️ **Spoiler tags required** for late-game content (Ascension+).

**#bug-reports**
> Found a bug? Post it here with:
> • What happened
> • What you expected
> • Browser + OS
> • Screenshot if possible
> • Your save code (export from Settings) if relevant
>
> *Use the thread feature for follow-up discussion on each bug.*

**#suggestions**
> Have an idea for the game? Post it here!
> React with 👍 to upvote suggestions you like.
> *Devs read everything here but can't promise implementation.*

---

### 🧪 BETA (visible to Beta Tester role only)
> *Early access to upcoming features*

**#beta-announcements**
> New beta builds and what to test.

**#beta-feedback**
> Feedback on beta features. Be specific and constructive.

**#beta-bugs**
> Bugs found in beta builds only.

---

### 🕯️ CANDLESMOKE (visible to Developer role only)
> *Internal dev channels*

**#dev-log**
> Internal development notes and progress tracking.

**#dev-chat**
> Freeform dev discussion.

---

## Suggested Bots

| Bot | Purpose |
|-----|---------|
| **Carl-bot** | Reaction roles, auto-mod, welcome messages, logging |
| **GitHub Bot** | Post commit/PR notifications to #dev-log |
| **Disboard** | Server listing for discoverability |

### Carl-bot Reaction Role Setup (for #welcome)
Create a reaction role message:
```
React to pick your dominant archetype!

👁 — Megalomaniac
◎ — Perfectionist
☣ — Unhinged
◇ — Reality Breaker
⚙ — Gadgeteer
✦ — Accidental Genius
```
Each reaction assigns a cosmetic archetype role (display only, same color as in-game).

### Archetype Cosmetic Roles

| Role | Color | Emoji |
|------|-------|-------|
| Megalomaniac | `#FF5370` | 👁 |
| Perfectionist | `#82AAFF` | ◎ |
| Unhinged | `#C3E88D` | ☣ |
| Reality Breaker | `#C792EA` | ◇ |
| Gadgeteer | `#FFCB6B` | ⚙ |
| Accidental Genius | `#89DDFF` | ✦ |

---

## Server Settings Checklist

- [ ] Set server icon to CandleSmoke Games logo
- [ ] Set server banner (if Nitro boosted) to a game screenshot
- [ ] Enable Community features (required for Announcements channels)
- [ ] Set #welcome as the default channel for new joins
- [ ] Set verification level to "Low" (must have verified email)
- [ ] Enable slowmode on #memes-and-screenshots (30s)
- [ ] Make #patch-notes and #roadmap read-only for non-devs
- [ ] Set up Carl-bot welcome DM with server guide link
- [ ] Create invite link (never expires, no max uses): share this publicly

---

## Launch Announcement (post in #general and #patch-notes)

```
🕯️ **CandleSmoke Games presents...**

# Click, For Science! 🔬

An idle clicker about a guy in his garage who slowly descends into mad science.

🧪 **10 generators** from notebooks to quantum computers
🧠 **6 madness archetypes** that change your gameplay
🔄 **Prestige + Ascension** — two layers of meta-progression
🏘️ **Neighborhood NPCs** — befriend Doug, impress Agent Reeves
🏆 **Leaderboards** — compete globally
🎵 **Original soundtrack** — 7 tracks of lab ambiance

**Play now:** [your-url-here]

The game is 100% free, runs in your browser, and saves locally.
No accounts required (optional for leaderboards).

We'd love your feedback — drop by #suggestions or #bug-reports!
```

---

## Social Media Cross-Links

Add these to the server's "Links" section:
- 🌐 Website: [Vercel URL]
- 🐦 Twitter/X: [@CandleSmokeGame]
- 💻 GitHub: [github.com/JWalts789/ClickForScience]
- 🎮 itch.io: [if created]
