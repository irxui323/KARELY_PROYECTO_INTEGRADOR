import { expect, test } from "@playwright/test";

const baseUrl = "http://127.0.0.1:4200";

test("sin sesión, Pacientes redirige al login", async ({ page }) => {
  await page.goto(`${baseUrl}/pacientes`);
  await expect(page).toHaveURL(/\/login(?:\?|$)/);
});

test("la administradora inicia sesión y abre Pacientes", async ({ page }) => {
  const usuario = process.env.E2E_USUARIO;
  const clave = process.env.E2E_CLAVE;
  if (!usuario || !clave) throw new Error("Faltan las credenciales de prueba");

  await page.goto(`${baseUrl}/login`);
  await page.getByPlaceholder("Ingrese su usuario").fill(usuario);
  await page.getByPlaceholder("Contraseña", { exact: true }).fill(clave);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page.getByRole("button", { name: "Cerrar sesión" })).toBeVisible();

  await page.goto(`${baseUrl}/pacientes`);
  await expect(page.getByRole("heading", { name: "Pacientes registrados" })).toBeVisible();
});