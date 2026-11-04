import { getDatabase } from "@netlify/database";

export type Registration = {
  id: number;
  slot: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string;
};

export function getDb() {
  return getDatabase();
}
