export function getEnv(value: string): string {
  const env = process.env[value];
  if (!env) {
    throw new Error(`${value} is not set`);
  }

  return env;
}
