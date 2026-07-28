import type { RawUser } from "@/api/types/raw";
import type { AuthUser } from "@/mock/types";

export function mapUser(raw: RawUser): AuthUser {
  return {
    id: String(raw.id),
    firstName: raw.first_name,
    lastName: raw.last_name,
    fullName: raw.full_name,
    email: raw.email,
    role: raw.role,
    status: raw.status,
    permissions: raw.permissions ?? [],
    lastActivity: raw.last_activity,
  };
}
