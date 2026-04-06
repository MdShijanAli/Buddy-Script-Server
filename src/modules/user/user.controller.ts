import { Request, Response } from "express";
import { userService } from "./user.service";
import { envVars } from "../../config/env";

const getMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      });
    }

    const user = await userService.getMyProfile(userId);

    res.json({
      success: true,
      message: "Profile retrieved successfully",
      user,
    });
  } catch (error: any) {
    console.error("Get Profile Error: ", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve profile",
      code: "GET_PROFILE_ERROR",
      error: {
        message:
          error.message?.split("\n").pop().trim() || error.message || error,
      },
    });
  }
};

const updateMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      });
    }

    const uploadedFiles = (
      req as Request & {
        files?: { [fieldname: string]: Express.Multer.File[] };
      }
    ).files;
    const uploadedFile =
      uploadedFiles?.profile_image?.[0] ||
      uploadedFiles?.image?.[0] ||
      uploadedFiles?.file?.[0];

    const removeProfileImage =
      req.body.removeProfileImage === true ||
      req.body.removeProfileImage === "true" ||
      req.body.removeProfileImage === 1 ||
      req.body.removeProfileImage === "1";

    const profileImage = uploadedFile
      ? `${envVars.BETTER_AUTH_URL}/uploads/profiles/${uploadedFile.filename}`
      : removeProfileImage
        ? null
        : undefined;

    const user = await userService.updateMyProfile(userId, {
      name: req.body.name,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      phone: req.body.phone,
      bio: req.body.bio,
      location: req.body.location,
      profile_image: profileImage,
    });

    res.json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error: any) {
    console.error("Update Profile Error: ", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      code: "UPDATE_PROFILE_ERROR",
      error: {
        message:
          error.message?.split("\n").pop().trim() || error.message || error,
      },
    });
  }
};

export const userController = {
  getMyProfile,
  updateMyProfile,
};
