import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
  input,
} from "@angular/core";
import { AuthService } from "../../core/auth/auth-service";
import { Permiso } from "../../core/auth/auth.model";
@Directive({ selector: "[siPermiso]", standalone: true })
export class SiPermiso {
  readonly siPermiso = input.required<Permiso>();
  private auth = inject(AuthService);
  private template = inject(TemplateRef<unknown>);
  private container = inject(ViewContainerRef);
  private visible = false;
  constructor() {
    effect(() => {
      const permitido = this.auth.tienePermiso(this.siPermiso());
      if (permitido === this.visible) return;
      this.visible = permitido;
      this.container.clear();
      if (permitido) this.container.createEmbeddedView(this.template);
    });
  }
}
