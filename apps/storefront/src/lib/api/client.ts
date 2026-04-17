const DEFAULT_MESSAGE = 'Something went wrong. Please try again.'
const NETWORK_MESSAGE = 'Network error. Please check your connection and try again.'

export async function extractApiError(
  res: Response,
  fallback = DEFAULT_MESSAGE,
): Promise<string> {
  try {
    const json = await res.json()
    return json?.error?.message ?? fallback
  } catch {
    return fallback
  }
}

export { NETWORK_MESSAGE }
