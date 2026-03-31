import { prisma } from "../lib/prisma";
import { auth } from "../lib/auth";

// ==================== USER REGISTRATION HELPER ====================
export async function registerUser(data: {
  email: string;
  password: string;
  name: string;
  firstName?: string;
  lastName?: string;
}) {
  try {
    // Better-auth handles the actual registration via the API
    // This is just a type-safe wrapper for after registration
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: {
        id: true,
        email: true,
        name: true,
        first_name: true,
        last_name: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    return {
      success: !!user,
      data: user,
      message: user ? "User registered successfully" : "User not found",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: "Registration failed",
    };
  }
}

// ==================== GET USER SESSION ====================
export async function getUserSession(headers: Record<string, string>) {
  try {
    const session = await auth.api.getSession({ headers });

    if (!session || !session.user) {
      return {
        success: false,
        data: null,
        message: "No active session",
      };
    }

    return {
      success: true,
      data: {
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          role: session.user.role || "USER",
          emailVerified: session.user.emailVerified,
          image: session.user.image,
        },
        session: session.session,
      },
      message: "Session retrieved successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: "Failed to retrieve session",
    };
  }
}

// ==================== SIGN OUT ====================
export async function signOutUser(headers: Record<string, string>) {
  try {
    // Better-auth handles the signout via the API
    return {
      success: true,
      message: "Signed out successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: "Sign out failed",
    };
  }
}

// ==================== GET USER BY ID ====================
export async function getUserById(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        first_name: true,
        last_name: true,
        role: true,
        profile_image: true,
        bio: true,
        location: true,
        is_active: true,
        is_banned: true,
        is_featured: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return { success: false, data: null, message: "User not found" };
    }

    return {
      success: true,
      data: user,
      message: "User retrieved successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: "Failed to retrieve user",
    };
  }
}

// ==================== UPDATE USER PROFILE ====================
export async function updateUserProfile(
  userId: string,
  data: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    location?: string;
    profileImage?: string;
    phone?: string;
  },
) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        first_name: data.firstName,
        last_name: data.lastName,
        bio: data.bio,
        location: data.location,
        profile_image: data.profileImage,
        phone: data.phone,
      },
      select: {
        id: true,
        email: true,
        name: true,
        first_name: true,
        last_name: true,
        role: true,
        profile_image: true,
        bio: true,
        location: true,
        updatedAt: true,
      },
    });

    return {
      success: true,
      data: user,
      message: "Profile updated successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: "Failed to update profile",
    };
  }
}

// ==================== VERIFY EMAIL ====================
export async function verifyEmail(userId: string) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
      select: {
        id: true,
        email: true,
        emailVerified: true,
      },
    });

    return {
      success: true,
      data: user,
      message: "Email verified successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: "Email verification failed",
    };
  }
}
