import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service.js";

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await authService.signUp(req.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: data.user,
        session: data.session,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const signIn = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await authService.signIn(req.body);
    res.status(200).json({
      success: true,
      message: "Authentication successful",
      data: {
        user: data.user,
        session: data.session,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const signOut = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.token) {
      await authService.signOut(req.token);
    }
    res.status(200).json({
      success: true,
      message: "Signed out successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await authService.resetPassword(req.body.email);
    res.status(200).json({
      success: true,
      message: "Password reset email sent if account exists",
    });
  } catch (error) {
    next(error);
  }
};
