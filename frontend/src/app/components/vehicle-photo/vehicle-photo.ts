import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

/** Displays the actual registered photograph; never substitutes another vehicle's photo. */
@Component({
  selector: 'app-vehicle-photo',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: ` <div class="photo" [class.compact]="compact">
    <img
      *ngIf="safeUrl && !failed; else placeholder"
      [src]="safeUrl"
      [alt]="'Fotografía de ' + label"
      loading="lazy"
      (error)="failed = true"
    />
    <ng-template #placeholder
      ><div class="placeholder" [attr.aria-label]="'Sin fotografía de ' + label">
        <mat-icon>directions_car</mat-icon><span *ngIf="!compact">Sin fotografía</span>
      </div></ng-template
    >
  </div>`,
  styles: [
    `
      :host {
        display: block;
      }
      .photo {
        width: 100%;
        height: 150px;
        border: 1px solid var(--rtv-border, #e0e5dc);
        background: #f5f7f2;
        border-radius: 10px;
        overflow: hidden;
      }
      img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
      .placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        gap: 8px;
        color: #7b8870;
        font-size: 12px;
      }
      .placeholder mat-icon {
        font-size: 42px;
        width: 42px;
        height: 42px;
      }
      .compact {
        width: 64px;
        height: 45px;
        border-radius: 7px;
      }
      .compact mat-icon {
        font-size: 26px;
        width: 26px;
        height: 26px;
      }
    `,
  ],
})
export class VehiclePhotoComponent implements OnChanges {
  @Input() url?: string | null;
  @Input() label = 'vehículo';
  @Input() compact = false;
  failed = false;
  get safeUrl(): string | null {
    return this.url && /^https:\/\//i.test(this.url) ? this.url : null;
  }
  ngOnChanges(): void {
    this.failed = false;
  }
}
