export interface IUser {
  username: string;
  email: string;
  password: string;
  role?: string;
  isSubscribed?: boolean;
  walletBalance?: number;
}
