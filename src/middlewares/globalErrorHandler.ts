import type { NextFunction, Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client";

function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.error("Error occurred:", {
    message: err.message,
    code: err.code,
    stack: err.stack,
    path: req.path,
  });

  let statusCode = 500;
  let errorMessage = "Internal Server Error";
  let errorDetails = err;

  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    errorMessage = "Validation Error";
    errorDetails = {
      message: err.message,
      type: "PrismaValidationError",
    };
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400;
    errorMessage = "Database Error";
    errorDetails = {
      code: err.code,
      message: err.message,
      meta: err.meta,
      type: "PrismaKnownRequestError",
    };
  } else if (err.code) {
    statusCode = 400;
    errorMessage = err.message || "Request Failed";
    errorDetails = {
      code: err.code,
      message: err.message,
      details: err.details,
    };
  } else {
    errorDetails = {
      message: err.message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    };
  }

  res.status(statusCode).json({
    success: false,
    message: errorMessage,
    error: errorDetails,
  });
}

export default errorHandler;
