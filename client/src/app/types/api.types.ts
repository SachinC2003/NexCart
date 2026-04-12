export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  statusCode: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface MessageResponse {
  message: string;
}
