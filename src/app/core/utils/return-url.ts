export function returnUrlSeguro(value: unknown): string | null {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//")
  )
    return null;
  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return null;
  }
  if (
    decoded.startsWith("//") ||
    /[\\\u0000-\u0020\u007f]/.test(decoded) ||
    /^\/login(?:[/?#;]|$)/i.test(decoded)
  )
    return null;
  return value;
}
