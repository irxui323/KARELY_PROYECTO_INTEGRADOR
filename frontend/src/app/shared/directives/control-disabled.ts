import {
  AfterViewInit,
  Directive,
  Input,
  OnChanges,
  inject,
} from "@angular/core";
import { NgControl } from "@angular/forms";

@Directive({ selector: "[appControlDisabled]", standalone: true })
export class ControlDisabled implements OnChanges, AfterViewInit {
  private readonly ngControl = inject(NgControl, { self: true });
  @Input() appControlDisabled = false;

  ngOnChanges(): void {
    this.synchronize();
  }
  ngAfterViewInit(): void {
    this.synchronize();
  }

  private synchronize(): void {
    const control = this.ngControl.control;
    if (!control || control.disabled === this.appControlDisabled) return;
    if (this.appControlDisabled) control.disable({ emitEvent: false });
    else control.enable({ emitEvent: false });
  }
}
