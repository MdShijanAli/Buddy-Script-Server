import { Router, type Request, type Response } from "express";
import { refreshAccessToken } from "../../lib/tokens";

const router = Router();

/**
 * POST /token/refresh
 * Refresh access token using refresh token
 */
router.post("/refresh", async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
        code: "MISSING_REFRESH_TOKEN",
      });
    }

    const tokens = await refreshAccessToken(refreshToken);

    if (!tokens) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
        code: "REFRESH_TOKEN_INVALID",
      });
    }

    res.json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  } catch (error: any) {
    console.error("Token refresh error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to refresh token",
      code: "REFRESH_ERROR",
    });
  }
});

export const tokenRoutes = router;
