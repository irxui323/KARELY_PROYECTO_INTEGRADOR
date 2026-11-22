import { PERMISOS_POR_ROL } from "./permisos";
import { MENU } from "./menu";
describe("Acceso completo de administración", () => {
  it("incluye todos los permisos operativos de los trabajadores", () => {
    const admin = PERMISOS_POR_ROL.ADMINISTRADORA;
    for (const permisos of Object.values(PERMISOS_POR_ROL))
      for (const permiso of permisos) expect(admin).toContain(permiso);
  });
  it("permite todos los módulos del menú", () => {
    for (const item of MENU)
      if (item.permiso)
        expect(PERMISOS_POR_ROL.ADMINISTRADORA).toContain(item.permiso);
  });
  it("mantiene la tesorería fuera del alcance del doctor", () => {
    expect(PERMISOS_POR_ROL.DOCTOR).not.toContain("PAGOS_REGISTRAR");
  });
});
