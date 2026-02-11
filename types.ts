
export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  ROYAL = 'royal_blue',
  SOFT = 'soft_green'
}

export interface User {
  id: string;
  displayName: string;
  role: 'User' | 'Admin' | 'Application Specialist';
  organization: string;
}

export interface Slide {
  title: string;
  content: string[];
  imagePrompt?: string;
  imageUrl?: string;
  videoUrl?: string;
}

export interface Presentation {
  id: string;
  title: string;
  theme: Theme;
  slides: Slide[];
  createdAt: number; // Neu: Erstellungszeitpunkt
}

export interface GenerationConfig {
  prompt: string;
  slideCount: number;
  language: string;
  theme: Theme;
  templateId?: string;
  gatewayId?: string;
}

export interface LLMGateway {
  id: string;
  provider: 'Google' | 'Azure' | 'OpenAI' | 'Anthropic' | 'Mistral' | 'Meta' | 'On-Prem Proxy' | 'Custom';
  model: string;
  endpoint: string;
  active: boolean;
}

export interface AdminTemplate {
  id: string;
  name: string;
  description: string;
  baseTheme: Theme;
  systemPrompt: string;
}

export interface PermissionEntry {
  id: string;
  identity: string;
  type: 'User' | 'Group';
  role: 'Admin' | 'Editor' | 'Viewer';
}

export interface AdminSettings {
  gateways: LLMGateway[];
  templates: AdminTemplate[];
  permissions: PermissionEntry[];
}
