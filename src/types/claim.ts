export interface Claim {
  id: number;
  code: string;
  status: string;
  statusConsider: string;
  createdOn: string;
  insureId: number;
}

export interface ClaimStatus {
  id: number;
  label: string;
  createdOn: string;
}
