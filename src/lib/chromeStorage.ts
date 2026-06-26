export async function getChromeStorageJSON<T>(
  key: string
): Promise<T | null> {
  try {
    const result = await chrome.storage.local.get(key);

    if (!(key in result)) {
      return null;
    }

    return result[key] as T;
  } catch {
    return null;
  }
}

export async function setChromeStorageJSON(
  key: string,
  value: unknown
): Promise<void> {
  try {
    await chrome.storage.local.set({
      [key]: value,
    });
  } catch {
    // Ignore storage errors
  }
}

export async function removeChromeStorageItem(
  key: string
): Promise<void> {
  try {
    await chrome.storage.local.remove(key);
  } catch {
    // Ignore storage errors
  }
}

export async function clearChromeStorage(): Promise<void> {
  try {
    await chrome.storage.local.clear();
  } catch {
    // Ignore storage errors
  }
}