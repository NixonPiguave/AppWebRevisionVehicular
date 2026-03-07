import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface TicketData {
  turnoId: number;
  tipoProceso: string;
  // Vehículo
  placa: string;
  anio?: number;
  marca?: string;
  modelo?: string;
  // Propietario
  propietarioNombre?: string;
  propietarioCedula?: string;
  // Pago
  numero: string;
  estado: string;
  fecha: string;
  items: TicketItem[];
  total: number;
  // Empresa
  logoUrl?: string;
  ciudad?: string;
}

export interface TicketItem {
  descripcion: string;
  valor: number;
}

@Injectable({ providedIn: 'root' })
export class TicketPagoService {

  private overlayEl: HTMLElement | null = null;
  private printWin: Window | null = null;

  constructor(private http: HttpClient) {}

  mostrar(data: TicketData): void {
    this.destruir();

    const overlay = document.createElement('div');
    overlay.id = 'ticket-overlay';
    overlay.innerHTML = this.renderOverlay(data);
    document.body.appendChild(overlay);
    this.overlayEl = overlay;

    overlay.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).id === 'ticket-overlay') this.destruir();
    });

    overlay.querySelector('#ticket-btn-cerrar')
      ?.addEventListener('click', () => this.destruir());

    overlay.querySelector('#ticket-btn-imprimir')
      ?.addEventListener('click', () => this.imprimirEnVentana(data));
  }

  private destruir(): void {
    this.overlayEl?.remove();
    this.overlayEl = null;
  }

  // Abre una nueva ventana con el ticket ya renderizado y llama a print()
  // Es el método más confiable cross-browser para imprimir un fragmento
  private imprimirEnVentana(data: TicketData): void {
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Comprobante #${data.turnoId}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Inter', system-ui, sans-serif; font-size:11px; color:#111;
           padding:20px; max-width:380px; margin:0 auto; }
    ${this.estilosTicket()}
  </style>
</head>
<body onload="window.print(); window.close();">
  ${this.renderCuerpo(data)}
