import { AuthService } from "../../../../core/auth/auth-service";

import { Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
  standalone: true,
  imports: [RouterLink],
  templateUrl: "./inicio.html",
  styleUrl: "./inicio.css",
})
export class HomeComponent {
  auth = inject(AuthService);
}
