export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  name: string | null;
  is_verified: boolean;
  plan: string;
  tokens_used_today: number;
  tokens_limit: number;
  images_used_today: number;
  images_limit: number;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
}