</body>
</html>`;

    const win = window.open('', '_blank', 'width=420,height=700,scrollbars=no');
    if (!win) { alert('Permite ventanas emergentes para imprimir el comprobante.'); return; }
    win.document.write(html);
    win.document.close();
  }

  // ── HTML del overlay modal ──────────────────────────────────────
  private renderOverlay(data: TicketData): string {
    return `
      <style>
        #ticket-overlay {
          position:fixed; inset:0;
          background:rgba(0,0,0,0.55);
          display:flex; align-items:center; justify-content:center;
          z-index:9999;
          animation:tkFadeIn 0.18s ease;
        }
        @keyframes tkFadeIn { from{opacity:0} to{opacity:1} }

        #ticket-modal {
          background:#fff;
          border-radius:6px;
          width:380px;
          max-height:92vh;
          overflow-y:auto;
          box-shadow:0 24px 64px rgba(0,0,0,0.35);
          animation:tkSlideIn 0.2s ease;
          font-family:'Inter', system-ui, sans-serif;
        }
        @keyframes tkSlideIn {
          from{transform:translateY(-16px);opacity:0}
          to{transform:translateY(0);opacity:1}
        }

        .tk-acciones {
          display:flex; justify-content:flex-end; gap:8px;
          padding:10px 16px 12px;
          border-top:1px solid #e8e8e8;
          background:#fafafa;
          border-radius:0 0 6px 6px;
        }
        .tk-acciones button {
          padding:8px 20px; border:none; border-radius:6px;
          font-size:13px; font-weight:600; cursor:pointer;
          font-family:'Inter', system-ui, sans-serif;
          display:flex; align-items:center; gap:6px;
          transition:background 0.15s, transform 0.1s;
        }
        .tk-acciones button:active { transform:scale(0.97); }
        #ticket-btn-imprimir { background:#1a3d16; color:#fff; }
        #ticket-btn-imprimir:hover { background:#122b0f; }
        #ticket-btn-cerrar   { background:#ebebeb; color:#333; }
        #ticket-btn-cerrar:hover { background:#d8d8d8; }

        ${this.estilosTicket()}
      </style>

      <div id="ticket-modal">
        <div class="tk-wrap">
          ${this.renderCuerpo(data)}
        </div>
        <div class="tk-acciones">
          <button id="ticket-btn-cerrar">✕ Cerrar</button>
          <button id="ticket-btn-imprimir">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3
              11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1
              1zm-1-9H6v4h12V3z"/>
            </svg>
            Imprimir
          </button>
        </div>
      </div>
    `;
  }

  // ── Cuerpo del ticket (usado tanto en modal como en ventana de impresión) ──
  private renderCuerpo(data: TicketData): string {
    const itemsHtml = data.items.map(item => `
      <tr>
        <td class="tk-td-desc">${item.descripcion}</td>
        <td class="tk-td-val">${item.valor.toFixed(2)}</td>
      </tr>
    `).join('');

    // Logo: imagen si hay URL válida, sino bloque de texto
    const logoHtml = (data.logoUrl && data.logoUrl.trim())
      ? `<img src="${data.logoUrl}" alt="Logo" class="tk-logo-img"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
         />
         <div class="tk-logo-text" style="display:none">
           <span class="tk-logo-cr">CR</span><span class="tk-logo-tvm">TVM</span>
         </div>`
      : `<div class="tk-logo-text">
           <span class="tk-logo-cr">CR</span><span class="tk-logo-tvm">TVM</span>
         </div>`;

    const propietarioHtml = (data.propietarioNombre || data.propietarioCedula) ? `
      <div class="tk-divider-dash"></div>
      <div class="tk-section-title">DATOS DEL PROPIETARIO</div>
      <table class="tk-table-vehiculo">
        ${data.propietarioNombre ? `
        <tr>
          <td class="tk-lbl">Nombre:</td>
          <td class="tk-val-v" colspan="3">${data.propietarioNombre}</td>
        </tr>` : ''}
        ${data.propietarioCedula ? `
        <tr>
          <td class="tk-lbl">Cédula:</td>
          <td class="tk-val-v" colspan="3">${data.propietarioCedula}</td>
        </tr>` : ''}
      </table>
    ` : '';

    return `
      <div class="tk-header">
        <div class="tk-logo-wrap">
          ${logoHtml}
          <div class="tk-ciudad">${data.ciudad || 'Quevedo'}</div>
        </div>
        <div class="tk-header-title">COMPROBANTE DE<br>ORDEN DE PAGO</div>
      </div>

      <div class="tk-divider-dash"></div>

      <div class="tk-proceso-label">Tipo de Proceso:</div>
      <div class="tk-proceso-nombre">${(data.tipoProceso || '').toUpperCase()}</div>

      <div class="tk-divider-dash"></div>

      <div class="tk-section-title">DATOS DEL VEHÍCULO</div>
      <table class="tk-table-vehiculo">
        <tr>
          <td class="tk-lbl">Placa:</td>
          <td class="tk-val-v">${data.placa || '-'}</td>
          <td class="tk-lbl">Año:</td>
          <td class="tk-val-v">${data.anio || '-'}</td>
        </tr>
        <tr>
          <td class="tk-lbl">Marca:</td>
          <td class="tk-val-v" colspan="3">${data.marca || '-'}</td>
        </tr>
        <tr>
          <td class="tk-lbl">Modelo:</td>
          <td class="tk-val-v" colspan="3">${data.modelo || '-'}</td>
        </tr>
      </table>

      ${propietarioHtml}

      <div class="tk-divider-dash"></div>

      <div class="tk-section-title">DETALLE DEL PAGO</div>
      <div class="tk-pago-meta">
        <span>#: ${data.numero}</span>
        <span>Estado: <strong>${data.estado}</strong></span>
      </div>
      <div class="tk-pago-fecha">Fecha: ${data.fecha}</div>
      <table class="tk-table-items">
        <thead>
          <tr class="tk-items-head">
            <th class="tk-td-desc">Descripción</th>
            <th class="tk-td-val">Valor</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr class="tk-total-row">
            <td class="tk-td-desc tk-total-label">TOTAL A PAGAR</td>
            <td class="tk-td-val tk-total-val">${data.total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    `;
  }

  private estilosTicket(): string {
    return `
      .tk-wrap { padding:16px 20px 12px; }

      /* ── Cabecera ── */
      .tk-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:8px; gap:12px; }
      .tk-logo-wrap { display:flex; flex-direction:column; align-items:flex-start; min-width:80px; }
      .tk-logo-img { height:52px; width:auto; max-width:120px; object-fit:contain; display:block; }
      .tk-logo-text { display:flex; border:2px solid #1a3d16; padding:3px 8px;
                      font-weight:800; font-size:15px; letter-spacing:-0.5px; }
      .tk-logo-cr  { color:#1a3d16; }
      .tk-logo-tvm { color:#2d6b25; }
      .tk-ciudad { font-size:9px; text-transform:uppercase; letter-spacing:1px; color:#777; margin-top:4px; }
      .tk-header-title { font-size:10px; font-weight:700; text-align:right;
                         line-height:1.5; color:#1a3d16; white-space:nowrap; }

      /* ── Separadores ── */
      .tk-divider-dash { border:none; border-top:1px dashed #ccc; margin:8px 0; }

      /* ── Proceso ── */
      .tk-proceso-label { font-size:10px; color:#777; font-weight:500; margin-bottom:2px; }
      .tk-proceso-nombre { font-size:13px; font-weight:800; color:#1a3d16; line-height:1.3; margin-bottom:6px; }

      /* ── Secciones ── */
      .tk-section-title {
        font-weight:700; font-size:9.5px; text-transform:uppercase; letter-spacing:0.6px;
        background:#1a3d16; color:#fff; padding:4px 8px; margin-bottom:6px;
      }

      /* ── Tablas de datos ── */
      .tk-table-vehiculo { width:100%; border-collapse:collapse; margin-bottom:4px; }
      .tk-table-vehiculo td { padding:2px 4px; font-size:10.5px; }
      .tk-lbl   { color:#888; font-weight:600; white-space:nowrap; width:54px; }
      .tk-val-v { color:#111; font-weight:600; }

      /* ── Meta del pago ── */
      .tk-pago-meta { display:flex; justify-content:space-between; font-size:10px; color:#444; margin-bottom:2px; }
      .tk-pago-fecha { font-size:10px; color:#666; margin-bottom:6px; }

      /* ── Tabla de ítems ── */
      .tk-table-items { width:100%; border-collapse:collapse; }
      .tk-items-head th {
        font-size:9.5px; text-transform:uppercase; letter-spacing:0.4px;
        border-bottom:1px solid #bbb; padding:3px 4px; text-align:left;
        color:#555; font-weight:700;
      }
      .tk-table-items td { padding:4px 4px; font-size:10.5px; }
      .tk-td-desc { text-align:left; }
      .tk-td-val  { text-align:right; white-space:nowrap; }

      /* ── Total ── */
      .tk-total-row { border-top:2px solid #1a3d16; }
      .tk-total-label { font-weight:800; font-size:11px; padding-top:5px; }
      .tk-total-val   { font-weight:800; font-size:12px; color:#1a3d16; padding-top:5px; }
    `;
  }
}
