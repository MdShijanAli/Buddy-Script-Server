import { Request, Response } from "express";
import { authService } from "./auth.service";
import { generateTokens } from "../../lib/tokens";

const login = async (req: Request, res: Response) => {
  try {
    const result = await authService.login(req.body);
    if (!result.user.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        code: "AUTH_FAILED",
      });
    }
    const tokens = generateTokens({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role || "USER",
    });
    res.json({
      success: true,
      message: "Login successful",
      user: result.user,
      tokens,
    });
  } catch (error: any) {
    console.error("Login error: ", error);
    return res.status(500).json({
      success: false,
      message: "Login failed",
      code: "LOGIN_ERROR",
      error: {
        message:
          error.message?.split("\n").pop().trim() || error.message || error,
      },
    });
  }
};

const register = async (req: Request, res: Response) => {
  try {
    const result = await authService.register(req.body);
    if (!result.user.id) {
      return res.status(400).json({
        success: false,
        message: "Registration failed",
        code: "REGISTRATION_FAILED",
      });
    }
    const tokens = generateTokens({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role || "USER",
    });
    res.json({
      success: true,
      message: "Registration successful",
      user: result.user,
      tokens,
    });
  } catch (error: any) {
    console.error("Registration error: ", error);
    return res.status(500).json({
      success: false,
      message: "Registration failed",
      code: "REGISTRATION_ERROR",
      error: {
        message:
          error.message?.split("\n").pop().trim() || error.message || error,
      },
    });
  }
};

const logout = async (req: Request, res: Response) => {
  try {
    await authService.logout(req.headers.authorization || "");
    res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error: any) {
    console.error("Logout error: ", error);
    return res.status(500).json({
      success: false,
      message: "Logout failed",
      code: "LOGOUT_ERROR",
      error: {
        message:
          error.message?.split("\n").pop().trim() || error.message || error,
      },
    });
  }
};

export const authController = {
  login,
  register,
  logout,
};
