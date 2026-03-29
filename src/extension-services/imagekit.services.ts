import { ExtensionAPI } from "@/lib/extensionApi";
import { MessageType } from "@/types/message-types";
import ApiError from "@/services/ApiError";
import ApiResponse from "@/services/ApiResponse";

class ImageKitExtensionService {
  async getAuthParameters<T>(): Promise<ApiResponse<T> | ApiError> {
    return ExtensionAPI.send(MessageType.GET_IMAGEKIT_AUTH);
  }

  async bulkDeleteFiles<T>(
    fileIds: string[],
  ): Promise<ApiResponse<T> | ApiError> {
    return ExtensionAPI.send(MessageType.IMAGEKIT_BULK_DELETE, {
      fileIds,
    });
  }
}

export default new ImageKitExtensionService();
