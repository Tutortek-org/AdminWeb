import { User } from "../user/user";

export interface UserReport {
  id: number;
  description: string;
  reported: User;
  reporter: User;
}
