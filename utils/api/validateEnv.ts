/**
 * Safely retrieve required environment variables
 * @param key - Environment variable name
 * @returns The environment variable value
 * @throws Error if the environment variable is not set
 */
export function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}
