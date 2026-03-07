import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

export type NotificationType = 'success' | 'error' | 'warn' | 'info';

const DURATION_SUCCESS_MS = 4000;
const DURATION_ERROR_MS = 5500;

@Injectable({ providedIn: 'root' })
export class NotificationService {

  private readonly baseConfig: MatSnackBarConfig = {
    horizontalPosition: 'end',
    verticalPosition: 'top',
  };

  constructor(private snackBar: MatSnackBar) {}

  /**
   * Muestra un mensaje de éxito (cuadro verde). Se oculta automáticamente.
   */
  success(message: string, durationMs: number = DURATION_SUCCESS_MS): void {
    this.open(message, 'success', durationMs);
  }

  /**
   * Muestra un mensaje de error (cuadro rojo). Se oculta automáticamente.
   */
  error(message: string, durationMs: number = DURATION_ERROR_MS): void {
    this.open(message, 'error', durationMs);
  }

  /**
   * Muestra un mensaje de advertencia (cuadro ámbar).
   */
  warn(message: string, durationMs: number = DURATION_ERROR_MS): void {
    this.open(message, 'warn', durationMs);
  }

  /**
   * Muestra un mensaje informativo.
   */
  info(message: string, durationMs: number = DURATION_SUCCESS_MS): void {
    this.open(message, 'info', durationMs);
  }

  private open(message: string, type: NotificationType, durationMs: number): void {
    const panelClass = `snackbar-${type}`;
    this.snackBar.open(message, 'Cerrar', {
      ...this.baseConfig,
      duration: durationMs,
      panelClass: ['snackbar-base', panelClass],
    });
  }
}
