import { prisma } from "../../lib/prisma";
import { hashPassword, verifyPassword } from "../../lib/password";
import { blacklistToken } from "../../lib/tokens";

const VALID_ROLES = ["USER", "ADMIN"];

const safeUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  first_name: true,
  last_name: true,
  phone: true,
  profile_image: true,
  is_active: true,
  is_banned: true,
  createdAt: true,
} as const;

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  email: string;
  password: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
}

class AuthError extends Error {
  code: string;
  status: number;
  constructor(message: string, code: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

const login = async (payload: LoginPayload) => {
  const email = payload.email?.trim().toLowerCase();
  if (!email || !payload.password) {
    throw new AuthError(
      "Email and password are required",
      "MISSING_CREDENTIALS",
      400,
    );
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Run verifyPassword against a dummy hash even when the user doesn't exist,
  // so response timing doesn't reveal whether an email is registered.
  const dummyHash =
    "0000000000000000000000000000000000000000000000000000000000000000:0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
  const isValid = await verifyPassword(
    payload.password,
    user?.password ?? dummyHash,
  );

  if (!user || !isValid) {
    throw new AuthError(
      "Invalid email or password",
      "AUTH_FAILED",
      401,
    );
  }

  if (user.is_banned) {
    throw new AuthError("This account has been banned", "ACCOUNT_BANNED", 403);
  }

  const { password: _password, ...safeUser } = user;
  return safeUser;
};

const register = async (payload: RegisterPayload) => {
  const email = payload.email?.trim().toLowerCase();
  if (!email || !payload.password) {
    throw new AuthError(
      "Email and password are required",
      "MISSING_CREDENTIALS",
      400,
    );
  }

  if (payload.password.length < 8) {
    throw new AuthError(
      "Password must be at least 8 characters",
      "WEAK_PASSWORD",
      400,
    );
  }

  let role = "USER";
  if (payload.role) {
    const upperRole = payload.role.toUpperCase();
    if (!VALID_ROLES.includes(upperRole)) {
      throw new AuthError(
        `Role must be one of: ${VALID_ROLES.join(", ")}`,
        "INVALID_ROLE",
        400,
      );
    }
    role = upperRole;
  }

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) {
    throw new AuthError(
      "An account with this email already exists",
      "EMAIL_TAKEN",
      409,
    );
  }

  const name =
    payload.name ||
    `${payload.first_name || ""} ${payload.last_name || ""}`.trim() ||
    email.split("@")[0];

  const hashedPassword = await hashPassword(payload.password);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      first_name: payload.first_name,
      last_name: payload.last_name,
      role,
    },
    select: safeUserSelect,
  });

  return user;
};

const logout = async (token: string) => {
  const cleanToken = token.startsWith("Bearer ") ? token.slice(7) : token;
  if (cleanToken) {
    await blacklistToken(cleanToken);
  }
};

export const authService = {
  login,
  register,
  logout,
};
export { AuthError };
