export interface User {
  email: string;
}

export interface AuthResponse {
  status: number;
  message: string;
  data?: {
    token: string;
    email: string;
  };
  result?: {
    token: string;
    username: string;
  };
}
