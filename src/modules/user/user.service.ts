import { prisma } from "../../lib/prisma";

interface UpdateProfilePayload {
  name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  bio?: string;
  location?: string;
  profile_image?: string | null;
}

const getMyProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      first_name: true,
      last_name: true,
      phone: true,
      profile_image: true,
      bio: true,
      location: true,
      is_active: true,
      is_banned: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

const updateMyProfile = async (
  userId: string,
  payload: UpdateProfilePayload,
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const result = await prisma.user.update({
    where: { id: userId },
    data: {
      name: payload.name,
      first_name: payload.first_name,
      last_name: payload.last_name,
      phone: payload.phone,
      bio: payload.bio,
      location: payload.location,
      profile_image: payload.profile_image,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      first_name: true,
      last_name: true,
      phone: true,
      profile_image: true,
      bio: true,
      location: true,
      is_active: true,
      is_banned: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return result;
};

export const userService = {
  getMyProfile,
  updateMyProfile,
};
