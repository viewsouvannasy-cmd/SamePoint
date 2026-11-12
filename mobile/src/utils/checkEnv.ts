export function checkEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`${name} Is Not Found`);
  }

  return value;
}
