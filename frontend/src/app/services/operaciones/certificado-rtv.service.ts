import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../notification.service';

const API = 'http://localhost:8080/api/turnos';

export interface CertificadoRtvData {
  empresa?: {
    nombre?: string;
    direccion?: string;
    telefono?: string;
    correo?: string;
    logoempresa?: string;
    ruc?: string;
  };
  inspectores?: string[];
  turno?: {
    numeroTurno?: string;
    placa?: string;
    propietarioNombre?: string;
    servicioNombre?: string;
    fechaInicio?: string;
  };
  pruebas?: Array<{
    metodoNombre?: string;
    resultado?: string;
    observaciones?: string;
    fechaInspeccion?: string;
    inspectorNombre?: string;
  }>;
}

@Injectable({ providedIn: 'root' })
export class CertificadoRtvService {

  private overlayEl: HTMLElement | null = null;
  private printWin: Window | null = null;

  constructor(
    private http: HttpClient,
    private notification: NotificationService
  ) {}

  mostrar(turnoId: number, onImpreso?: () => void): void {
    this.destruir();
    this.http.get<CertificadoRtvData>(`${API}/${turnoId}/certificado`).subscribe({
      next: (data) => {
        const overlay = document.createElement('div');
        overlay.id = 'certificado-overlay';
        overlay.innerHTML = this.renderOverlay(data);
        document.body.appendChild(overlay);
        this.overlayEl = overlay;

        overlay.addEventListener('click', (e) => {
          if ((e.target as HTMLElement).id === 'certificado-overlay') this.destruir();
        });
        overlay.querySelector('#cert-btn-cerrar')?.addEventListener('click', () => this.destruir());
        overlay.querySelector('#cert-btn-imprimir')?.addEventListener('click', () => {
          this.imprimirEnVentana(data);
          this.destruir();
          onImpreso?.();
        });
      },
      error: () => this.notification.error('No se pudieron cargar los datos del certificado.')
    });
  }

  private destruir(): void {
    this.overlayEl?.remove();
    this.overlayEl = null;
  }

