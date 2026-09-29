# Design research summary

This app implements a redesign my team produced in DESN 240 (App Design) at MacEwan University. This is a summary of that process. The full process document, with interviews, personas, wireframes and mockups, was submitted for the course.

## 1. Analysing the existing app

We picked an existing municipal waste app because it was useful but frustrating.

**Worked well:** weekly reminders, a broad item search ("what goes where"), and being more convenient than a paper schedule on the fridge.

**Problems:** a sideways-scrolling calendar, an unrelated mini-game aimed at children, unreliable notifications, pop-ups, weak typographic hierarchy, and a language setting hidden deep in the menus.

**Competitors did better at:** normal vertical scrolling, a clear block calendar, and labelling Settings as "Settings" instead of "More".

## 2. Research

Each team member interviewed two people (8 interviews in total, mostly Edmonton-area residents) with the same six questions:

1. What do you expect from the app before opening it?
2. First impressions?
3. How easy is it to navigate (1–10)?
4. What stands out?
5. How convenient is the calendar?
6. Why would or wouldn't you use it?

**Themes**

- Nearly every participant called the game unnecessary or confusing.
- The calendar format was the main usability complaint. People wanted a "standard blocked calendar with days you can tap".
- People liked seeing the next pickup first, without searching.
- The item search was the most valued feature.
- Some people disliked being asked for an address and notification permission right away.
- Reminders were the main reason people would keep the app installed.

## 3. Persona

**"Lucy"**, 21, a recent graduate renting on her own for the first time. She's busy and organized and wants a trustworthy, well-structured schedule so she doesn't miss pickup day. Her pain points: the game, the calendar layout, and being hesitant to share her address.

## 4. Task we redesigned

*Check the garbage collection schedule.*

Original flow: open app → enter address → calendar tab → find date → pick collection type → read instructions.

Change: **choose the collection type before the date.** The calendar shows every pickup, and filter buttons along the top narrow it to one type.

## 5. Final flow

```
Open app → first time? → onboarding (language → sign up / guest → optional contact → permissions → address)
         → Home (calendar) → filter by collection → tap a day for details → (optional) More Info → done
```

## 6. Visual design

Palette from our style tile:

| Token | Hex |
| --- | --- |
| Primary green | `#01A548` |
| Secondary green | `#01B166` |
| Light green | `#80D291` |
| Sage | `#BDCFBD` |
| Teal accent (arrows) | `#03AEA3` |

Typography used SF Pro Display for headers and body. The web build uses Inter as the cross-platform equivalent. Layout: full-green onboarding screens, a month grid with arrow navigation, a green detail card with a bin icon, and a bottom navigation bar (Activity / Home / Settings; this build adds "Sort" for item search).

## Differences from the Figma mockups

- **Added a "Sort" tab** for item search, since interviewees called it the most useful feature.
- **Google/Apple sign-in are not implemented.** Email/password and guest mode cover the flow.
- **The city logo and branding are replaced** with a neutral leaf icon, because this is an unofficial project.
