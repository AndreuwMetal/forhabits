// Knowledge base for the habit-coaching engine.
// Content based on "Atomic Habits" by James Clear, organized around
// the Four Laws of Behavior Change.
//
// Usage: replace the {habit} placeholder in each "template" with the habit
// the user wants to build (e.g. "run", "read 10 pages", "meditate").

import type { Strategy, Law } from './knowledge';

export const LAWS: Law[] = [
  {
    id: "obvious",
    number: 1,
    titleEs: "Make it obvious",
    summary:
      "Every habit starts with a cue, and we tend to stop noticing the cues that are already part of our routine. The First Law is about becoming aware of your current habits and designing clear, visible cues that trigger the new habit at the right time and place.",
    strategies: [
      {
        id: "registro-habitos",
        title: "Habit scorecard",
        concept:
          "Before you can change a habit you need to become aware of it, because once a habit becomes automatic we stop paying attention to it. The Habit Scorecard is an exercise for observing your current behavior without judgment, marking each action as good (+), bad (-), or neutral (=).",
        template:
          "Note every time you do (or skip) {habit} on your Habit Scorecard with a (+), (-), or (=) sign. Do it without criticizing yourself, just to notice when and in what context it happens.",
        example:
          "This week, next to {habit} write a (+) if it moves you toward the person you want to be, a (-) if it moves you away, or an (=) if it's neutral, without judging yourself. Review the scorecard on Sunday to spot patterns before changing anything.",
      },
      {
        id: "intencion-implementacion",
        title: "Implementation intention",
        concept:
          "A plan that specifies in advance when and where you'll act doubles or triples the odds of following through, according to studies cited in the book. Vague motivation turns into a concrete action plan once you fix the time and place.",
        template: "Decide now when and where: do {habit} at [TIME] in [PLACE].",
        example:
          "Write in your planner: 'I will {habit} on Monday at 7:00 a.m. in the living room,' just like the exercise study in Britain. Repeat the sentence every Sunday to lock in the following week.",
      },
      {
        id: "apilamiento-habitos",
        title: "Habit stacking",
        concept:
          "Instead of tying the new habit to a specific time, you link it to a habit you already do every day without fail. Each action becomes the cue that triggers the next one, riding on behavior chains that already exist.",
        template: "After [CURRENT HABIT], do {habit} right away, without leaving room to second-guess it.",
        example:
          "Identify your most consistent habit (pouring your coffee, closing your laptop) and chain it like this: 'After [that habit], I do {habit}.' Practice it three days in a row until the link starts to feel automatic.",
      },
      {
        id: "diseno-ambiente",
        title: "Environment design",
        concept:
          "Environment is the invisible hand that shapes behavior: we notice and repeat the cues that are obvious and accessible, and ignore the ones that are hidden. Redesigning your space so the cue for the desired habit jumps out at you makes acting on it easier without needing more motivation.",
        template:
          "Place [OBJECT OR CUE related to {habit}] clearly in sight in [PLACE], so it becomes the obvious reminder to do {habit}.",
        example:
          "Put the object that triggers {habit} (the book, the yoga mat, the water bottle) right in the middle of the table or by the front door, like the bowl of apples from the book. Clear away anything that distracts you from that cue.",
      },
      {
        id: "un-lugar-un-uso",
        title: "One space, one use (context is the cue)",
        concept:
          "Over time, a habit becomes associated not just with an isolated cue but with the entire context surrounding it. Reserving a dedicated space for a single activity helps that context become the automatic cue for the habit.",
        template:
          "Reserve [PLACE/CORNER/MOMENT] exclusively for {habit} and don't use it for anything else.",
        example:
          "Pick a chair, a desk, or a time slot and use it only for {habit}, never for anything else. Within a couple of weeks, sitting there (or arriving at that time) will be enough for your body to know it's time for {habit}.",
      },
    ],
  },
  {
    id: "attractive",
    number: 2,
    titleEs: "Make it attractive",
    summary:
      "Habits are a dopamine-driven feedback loop: the more attractive an opportunity is, the more eager we are to act, because it's the anticipation of a reward — not the fulfillment of it — that gets us moving. The Second Law is about increasing your desire to perform the habit.",
    strategies: [
      {
        id: "tentacion-combinada",
        title: "Temptation bundling",
        concept:
          "This relies on the Premack Principle: behaviors you're highly likely to do can reinforce behaviors you're less likely to do. By linking something you want to do with something you need to do, you borrow the appeal of the first for the second.",
        template:
          "Allow yourself [ACTIVITY YOU LOVE] only while doing {habit}, never outside that moment.",
        example:
          "Save your favorite podcast or show to listen to or watch only while doing {habit}, like the student who watched Netflix only while pedaling a stationary bike. Cut off access to that activity at any other time of day.",
      },
      {
        id: "unirse-tribu",
        title: "Join a tribe",
        concept:
          "We imitate the habits of the close circle, the tribe, and the powerful, because belonging is one of the deepest human desires. A habit becomes far more attractive when it's the normal behavior of the group you belong to.",
        template:
          "Join a group, class, or community — for example [GROUP/CLUB/ONLINE COMMUNITY] — where {habit} is the normal, shared behavior among its members.",
        example:
          "Find a club, class, or online group today where {habit} is the normal behavior, the way Nerd Fitness does with exercise. Join this week and attend your first session before the decision cools off.",
      },
      {
        id: "ritual-motivacion",
        title: "Motivation ritual",
        concept:
          "You can rewire your brain to enjoy hard habits by pairing them with something you already find pleasurable right before doing them. With repetition, that small routine becomes the cue that triggers the right mood.",
        template:
          "Right before {habit}, always do [PLEASURABLE ACTION: take a deep breath and smile, play a specific song, have your favorite drink], to associate {habit} with a positive feeling.",
        example:
          "Before {habit}, always repeat the same two or three steps: the same song, a deep breath, a smile, like the writer who gets focused the moment he puts on his headphones. Keep the ritual identical for two weeks so your brain links it with {habit}.",
      },
      {
        id: "replanteamiento-mental",
        title: "Reframing (benefits, not obligations)",
        concept:
          "Every habit has a surface craving and a deeper underlying motive; you can make a habit more attractive by highlighting its benefits instead of its costs, swapping 'I have to' for 'I get to.'",
        template:
          "Swap 'I have to {habit}' for 'I get to {habit}' every time you think or say it, remembering the real benefit it gives you.",
        example:
          "Next time you think 'I have to {habit},' say it out loud instead as 'I get to {habit},' just like 'I need to run' became 'It's time to build endurance.' Repeat the reframe every time you feel resistance.",
      },
    ],
  },
  {
    id: "easy",
    number: 3,
    titleEs: "Make it easy",
    summary:
      "Human behavior follows the Law of Least Effort: between two options, we choose the one that requires less work. The Third Law is about reducing the friction of good habits until they're so easy it's hard not to do them, prioritizing repetition over perfection.",
    strategies: [
      {
        id: "regla-dos-minutos",
        title: "The two-minute rule",
        concept:
          "Any habit can be scaled down to a two-minute-or-less version. The goal isn't to complete the whole task, but to master the habit of 'showing up' and crossing the threshold of starting; the rest can follow later.",
        template:
          "Scale {habit} down to a 2-minute version — for example [VERY SMALL STARTING ACTION] — and do it with no excuses.",
        example:
          "If {habit} is running 3 km, start by just putting on your running shoes; if it's reading, read a single page. Commit only to those two minutes and let continuing be optional.",
      },
      {
        id: "reducir-friccion",
        title: "Reduce friction and prime the environment",
        concept:
          "Optimizing your environment so the good habit requires as few steps as possible dramatically increases the odds of doing it. Preparing the space or materials ahead of time removes obstacles before they appear.",
        template:
          "Get [MATERIAL/CLOTHING/TOOL] ready in [PLACE] ahead of [EARLIER MOMENT], so there's nothing standing between you and {habit}.",
        example:
          "The night before, lay out the clothes, materials, or tools for {habit} exactly where you'll see them when you wake up. Eliminate any extra step that might make you put it off today.",
      },
      {
        id: "momento-decisivo",
        title: "Master the decisive moment",
        concept:
          "Every day there are a handful of moments — forks in the road — that determine the rest of your hours. Identifying and controlling that first small step (the 'taxi,' not the 'gym') sets the rest of your behavior on autopilot.",
        template:
          "Identify the decisive moment that comes right before {habit} — for example [TRIGGERING ACTION: putting on your workout clothes, taking out your notebook, closing your laptop] — and always take that first step.",
        example:
          "Define what 'the taxi' is for {habit} — putting on your workout clothes, taking out your notebook, opening the app — and take that first step the moment you get up, like Twyla Tharp hailing her taxi. Once you take that step, let the rest flow on its own.",
      },
      {
        id: "automatizar-habito",
        title: "Automate the habit",
        concept:
          "Some one-time decisions — buying certain equipment, turning on an app, setting a reminder — deliver benefits again and again without requiring daily willpower. Technology can make a good habit nearly inevitable.",
        template:
          "Automate {habit} with a one-time decision: [ACTION, e.g. set an alarm or reminder, subscribe to/buy something, set up an automatic payment or delivery].",
        example:
          "Set up an alarm, a subscription, or an automatic payment today that makes {habit} happen without you having to decide, like an automatic savings plan. Check the setup once and stop deciding every day.",
      },
      {
        id: "practica-sobre-perfeccion",
        title: "Repetition over perfection",
        concept:
          "Getting started and taking action matters more than planning the perfect system. A habit needs to be standardized (repeated simply and consistently) before it can be optimized; how often you practice matters more than how good you are at first.",
        template:
          "Do {habit} in the simplest way possible today; your only goal is to repeat it many times, without trying to make it perfect yet.",
        example:
          "Do {habit} today in the simplest way possible, even if it comes out imperfect, like the photography students who took lots of mediocre photos and improved faster. Repeat tomorrow without stopping to judge the quality.",
      },
    ],
  },
  {
    id: "satisfying",
    number: 4,
    titleEs: "Make it satisfying",
    summary:
      "The cardinal rule of behavior change is: what is immediately rewarded gets repeated, what is punished gets avoided. Since the brain prioritizes instant gratification, the Fourth Law is about adding a sense of success right after finishing the habit, so you want to repeat it.",
    strategies: [
      {
        id: "refuerzo-inmediato",
        title: "Immediate reinforcement",
        concept:
          "A habit needs to feel successful right away, even in a small way, for the brain to register that it's worth repeating. A small reward aligned with your desired identity helps sustain the habit while the long-term benefits are still on their way.",
        template:
          "Right after completing {habit}, give yourself a small, immediate reward consistent with who you want to be, like [REWARD: a relaxing bath, writing down the win, a special tea].",
        example:
          "As soon as you finish {habit}, treat yourself to something small and immediate — a special tea, writing down the win, a relaxing bath — like the scented soap that made handwashing feel good. Choose a reward that reinforces, not sabotages, your goal.",
      },
      {
        id: "seguimiento-habitos",
        title: "Habit tracker",
        concept:
          "Keeping a visual record of your progress — an X on the calendar, a count that builds up — makes the habit obvious, attractive, and satisfying all at once, because watching the chain grow motivates you not to break it.",
        template:
          "Keep a visual record of {habit}: mark an X on a calendar (or move a token/paperclip from one container to another) every time you complete it, and keep the chain unbroken.",
        example:
          "Get a calendar or an app and mark an X every time you complete {habit}, like Seinfeld's 'don't break the chain.' Hang the calendar where you'll see it every day so the visible chain keeps you going.",
      },
      {
        id: "nunca-fallar-dos-veces",
        title: "Never miss twice",
        concept:
          "Perfection isn't the goal; what sets successful people apart is that after a slip, they bounce back fast. Missing once is an accident; missing twice in a row is the start of a new bad habit.",
        template:
          "If you ever miss {habit} on a given day, get back to it at the next opportunity: don't let it slip two times in a row.",
        example:
          "If you miss {habit} one day, make sure to get back to it the very next day, remembering the book's rule: 'missing once is an accident, missing twice is the start of a new habit.' Don't let guilt make you skip a third day.",
      },
      {
        id: "socio-corresponsable",
        title: "Accountability partner",
        concept:
          "Knowing that someone is watching your behavior adds an immediate social cost to failing, because we care deeply about what others think of us. An accountability partner turns progress (or the lack of it) into something visible to another person.",
        template:
          "Ask [PERSON] to be your accountability partner for {habit}: tell them your plan and agree that they'll check in with you every [FREQUENCY].",
        example:
          "Ask a friend or family member to be your accountability partner for {habit} and agree that they'll text you every week to ask how it's going, like Margaret Cho with her daily joke. Share your real progress, even when you slip.",
      },
      {
        id: "contrato-habitos",
        title: "Habit contract",
        concept:
          "A habit contract is a written or verbal agreement where you define the habit you're committing to and the consequence if you don't follow through, signed together with one or two witnesses. It adds a social — and sometimes financial — cost that makes breaking it immediately painful.",
        template:
          "Write a habit contract for {habit}: define the commitment, a clear consequence if you don't follow through (e.g. [CONSEQUENCE]), and sign it together with [WITNESS/PARTNER].",
        example:
          "Write a short contract committing to {habit}, define a consequence if you don't follow through, and sign it with a witness, like Bryan Harris did with his wife and his trainer. Keep the contract somewhere visible to remind you.",
      },
    ],
  },
];

