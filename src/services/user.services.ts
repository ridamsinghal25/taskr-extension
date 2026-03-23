import { isApiResponse } from "@/lib/typeGuard";
import ApiError from "@/services/ApiError";
import ApiRequest from "@/services/ApiRequest";
import ApiResponse from "@/services/ApiResponse";

class UserService {
  USER_BASE_URL = "/api/v1/users";

  async getCurrentUser<T>(): Promise<ApiResponse<T> | ApiError> {
    const apiRequest = new ApiRequest(`${this.USER_BASE_URL}/me`);

    const response = await apiRequest.getRequest<T>({});

   if (isApiResponse(response)) {
      return response;
    }

    return response;
  }
}

export default new UserService();