import { isApiResponse } from "@/lib/typeGuard";
import ApiError from "@/services/ApiError";
import type ApiResponse from "@/services/ApiResponse";
import ApiRequest from "@/services/ApiRequest";
import type { ImageKitAuthParams } from "@/types/imagekit";
import { isImageKitAuthPayload } from "@/lib/imagekit/auth";


class ImageKitService {
  IMAGEKIT_BASE = "/api/v1/imagekit";

  async fetchAuthParameters(): Promise<
    ApiResponse<ImageKitAuthParams> | ApiError
  > {
    const apiRequest = new ApiRequest(`${this.IMAGEKIT_BASE}/auth`);

    const response = await apiRequest.getRequest<ImageKitAuthParams>();

    if (!isApiResponse(response)) {
      return response;
    }

    if (!isImageKitAuthPayload(response.data)) {
      return new ApiError(
        "Invalid ImageKit auth response shape",
        response.data,
      );
    }

    return response as ApiResponse<ImageKitAuthParams>;
  }

  async bulkDeleteFiles(
    fileIds: string[],
  ): Promise<ApiResponse<unknown> | ApiError> {
    const apiRequest = new ApiRequest(`${this.IMAGEKIT_BASE}/bulk-delete`);

    const response = await apiRequest.postRequest<unknown>({ fileIds });

    if (isApiResponse(response)) {
      return response;
    }

    return response;
  }
}

export default new ImageKitService();
