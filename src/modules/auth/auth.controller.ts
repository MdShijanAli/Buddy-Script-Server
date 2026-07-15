import { Request, Response } from "express";
import { authService, AuthError } from "./auth.service";
import { generateTokens } from "../../lib/tokens";

const login = async (req: Request, res: Response) => {
  try {
    const user = await authService.login(req.body);
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role || "USER",
    });

    res.json({
      success: true,
      message: "Login successful",
      user,
      tokens,
    });
  } catch (error: any) {
    if (error instanceof AuthError) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
        code: error.code,
      });
    }

    console.error("Login error: ", error);
    return res.status(500).json({
      success: false,
      message: "Login failed",
      code: "LOGIN_ERROR",
    });
  }
};

const register = async (req: Request, res: Response) => {
  try {
    const user = await authService.register(req.body);
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role || "USER",
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      user,
      tokens,
    });
  } catch (error: any) {
    if (error instanceof AuthError) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
        code: error.code,
      });
    }

    console.error("Registration error: ", error);
    return res.status(500).json({
      success: false,
      message: "Registration failed",
      code: "REGISTRATION_ERROR",
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
    });
  }
};

export const authController = {
  login,
  register,
  logout,
};
