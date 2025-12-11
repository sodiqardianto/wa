import { Response } from "express";
import { ApiResponse } from "../models/api.response";

export class ApiUtils {
  static successResponse<T>(res: Response, message: string, data?: T): void {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
    };
    res.json(response);
  }

  static errorResponse(res: Response, message: string, error?: string): void {
    const response: ApiResponse<null> = {
      success: false,
      message,
      error,
    };
    res.status(500).json(response);
  }

  static badRequestResponse(res: Response, message: string): void {
    const response: ApiResponse<null> = {
      success: false,
      message,
    };
    res.status(400).json(response);
  }

  static serviceUnavailableResponse(res: Response, message: string): void {
    const response: ApiResponse<null> = {
      success: false,
      message,
    };
    res.status(503).json(response);
  }
}
