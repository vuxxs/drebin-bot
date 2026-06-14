export function getPositiveIntegerEnv(
  name: string,
  defaultValue: number,
): number {
  const rawValue = Deno.env.get(name);
  const parsedValue = rawValue ? Number.parseInt(rawValue, 10) : NaN;

  return Number.isFinite(parsedValue) && parsedValue > 0
    ? parsedValue
    : defaultValue;
}
