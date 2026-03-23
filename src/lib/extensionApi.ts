import type { MessageType } from "@/types/message-types";

export class ExtensionAPI {
  static send<T>(type: MessageType, payload?: any): Promise<T> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type, payload }, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
  }
}
