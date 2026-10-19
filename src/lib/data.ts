export type Interest = "tech" | "people" | "creative" | "analytical" | "handson" | "business" | "health" | "nature";
export type Skill = "math" | "communication" | "creativity" | "practical" | "leadership" | "focus";
export type Value = "income" | "stability" | "impact" | "freedom" | "prestige";
export type CountryCode = "NO" | "SE" | "DE" | "NL" | "UK" | "US";

export const INTERESTS: { id: Interest; label: string }[] = [
  { id: "tech", label: "Technology & code" },
  { id: "people", label: "Helping people" },
  { id: "creative", label: "Design & creating" },
  { id: "analytical", label: "Solving hard problems" },
  { id: "handson", label: "Building with my hands" },
  { id: "business", label: "Business & money" },
  { id: "health", label: "Health & the body" },
  { id: "nature", label: "Nature & environment" },
];

export const SKILLS: { id: Skill; label: string }[] = [
  { id: "math", label: "Numbers & logic" },
  { id: "communication", label: "Talking & writing" },
  { id: "creativity", label: "Ideas & originality" },
  { id: "practical", label: "Practical work" },
  { id: "leadership", label: "Leading others" },
  { id: "focus", label: "Deep focus" },
];

export const VALUES: { id: Value; label: string }[] = [
  { id: "income", label: "High income" },
  { id: "stability", label: "Job security" },
  { id: "impact", label: "Making a difference" },
  { id: "freedom", label: "Freedom & flexibility" },
  { id: "prestige", label: "Recognition" },
];

export const COUNTRIES: { code: CountryCode; name: string; incomeMult: number; costMult: number; flag: string }[] = [
  { code: "NO", name: "Norway", incomeMult: 1.15, costMult: 0.2, flag: "🇳🇴" },
  { code: "SE", name: "Sweden", incomeMult: 0.92, costMult: 0.2, flag: "🇸🇪" },
  { code: "DE", name: "Germany", incomeMult: 1.0, costMult: 0.25, flag: "🇩🇪" },
  { code: "NL", name: "Netherlands", incomeMult: 1.05, costMult: 0.6, flag: "🇳🇱" },
  { code: "UK", name: "United Kingdom", incomeMult: 0.98, costMult: 1.6, flag: "🇬🇧" },
  { code: "US", name: "United States", incomeMult: 1.45, costMult: 2.6, flag: "🇺🇸" },
];

export type Path = {
  id: string;
  title: string;
  tagline: string;
  interests: Interest[];
  skills: Partial<Record<Skill, number>>; // importance 1-3
  values: Partial<Record<Value, number>>; // how well it delivers 0-1
  eduYears: number;
  eduCostBase: number; // EUR, scaled by country costMult (1 = mid)
  remote: number; // 0-1
  income: [number, number, number]; // EUR base yr1/5/10
  demand: Partial<Record<CountryCode, number>>; // 0-1 labour demand
  steps: string[];
};

