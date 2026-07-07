import type { Paginated } from "@/types/api";
import type { Role, User } from "@/types/auth";

const ROLES: Role[] = ["admin", "manager", "member"];
const FIRST_NAMES = [
  "An",
  "Binh",
  "Chi",
  "Dung",
  "Giang",
  "Ha",
  "Khanh",
  "Linh",
  "Minh",
  "Nam",
  "Phuong",
  "Quan",
  "Son",
  "Thao",
  "Trang",
  "Tuan",
];
const LAST_NAMES = [
  "Nguyen",
  "Tran",
  "Le",
  "Pham",
  "Hoang",
  "Vo",
  "Dang",
  "Bui",
];

// Deterministic demo dataset so the table renders without a backend.
const MOCK_USERS: User[] = Array.from({ length: 47 }, (_, index) => {
  const firstName = FIRST_NAMES[index % FIRST_NAMES.length];
  const lastName = LAST_NAMES[index % LAST_NAMES.length];
  return {
    id: `usr_${String(index + 1).padStart(3, "0")}`,
    name: `${lastName} ${firstName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index + 1}@example.com`,
    role: ROLES[index % ROLES.length],
    active: index % 5 !== 0,
    createdAt: new Date(
      Date.UTC(2025, index % 12, (index % 27) + 1),
    ).toISOString(),
  };
});

export const userService = {
  /**
   * Demo implementation. When the backend is ready, replace the body with:
   *   const { data } = await api.get<Paginated<User>>("/users", { params });
   *   return data;
   */
  async getUsers(): Promise<Paginated<User>> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return {
      items: MOCK_USERS,
      total: MOCK_USERS.length,
      page: 1,
      pageSize: MOCK_USERS.length,
    };
  },
};
