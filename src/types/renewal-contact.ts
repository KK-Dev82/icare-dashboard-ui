export interface RenewalContact {
  id: string;
  phone: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SaveRenewalContactPayload {
  phone: string;
  email: string;
}
