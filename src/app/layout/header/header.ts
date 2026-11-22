import { Component, inject } from "@angular/core";
import { AuthService } from "../../core/auth/auth-service";
@Component({
  selector: "app-header",
  standalone: true,
  templateUrl: "./header.html",
  styleUrl: "./header.css",
})
export class Header {
  auth = inject(AuthService);
}
