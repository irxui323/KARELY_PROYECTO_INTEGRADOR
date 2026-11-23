var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Directive, Input, inject, } from "@angular/core";
import { NgControl } from "@angular/forms";
let ControlDisabled = class ControlDisabled {
    ngControl = inject(NgControl, { self: true });
    appControlDisabled = false;
    ngOnChanges() {
        this.synchronize();
    }
    ngAfterViewInit() {
        this.synchronize();
    }
    synchronize() {
        const control = this.ngControl.control;
        if (!control || control.disabled === this.appControlDisabled)
            return;
        if (this.appControlDisabled)
            control.disable({ emitEvent: false });
        else
            control.enable({ emitEvent: false });
    }
};
__decorate([
    Input()
], ControlDisabled.prototype, "appControlDisabled", void 0);
ControlDisabled = __decorate([
    Directive({ selector: "[appControlDisabled]", standalone: true })
], ControlDisabled);
export { ControlDisabled };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJvbC1kaXNhYmxlZC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL0M6L1VOSVZFUlNJREFEL0xQMi9TRU1BTkExMS9rYXJlbHlfbW9kZXJuby9mcm9udGVuZC9zcmMvYXBwL3NoYXJlZC9kaXJlY3RpdmVzLyIsInNvdXJjZXMiOlsiY29udHJvbC1kaXNhYmxlZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBRUwsU0FBUyxFQUNULEtBQUssRUFFTCxNQUFNLEdBQ1AsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBR3BDLElBQU0sZUFBZSxHQUFyQixNQUFNLGVBQWU7SUFDVCxTQUFTLEdBQUcsTUFBTSxDQUFDLFNBQVMsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ3RELGtCQUFrQixHQUFHLEtBQUssQ0FBQztJQUVwQyxXQUFXO1FBQ1QsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3JCLENBQUM7SUFDRCxlQUFlO1FBQ2IsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3JCLENBQUM7SUFFTyxXQUFXO1FBQ2pCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLFFBQVEsS0FBSyxJQUFJLENBQUMsa0JBQWtCO1lBQUUsT0FBTztRQUNyRSxJQUFJLElBQUksQ0FBQyxrQkFBa0I7WUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7O1lBQzlELE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztJQUM1QyxDQUFDO0NBQ0YsQ0FBQTtBQWZVO0lBQVIsS0FBSyxFQUFFOzJEQUE0QjtBQUZ6QixlQUFlO0lBRDNCLFNBQVMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxzQkFBc0IsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLENBQUM7R0FDckQsZUFBZSxDQWlCM0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBBZnRlclZpZXdJbml0LFxuICBEaXJlY3RpdmUsXG4gIElucHV0LFxuICBPbkNoYW5nZXMsXG4gIGluamVjdCxcbn0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IE5nQ29udHJvbCB9IGZyb20gXCJAYW5ndWxhci9mb3Jtc1wiO1xuXG5ARGlyZWN0aXZlKHsgc2VsZWN0b3I6IFwiW2FwcENvbnRyb2xEaXNhYmxlZF1cIiwgc3RhbmRhbG9uZTogdHJ1ZSB9KVxuZXhwb3J0IGNsYXNzIENvbnRyb2xEaXNhYmxlZCBpbXBsZW1lbnRzIE9uQ2hhbmdlcywgQWZ0ZXJWaWV3SW5pdCB7XG4gIHByaXZhdGUgcmVhZG9ubHkgbmdDb250cm9sID0gaW5qZWN0KE5nQ29udHJvbCwgeyBzZWxmOiB0cnVlIH0pO1xuICBASW5wdXQoKSBhcHBDb250cm9sRGlzYWJsZWQgPSBmYWxzZTtcblxuICBuZ09uQ2hhbmdlcygpOiB2b2lkIHtcbiAgICB0aGlzLnN5bmNocm9uaXplKCk7XG4gIH1cbiAgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xuICAgIHRoaXMuc3luY2hyb25pemUoKTtcbiAgfVxuXG4gIHByaXZhdGUgc3luY2hyb25pemUoKTogdm9pZCB7XG4gICAgY29uc3QgY29udHJvbCA9IHRoaXMubmdDb250cm9sLmNvbnRyb2w7XG4gICAgaWYgKCFjb250cm9sIHx8IGNvbnRyb2wuZGlzYWJsZWQgPT09IHRoaXMuYXBwQ29udHJvbERpc2FibGVkKSByZXR1cm47XG4gICAgaWYgKHRoaXMuYXBwQ29udHJvbERpc2FibGVkKSBjb250cm9sLmRpc2FibGUoeyBlbWl0RXZlbnQ6IGZhbHNlIH0pO1xuICAgIGVsc2UgY29udHJvbC5lbmFibGUoeyBlbWl0RXZlbnQ6IGZhbHNlIH0pO1xuICB9XG59XG4iXX0=