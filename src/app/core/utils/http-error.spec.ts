import { errorText } from "./http-error";

describe("errorText", () => {
  it("prioriza el detalle funcional del servidor sobre el error genérico HTTP", () => {
    expect(
      errorText({
        error: { error: "Documento duplicado" },
        message: "HTTP 409",
      }),
    ).toBe("Documento duplicado");
    expect(errorText({ error: { detail: "Sesión vencida" } })).toBe(
      "Sesión vencida",
    );
  });
  it("presenta un mensaje útil ante errores vacíos o desconocidos", () => {
    expect(errorText(null)).toBe("No se pudo completar la operación.");
    expect(errorText(new Error("Sin conexión"))).toBe("Sin conexión");
  });
});
