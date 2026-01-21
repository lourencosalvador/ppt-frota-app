export type DemoRole = "client" | "support" | "admin";

export const DEMO_USERS = [
  {
    email: "lourencocardoso007@gmail.com",
    password: "lorrys12345",
    name: "João Motorista",
    role: "client" as const,
  },
  {
    email: "paulosanguli@gmail.com",
    password: "sagunli1234",
    name: "Paulo Motorista",
    role: "client" as const,
  },
] as const;

export const SESSION_STORAGE_KEY = "frota_plus_session";

export type DemoSession = {
  email: string;
  name: string;
  role: DemoRole;
  createdAt: number;
};

export function getDemoUserByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  return DEMO_USERS.find((u) => u.email.toLowerCase() === normalizedEmail);
}

export function validateDemoCredentials(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  return DEMO_USERS.some((u) => {
    return u.email.toLowerCase() === normalizedEmail && u.password === password;
  });
}

