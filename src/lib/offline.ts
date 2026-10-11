const CANNED: { keys: string[]; answer: string }[] = [
  {
    keys: ["jollof"],
    answer: `## 🍛 Ghana Jollof (offline recipe)

**Ingredients:** 3 cups rice (perfumed/long grain), 5 tomatoes, 2 onions, 1 tin tomato paste, scotch bonnet, garlic, ginger, chicken/beef stock, oil, curry, thyme, bay leaf, salt.

1. Blend tomatoes, 1 onion, pepper, garlic & ginger.
2. Fry sliced onion in oil, add tomato paste — fry 5 mins.
3. Add the blend, cook down until oil floats (15–20 mins).
4. Add spices + stock, then washed rice. Stir once.
5. Cover with foil + lid, steam on low heat ~30 mins.

Serve with chicken, shito and salad. 🇬🇭`,
  },
  {
    keys: ["nurs", "nclex", "rgn", "midwif"],
    answer: `## 🩺 Nursing quick guide (offline)

- **ABCs first:** Airway, Breathing, Circulation — top NCLEX priority rule.
- **Maslow:** physiological needs before safety, love, esteem.
- **Nursing process (ADPIE):** Assess, Diagnose, Plan, Implement, Evaluate.
- **Normal vitals:** HR 60–100, RR 12–20, BP ~120/80, Temp 36.5–37.5°C, SpO₂ ≥95%.
- **Ghana:** RGN licensing is by the **Nursing and Midwifery Council (NMC)**.

**Twi:** *Nɛɛse* = nurse · *Ayaresa* = healing/treatment.

Reconnect for full, detailed answers.`,
  },
  {
    keys: ["math", "algebra"],
    answer: `## ➗ Math basics (offline)

- **BODMAS:** Brackets, Orders, Division, Multiplication, Addition, Subtraction.
- **Linear equation:** 2x + 3 = 11 → 2x = 8 → **x = 4**
- **Area:** rectangle = l × w, circle = πr²
- **Pythagoras:** a² + b² = c²

Reconnect and I'll teach you step by step!`,
  },
  {
    keys: ["cv", "resume"],
    answer: `## 📄 CV template (offline)

**FULL NAME** · Phone · Email · City, Ghana

**Profile** — 2–3 lines on who you are and your goal.

**Education** — School, certificate (e.g. WASSCE, BSc), years.

**Experience** — Role, organisation, dates, 3 achievement bullets.

**Skills** — e.g. Patient care, MS Office, Communication.

**References** — Available on request.`,
  },
  {
    keys: ["ghana", "accra", "kumasi", "bece", "wassce"],
    answer: `## 🇬🇭 Ghana facts (offline)

- **Capital:** Accra · **Garden City:** Kumasi
- **16 regions**, independence **6 March 1957**, first president **Kwame Nkrumah**
- **BECE** ends JHS; **WASSCE** ends SHS (run by WAEC)
- **Currency:** Ghana cedi (GH₵)

For today's news, please reconnect to the internet.`,
  },
  {
    keys: ["joke"],
    answer: `😂 Why did the Ghanaian take a ladder to the chop bar? Because he heard the **jollof was on another level!**`,
  },
  {
    keys: ["twi", "translate", "hello", "thank"],
    answer: `## 🗣️ Quick Twi phrases (offline)

| English | Twi |
|---|---|
| Hello / Welcome | Akwaaba |
| Good morning | Maakye |
| Thank you | Medaase |
| How are you? | Wo ho te sɛn? |
| I'm fine | Me ho yɛ |
| Please | Mepa wo kyɛw |`,
  },
];

export function offlineAnswer(q: string) {
  const s = q.toLowerCase();
  const hit = CANNED.find((c) => c.keys.some((k) => s.includes(k)));
  return (
    hit?.answer ??
    `📴 **You're offline.** I can still help with jollof, nursing basics, math, CVs, Ghana facts, Twi phrases and jokes. Reconnect for full AI answers on anything!`
  );
}
