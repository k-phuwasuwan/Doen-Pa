import { mockUsers } from "@/mocks/users";
import type { User } from "@/types";

export const userService = {
  getCurrentUser(): User {
    return mockUsers[0];
  },

  getUserById(id: string): User | null {
    return mockUsers.find((user) => user.id === id) ?? null;
  },
};
