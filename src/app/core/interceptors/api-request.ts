import { environment } from "../../../environments/environment";
export function isApiRequest(url: string): boolean {
  const base = environment.apiUrl.replace(/\/$/, "");
  return (
    url === base || url.startsWith(base + "/") || url.startsWith(base + "?")
  );
}
