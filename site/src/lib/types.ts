// HELPINhex content types — the data contract (see /content/README.md)
// Keep types loose and honest; prices never live here (Phase 2 price feed handles that).

export interface Tool {
  id: string;
  slug: string;
  name: string;
  category: string;
  tagline: string;
  freeTier: boolean;
  pricing: string;
  whatItIs: string;
  whyMatters: string;
  howToUse: string[];
  whenNotToUse: string;
  alternatives: string[];
  links: { official: string };
  status: 'alive' | 'dead' | 'possibly-dead';
  lastVerified: string;
}

export interface Model {
  id: string;
  slug: string;
  name: string;
  family: string;
  by: string;
  modalities: string[];
  context: string;
  access: string[];
  freeTier: boolean;
  pricingNote: string;
  strengths: string[];
  weaknesses: string[];
  bestFor: string;
  lastVerified: string;
}

export interface Term {
  id: string;
  word: string;
  plain: string;
  example: string;
  related: string[];
}

export interface Guide {
  id: string;
  slug: string;
  title: string;
  minutes: number;
  summary: string;
  body: string[];
  relatedTerms: string[];
}

export interface PathStep {
  title: string;
  description: string;
  guide?: string;
  tool?: string;
  minutes: number;
}

export interface Path {
  id: string;
  slug: string;
  title: string;
  goal: string;
  duration: string;
  prereqs: string[];
  steps: PathStep[];
}

export interface WorkflowStep {
  title: string;
  tool: string;
  how: string;
  cost: string;
  time: string;
  guide?: string;
  toolId?: string;
}

export interface Workflow {
  id: string;
  title: string;
  level: string;
  totalCost: string;
  totalTime: string;
  questionPatterns: string[];
  steps: WorkflowStep[];
  mistakes: string[];
}

export interface NewsItem {
  date: string;
  source: string;
  whatHappened: string;
  whyItMatters: string;
  impact: 'game-changer' | 'useful' | 'meh';
  links: string[];
  auto: boolean;
  lastVerified: string;
}
