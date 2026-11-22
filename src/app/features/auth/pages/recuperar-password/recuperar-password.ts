import { ChangeDetectorRef, Component, inject } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { RecoveryService } from "../../services/recovery-service";
@Component({ standalone: true, imports: [ReactiveFormsModule, RouterLink], templateUrl: "./recuperar-password.html", styleUrl: "../recovery.css" })
export class RecuperarPassword {
    private readonly service = inject(RecoveryService);
    private readonly changeDetector = inject(ChangeDetectorRef);
    error = "";
    loading = false;
    enviado = false;
    readonly form = new FormGroup({ correo: new FormControl("", { nonNullable: true, validators: [Validators.required, Validators.email, Validators.maxLength(150)] }) });
    async enviar() {
        if (this.loading || this.enviado)
            return;
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.error = "Introduce un correo electrónico válido.";
            return;
        }
        this.error = "";
        this.loading = true;
        try {
            await this.service.solicitar(this.form.getRawValue().correo.trim());
            this.enviado = true;
        }
        catch {
            this.error = "No se pudo enviar la solicitud. Inténtalo nuevamente en unos minutos.";
        }
        finally {
            this.loading = false;
            this.changeDetector.markForCheck();
        }
    }
}