// Inverse version of the Four Laws: strategies to ELIMINATE bad habits.
// Make it invisible, unattractive, difficult, and unsatisfying.
export const INVERSE_LAWS: Law[] = [
  {
    id: "obvious",
    number: 1,
    titleEs: "Make it invisible",
    summary:
      "Once a habit is encoded in the brain, it's nearly impossible to forget it entirely, so the best long-term defense isn't resisting temptation but reducing your exposure to the cues that trigger it.",
    strategies: [
      {
        id: "reducir-exposicion",
        title: "Reduce exposure to the cue",
        concept:
          "Self-control is a short-term strategy: it's easier to avoid a temptation than to resist it over and over. Removing or hiding the cue that triggers the bad habit is often enough to make the whole habit fade away.",
        template:
          "Remove or hide the cues that lead you to {habit}: for example, [ACTION: put the object out of sight, uninstall the app, stop buying it].",
        example:
          "Put out of sight, uninstall, or stop buying whatever triggers {habit}, like leaving your phone in another room to avoid checking it nonstop. If you don't see the cue, it's much harder to act on {habit}.",
      },
      {
        id: "cambiar-contexto",
        title: "Change your environment or context",
        concept:
          "Habits become associated with the entire context surrounding them, not just a single isolated cue. Getting away from the environment where you usually fall into the habit — or redesigning it — frees you from constantly fighting the same cues.",
        template:
          "Avoid the places, times, or situations where you usually fall into {habit}, or change that environment (a different route, a different room, a different routine) to escape its usual cues.",
        example:
          "Change your route, your room, or your routine to get away from the environment where you usually fall into {habit}, like the soldiers in Vietnam who dropped heroin use after a complete change of environment. Replace that context with a new one that lacks the usual cues.",
      },
    ],
  },
  {
    id: "attractive",
    number: 2,
    titleEs: "Make it unattractive",
    summary:
      "Every bad habit has a deep underlying motive that seems to solve a problem in the moment. If you can reframe the way you perceive that habit and highlight its true costs, it will stop feeling attractive to you.",
    strategies: [
      {
        id: "replantear-costos",
        title: "Reframe your mindset",
        concept:
          "The cause of a habit is the prediction and the feeling that precedes it, not the habit itself. By spelling out the real costs and the benefits of NOT doing it, you can dismantle the story that makes the bad habit seem desirable.",
        template:
          "Write down clearly the real costs of {habit} and everything you gain by avoiding it (health, time, money, peace of mind), so it stops looking like an attractive option.",
        example:
          "List out the real costs of {habit} (health, time, money) and everything you'd gain by dropping it, the way Allen Carr's method does for quitting smoking. Reread the list whenever you feel the pull of {habit}.",
      },
      {
        id: "cambiar-entorno-social",
        title: "Distance yourself from the group that normalizes it",
        concept:
          "We tend to imitate the habits of the group we belong to because it helps us fit in. If {habit} is the social norm in your close circle, spending more time with people for whom that behavior isn't normal reduces its appeal.",
        template:
          "Spend more time with people for whom {habit} isn't the norm, or distance yourself (within reason) from the groups or settings where this behavior is celebrated or expected.",
        example:
          "Spend more time with people for whom {habit} isn't the norm and cut back on time with those who celebrate it, remembering that 'you always start out with your friends.' Over time, the new company will make {habit} stop feeling necessary to fit in.",
      },
    ],
  },
  {
    id: "easy",
    number: 3,
    titleEs: "Make it difficult",
    summary:
      "Just as you can reduce friction for good habits, you can deliberately increase friction for bad habits to the point of making them impractical, using commitment devices that bind your future behavior.",
    strategies: [
      {
        id: "aumentar-friccion",
        title: "Increase friction",
        concept:
          "The more steps and effort stand between you and the bad habit, the less likely you are to repeat it. Adding deliberate obstacles — however small they seem — noticeably reduces how often the habit happens.",
        template:
          "Add steps or obstacles between you and {habit}: for example, [ACTION: unplug the device and put it away, remove the app from your phone, keep it out of easy reach].",
        example:
          "Put a real obstacle between you and {habit}: unplug the device, put the object far away, or delete the app, like taking the batteries out of the remote control. Every extra step you add lowers the odds of falling into {habit}.",
      },
      {
        id: "mecanismo-compromiso",
        title: "Commitment device",
        concept:
          "A commitment device is a decision you make today to restrict your future options and avoid the bad habit, using your present willpower before temptation arrives.",
        template:
          "Create a commitment device that stops you from doing {habit} in the future, like [ACTION: block the site or app, ask someone to hold onto access, sign up for a self-exclusion list].",
        example:
          "Design a restriction today that keeps you from doing {habit} tomorrow, like blocking the site or asking someone to hold onto access, in the style of Victor Hugo having his clothes locked away so he couldn't leave the house. Use today's willpower to protect tomorrow's decision.",
      },
    ],
  },
  {
    id: "satisfying",
    number: 4,
    titleEs: "Make it unsatisfying",
    summary:
      "What is immediately punished gets avoided. Adding an immediate, visible, painful cost — instead of a distant, uncertain one — to a bad habit dramatically speeds up abandoning that behavior.",
    strategies: [
      {
        id: "supervision-social",
        title: "Have someone watch",
        concept:
          "Knowing that another person is aware of your behavior adds an immediate social cost to slipping up, because we care deeply about what others think of us.",
        template:
          "Ask [PERSON] to know that you're trying to quit {habit} and to check in with you regularly on how it's going, so you feel the social cost of slipping up right away.",
        example:
          "Tell someone you trust that you're quitting {habit} and ask them to check your progress every week. Knowing they'll ask adds an immediate social cost to falling back into {habit}.",
      },
      {
        id: "contrato-castigo",
        title: "Habit contract with a penalty",
        concept:
          "A contract that spells out an immediate, painful consequence for relapsing into the bad habit, signed in front of witnesses, makes breaking it costly and public instead of abstract and distant.",
        template:
          "Sign a contract committing to avoid {habit}, with an immediate, clear consequence if you fail (e.g. [PENALTY: pay a sum of money to a friend, wear something you dislike, an uncomfortable chore]), witnessed by [WITNESS].",
        example:
          "Sign a contract with a witness committing to avoid {habit}, with an immediate, annoying penalty if you fail, like paying money to a friend, in the style of Bryan Harris's contract. Choose a penalty uncomfortable enough to actually stop you.",
      },
    ],
  },
];
