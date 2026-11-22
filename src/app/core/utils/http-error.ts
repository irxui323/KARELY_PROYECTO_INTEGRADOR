export function errorText(error: unknown): string {
  const value = error as {
    error?: { error?: string; detail?: string; message?: string };
    message?: string;
  } | null;
  return (
    value?.error?.error ||
    value?.error?.detail ||
    value?.error?.message ||
    value?.message ||
    "No se pudo completar la operación."
  );
}