export const PATHS: Path[] = [
  { id: "software-engineer", title: "Software Engineer", tagline: "Build the products millions use every day.", interests: ["tech", "analytical"], skills: { math: 3, focus: 3, creativity: 1 }, values: { income: 0.9, stability: 0.8, freedom: 0.9, impact: 0.5, prestige: 0.6 }, eduYears: 3, eduCostBase: 15000, remote: 0.95, income: [48000, 78000, 105000], demand: { NO: 0.8, SE: 0.75, DE: 0.85, NL: 0.85, UK: 0.7, US: 0.8 }, steps: ["Learn one language deeply (Python or TypeScript)", "Ship 3 small projects publicly", "Apply for a bachelor in CS or a recognised bootcamp", "Land an internship by year two"] },
  { id: "data-scientist", title: "Data Scientist", tagline: "Turn messy data into decisions.", interests: ["analytical", "tech", "business"], skills: { math: 3, focus: 3, communication: 2 }, values: { income: 0.85, stability: 0.75, freedom: 0.7, impact: 0.6, prestige: 0.7 }, eduYears: 5, eduCostBase: 22000, remote: 0.8, income: [52000, 80000, 110000], demand: { NO: 0.7, SE: 0.7, DE: 0.75, NL: 0.8, UK: 0.75, US: 0.85 }, steps: ["Strengthen statistics and linear algebra", "Complete a Kaggle competition", "Pursue a master's in data science or statistics", "Build a portfolio of real analyses"] },
  { id: "nurse", title: "Registered Nurse", tagline: "Care that is needed everywhere, always.", interests: ["health", "people"], skills: { communication: 3, practical: 2, focus: 2 }, values: { stability: 1, impact: 1, income: 0.5, freedom: 0.3, prestige: 0.5 }, eduYears: 3, eduCostBase: 9000, remote: 0.05, income: [42000, 52000, 60000], demand: { NO: 1, SE: 0.95, DE: 0.95, NL: 0.9, UK: 0.95, US: 0.9 }, steps: ["Volunteer or work part-time in care", "Apply to a nursing bachelor", "Choose a specialisation by year three", "Consider specialist training for higher pay"] },
  { id: "electrician", title: "Electrician", tagline: "A skilled trade with real independence.", interests: ["handson", "tech"], skills: { practical: 3, math: 2, focus: 2 }, values: { stability: 0.9, income: 0.65, freedom: 0.7, impact: 0.5, prestige: 0.3 }, eduYears: 2, eduCostBase: 2000, remote: 0, income: [38000, 55000, 68000], demand: { NO: 0.95, SE: 0.85, DE: 0.95, NL: 0.9, UK: 0.85, US: 0.85 }, steps: ["Enrol in a vocational electrical program", "Secure an apprenticeship", "Earn your certification", "Specialise in solar or smart-home systems"] },
  { id: "ux-designer", title: "Product Designer", tagline: "Shape how technology feels to people.", interests: ["creative", "tech", "people"], skills: { creativity: 3, communication: 2, focus: 2 }, values: { freedom: 0.85, income: 0.7, impact: 0.6, prestige: 0.6, stability: 0.55 }, eduYears: 3, eduCostBase: 14000, remote: 0.85, income: [40000, 62000, 82000], demand: { NO: 0.6, SE: 0.65, DE: 0.65, NL: 0.7, UK: 0.65, US: 0.7 }, steps: ["Learn Figma and design fundamentals", "Redesign 3 apps you use as case studies", "Study interaction design or a design bachelor", "Join a product team as junior designer"] },
  { id: "physician", title: "Physician", tagline: "The long road with the deepest impact.", interests: ["health", "people", "analytical"], skills: { focus: 3, math: 2, communication: 3 }, values: { prestige: 1, income: 0.95, impact: 1, stability: 1, freedom: 0.3 }, eduYears: 6, eduCostBase: 30000, remote: 0.05, income: [60000, 95000, 140000], demand: { NO: 0.95, SE: 0.95, DE: 0.9, NL: 0.85, UK: 0.9, US: 0.95 }, steps: ["Excel in biology and chemistry", "Prepare for medical school admission", "Complete medical degree (6 years)", "Choose a specialty during residency"] },
  { id: "entrepreneur", title: "Founder", tagline: "Build something of your own.", interests: ["business", "creative", "people"], skills: { leadership: 3, communication: 3, creativity: 2 }, values: { freedom: 1, income: 0.8, prestige: 0.8, impact: 0.7, stability: 0.1 }, eduYears: 1, eduCostBase: 3000, remote: 0.6, income: [20000, 60000, 120000], demand: { NO: 0.6, SE: 0.7, DE: 0.65, NL: 0.75, UK: 0.75, US: 0.9 }, steps: ["Solve a small problem for 10 real customers", "Learn sales and basic finance", "Join an accelerator or startup community", "Raise or bootstrap once you have traction"] },
  { id: "environmental-engineer", title: "Renewable Energy Engineer", tagline: "Engineer the energy transition.", interests: ["nature", "analytical", "tech"], skills: { math: 3, practical: 2, focus: 2 }, values: { impact: 1, stability: 0.8, income: 0.75, prestige: 0.65, freedom: 0.5 }, eduYears: 5, eduCostBase: 20000, remote: 0.3, income: [50000, 72000, 95000], demand: { NO: 0.9, SE: 0.85, DE: 0.95, NL: 0.85, UK: 0.75, US: 0.7 }, steps: ["Focus on physics and maths", "Apply to an energy or engineering program", "Intern at a wind, solar or grid company", "Specialise via a master's"] },
  { id: "teacher", title: "Teacher", tagline: "Shape the next generation.", interests: ["people", "creative"], skills: { communication: 3, leadership: 2, creativity: 2 }, values: { impact: 0.95, stability: 0.95, freedom: 0.4, income: 0.4, prestige: 0.45 }, eduYears: 5, eduCostBase: 10000, remote: 0.1, income: [40000, 50000, 58000], demand: { NO: 0.85, SE: 0.9, DE: 0.9, NL: 0.9, UK: 0.85, US: 0.75 }, steps: ["Tutor or coach younger students", "Choose two subjects you love", "Complete a teacher education program", "Explore leadership roles after 5 years"] },
  { id: "marketing", title: "Growth Marketer", tagline: "Make great products find their people.", interests: ["business", "creative", "tech"], skills: { communication: 3, creativity: 2, math: 2 }, values: { freedom: 0.8, income: 0.7, prestige: 0.6, stability: 0.55, impact: 0.4 }, eduYears: 3, eduCostBase: 13000, remote: 0.8, income: [38000, 60000, 85000], demand: { NO: 0.6, SE: 0.65, DE: 0.7, NL: 0.75, UK: 0.75, US: 0.8 }, steps: ["Run a small account or campaign yourself", "Learn analytics and copywriting", "Study marketing or business", "Join a fast-growing company"] },
  { id: "physio", title: "Physiotherapist", tagline: "Help people move and recover.", interests: ["health", "people", "handson"], skills: { practical: 3, communication: 2, focus: 1 }, values: { impact: 0.9, stability: 0.85, freedom: 0.65, income: 0.55, prestige: 0.55 }, eduYears: 3, eduCostBase: 11000, remote: 0.05, income: [40000, 54000, 66000], demand: { NO: 0.85, SE: 0.8, DE: 0.85, NL: 0.8, UK: 0.8, US: 0.85 }, steps: ["Get active in sports or coaching", "Apply to a physiotherapy bachelor", "Complete clinical placements", "Consider opening your own practice"] },
  { id: "finance-analyst", title: "Finance Analyst", tagline: "Where markets meet strategy.", interests: ["business", "analytical"], skills: { math: 3, focus: 2, communication: 2 }, values: { income: 1, prestige: 0.85, stability: 0.7, freedom: 0.4, impact: 0.3 }, eduYears: 5, eduCostBase: 25000, remote: 0.5, income: [50000, 85000, 125000], demand: { NO: 0.6, SE: 0.6, DE: 0.7, NL: 0.7, UK: 0.85, US: 0.85 }, steps: ["Learn accounting and Excel modelling", "Study economics or finance", "Secure a summer internship", "Pursue CFA or a master's"] },
];
