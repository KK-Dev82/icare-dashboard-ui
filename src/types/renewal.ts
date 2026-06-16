export interface RenewalRule {
  id: string;
  daysBefore: number;
  titleTemplate: string;
  bodyTemplate: string;
  buttonText: string;
  isEnabled: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRenewalRulePayload {
  daysBefore: number;
  titleTemplate: string;
  bodyTemplate: string;
  buttonText?: string;
}

export interface UpdateRenewalRulePayload {
  daysBefore?: number;
  titleTemplate?: string;
  bodyTemplate?: string;
  buttonText?: string;
  isEnabled?: boolean;
  sortOrder?: number;
}
