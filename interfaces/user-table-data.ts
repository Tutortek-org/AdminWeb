import { UserFlags } from "./user-flags";

export interface UserTableData {
  id: number;
  email: string;
  userFlags: boolean[];
}