  private imprimirEnVentana(data: CertificadoRtvData): void {
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Certificado RTV - ${data.turno?.numeroTurno ?? ''}</title>
  <style>${this.estilosCertificado()}</style>
</head>
<body onload="window.focus(); window.print();">
  <script>window.addEventListener('afterprint', function fn() { window.removeEventListener('afterprint', fn); window.close(); });</script>
  ${this.renderCuerpo(data)}
</body>
</html>`;
    const win = window.open('', '_blank', 'width=700,height=900,scrollbars=yes');
    if (!win) {
      this.notification.warn('Permite ventanas emergentes para imprimir el certificado.');
      return;
    }
    win.document.write(html);
    win.document.close();
  }

  private renderOverlay(data: CertificadoRtvData): string {
    return `
      <style>
        #certificado-overlay {
          position:fixed; inset:0;
          background:rgba(0,0,0,0.55);
          display:flex; align-items:center; justify-content:center;
          z-index:9999;
          animation:certFadeIn 0.18s ease;
        }
        @keyframes certFadeIn { from{opacity:0} to{opacity:1} }
        #certificado-modal {
          background:#fff;
          border-radius:8px;
          width:520px;
          max-height:92vh;
          overflow-y:auto;
          box-shadow:0 24px 64px rgba(0,0,0,0.35);
          animation:certSlideIn 0.2s ease;
          font-family:'Inter', system-ui, sans-serif;
        }
        @keyframes certSlideIn {
          from{transform:translateY(-16px);opacity:0}
          to{transform:translateY(0);opacity:1}
        }
        .cert-acciones {
          display:flex; justify-content:flex-end; gap:8px;
          padding:12px 16px; border-top:1px solid #e8e8e8;
          background:#fafafa; border-radius:0 0 8px 8px;
        }
        .cert-acciones button {
          padding:8px 20px; border:none; border-radius:6px;
          font-size:13px; font-weight:600; cursor:pointer;
          font-family:inherit; display:flex; align-items:center; gap:6px;
        }
        #cert-btn-imprimir { background:#1a3d16; color:#fff; }
        #cert-btn-imprimir:hover { background:#122b0f; }
        #cert-btn-cerrar { background:#ebebeb; color:#333; }
        #cert-btn-cerrar:hover { background:#d8d8d8; }
        ${this.estilosCertificado()}
      </style>
      <div id="certificado-modal">
        <div class="cert-wrap">
          ${this.renderCuerpo(data)}
        </div>
        <div class="cert-acciones">
          <button id="cert-btn-cerrar">Cerrar</button>
          <button id="cert-btn-imprimir">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>
            Imprimir
          </button>
        </div>
      </div>
    `;
  }

  private renderCuerpo(data: CertificadoRtvData): string {
    const emp = data.empresa ?? {};
    const logoHtml = (emp.logoempresa && emp.logoempresa.trim())
      ? `<img src="${emp.logoempresa}" alt="Logo" class="cert-logo" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
       <div class="cert-logo-text" style="display:none"><span class="cert-cr">CR</span><span class="cert-tvm">TVM</span></div>`
      : `<div class="cert-logo-text"><span class="cert-cr">CR</span><span class="cert-tvm">TVM</span></div>`;

    const inspectoresHtml = (data.inspectores && data.inspectores.length > 0)
      ? `<div class="cert-section-title">INSPECTOR(ES)</div>
         <div class="cert-inspectores">${data.inspectores.map(n => `<span class="cert-insp">${this.escape(n)}</span>`).join(', ')}</div>`
      : '';

    const pruebasRows = (data.pruebas ?? []).map(p => `
      <tr>
        <td class="cert-td-nom">${this.escape(p.metodoNombre ?? '-')}</td>
        <td class="cert-td-res">${this.escape(p.resultado ?? '-')}</td>
        <td class="cert-td-obs">${this.escape(p.observaciones ?? '')}</td>
        <td class="cert-td-ins">${this.escape(p.inspectorNombre ?? '-')}</td>
        <td class="cert-td-fec">${p.fechaInspeccion ? new Date(p.fechaInspeccion).toLocaleString('es') : '-'}</td>
      </tr>
    `).join('');

    const turno = data.turno ?? {};
    const fechaFormateada = turno.fechaInicio
      ? new Date(turno.fechaInicio + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : '-';

    return `
      <div class="cert-header">
        <div class="cert-empresa-wrap">
          ${logoHtml}
          <div class="cert-empresa-datos">
            <div class="cert-empresa-nombre">${this.escape(emp.nombre ?? '')}</div>
            <div class="cert-empresa-linea">${this.escape(emp.direccion ?? '')}</div>
            <div class="cert-empresa-linea">Tel: ${this.escape(emp.telefono ?? '')} | ${this.escape(emp.correo ?? '')}</div>
            <div class="cert-empresa-linea">RUC: ${this.escape(emp.ruc ?? '')}</div>
          </div>
        </div>
        <div class="cert-titulo-doc">CERTIFICADO DE REVISIÓN TÉCNICA VEHICULAR</div>
      </div>
      <div class="cert-divider"></div>
      ${inspectoresHtml}
      <div class="cert-divider"></div>
      <div class="cert-section-title">DATOS DEL TURNO</div>
      <table class="cert-tabla-datos">
        <tr><td class="cert-lbl">Nº Turno:</td><td class="cert-val">${this.escape(turno.numeroTurno ?? '-')}</td></tr>
        <tr><td class="cert-lbl">Placa:</td><td class="cert-val">${this.escape(turno.placa ?? '-')}</td></tr>
        <tr><td class="cert-lbl">Propietario:</td><td class="cert-val">${this.escape(turno.propietarioNombre ?? '-')}</td></tr>
        <tr><td class="cert-lbl">Servicio:</td><td class="cert-val">${this.escape(turno.servicioNombre ?? '-')}</td></tr>
        <tr><td class="cert-lbl">Fecha:</td><td class="cert-val">${fechaFormateada}</td></tr>
      </table>
      <div class="cert-divider"></div>
      <div class="cert-section-title">RESULTADOS DE LAS PRUEBAS</div>
      <table class="cert-tabla-pruebas">
        <thead>
          <tr><th>Prueba</th><th>Resultado</th><th>Observaciones</th><th>Inspector</th><th>Fecha</th></tr>
        </thead>
        <tbody>${pruebasRows || '<tr><td colspan="5">Sin registros</td></tr>'}</tbody>
      </table>
    `;
  }

  private escape(s: string): string {
    if (s == null) return '';
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  private estilosCertificado(): string {
    return `
      .cert-wrap { padding: 20px 24px 16px; }
      .cert-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 12px; }
      .cert-empresa-wrap { display: flex; gap: 14px; align-items: flex-start; }
      .cert-logo { height: 56px; width: auto; max-width: 120px; object-fit: contain; }
      .cert-logo-text { display: flex; border: 2px solid #1a3d16; padding: 4px 10px; font-weight: 800; font-size: 16px; }
      .cert-cr { color: #1a3d16; }
      .cert-tvm { color: #2d6b25; }
      .cert-empresa-datos { font-size: 11px; color: #333; line-height: 1.5; }
      .cert-empresa-nombre { font-weight: 700; font-size: 13px; color: #1a2e1a; margin-bottom: 4px; }
      .cert-empresa-linea { color: #555; }
      .cert-titulo-doc { font-size: 12px; font-weight: 800; text-align: right; color: #1a3d16; line-height: 1.4; text-transform: uppercase; }
      .cert-divider { border: none; border-top: 1px dashed #ccc; margin: 12px 0; }
      .cert-section-title { font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; background: #1a3d16; color: #fff; padding: 5px 10px; margin-bottom: 8px; }
      .cert-inspectores { font-size: 12px; color: #333; margin-bottom: 4px; }
      .cert-insp { display: inline; }
      .cert-tabla-datos { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 4px; }
      .cert-tabla-datos .cert-lbl { color: #666; font-weight: 600; width: 100px; padding: 2px 4px; }
      .cert-tabla-datos .cert-val { color: #111; padding: 2px 4px; }
      .cert-tabla-pruebas { width: 100%; border-collapse: collapse; font-size: 10px; }
      .cert-tabla-pruebas th { background: #1a3d16; color: #fff; padding: 6px 8px; text-align: left; font-weight: 700; }
      .cert-tabla-pruebas td { padding: 6px 8px; border-bottom: 1px solid #eee; }
      .cert-td-nom { font-weight: 600; }
      .cert-td-res { }
      .cert-td-obs { max-width: 180px; word-break: break-word; }
      .cert-td-ins { max-width: 150px; word-break: break-word; }
      .cert-td-fec { white-space: nowrap; }
    `;
  }
}
