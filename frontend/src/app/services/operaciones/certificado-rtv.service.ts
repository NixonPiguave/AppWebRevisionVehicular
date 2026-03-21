import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as QRCode from 'qrcode';
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
  vehiculo?: {
    placa?: string;
    marca?: string;
    modelo?: string;
    anio?: number;
    chasis?: string;
    motor?: string;
    vin?: string;
  };
  pruebas?: Array<{
    metodoNombre?: string;
    resultado?: string;
    observaciones?: string;
    fechaInspeccion?: string;
    inspectorNombre?: string;
  }>;
  defectos?: Array<{
    codigo?: string;
    descripcion?: string;
    tipo?: string;
  }>;
  pruebasMecatronicas?: Array<{
    codigo?: string;
    descripcionPrueba?: string;
    unidad?: string;
    valor?: string;
    limites?: string;
    calificacion?: string;
    ubicacion?: string;
  }>;
  totalTipo1?: number;
  totalTipo2?: number;
  totalTipo3?: number;
  resultadoFinal?: string;
  fechaEmision?: string;
  validoHasta?: string;
  kilometraje?: number | null;
  numeroRevision?: string;
  linea?: { codigo?: string; descripcion?: string };
  equiposUtilizados?: Array<{
    nombre?: string;
    modelo?: string;
    serial?: string;
    codigoInterno?: string;
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
        void this.mostrarConQr(data, onImpreso);
      },
      error: () => this.notification.error('No se pudieron cargar los datos del certificado.')
    });
  }

  private async mostrarConQr(data: CertificadoRtvData, onImpreso?: () => void): Promise<void> {
    const qrDataUrl = await this.buildQrDataUrl(data);
    const overlay = document.createElement('div');
    overlay.id = 'certificado-overlay';
    overlay.innerHTML = this.renderOverlay(data, qrDataUrl);
    document.body.appendChild(overlay);
    this.overlayEl = overlay;

    overlay.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).id === 'certificado-overlay') this.destruir();
    });
    overlay.querySelector('#cert-btn-cerrar')?.addEventListener('click', () => this.destruir());
    overlay.querySelector('#cert-btn-imprimir')?.addEventListener('click', () => {
      void this.imprimirEnVentana(data, qrDataUrl);
      this.destruir();
      onImpreso?.();
    });
  }

  private destruir(): void {
    this.overlayEl?.remove();
    this.overlayEl = null;
  }

  private async imprimirEnVentana(data: CertificadoRtvData, qrDataUrl?: string): Promise<void> {
    const qr = qrDataUrl ?? (await this.buildQrDataUrl(data));
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Certificado RTV - ${this.escape(String(data.turno?.numeroTurno ?? data.numeroRevision ?? ''))}</title>
  <style>${this.estilosCertificado()}</style>
</head>
<body onload="window.focus(); window.print();">
  <script>window.addEventListener('afterprint', function fn() { window.removeEventListener('afterprint', fn); window.close(); });</script>
  <div class="cert-wrap">${this.renderCuerpo(data, qr)}</div>
</body>
</html>`;
    const win = window.open('', '_blank', 'width=900,height=900,scrollbars=yes');
    if (!win) {
      this.notification.warn('Permite ventanas emergentes para imprimir el certificado.');
      return;
    }
    win.document.write(html);
    win.document.close();
  }

  private renderOverlay(data: CertificadoRtvData, qrDataUrl: string): string {
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
          border-radius:10px;
          width:min(95vw, 800px);
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
          ${this.renderCuerpo(data, qrDataUrl)}
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

  /** Solo matrícula y datos del vehículo (nada de certificado, turno ni empresa). */
  private buildQrPayload(data: CertificadoRtvData): string {
    const veh = data.vehiculo ?? {};
    const turno = data.turno ?? {};
    const matricula = (veh.placa ?? turno.placa ?? '').trim();

    return JSON.stringify({
      matricula,
      marca: veh.marca ?? '',
      modelo: veh.modelo ?? '',
      anio: veh.anio ?? null,
      chasis: veh.chasis ?? '',
      motor: veh.motor ?? '',
      vin: veh.vin ?? ''
    });
  }

  private async buildQrDataUrl(data: CertificadoRtvData): Promise<string> {
    try {
      return await QRCode.toDataURL(this.buildQrPayload(data), {
        width: 200,
        margin: 1,
        errorCorrectionLevel: 'M'
      });
    } catch {
      return '';
    }
  }

  /** Año mostrado en el adhesivo (prioridad: fecha de emisión del certificado). */
  private anioSticker(data: CertificadoRtvData): string {
    const fe = data.fechaEmision?.trim();
    if (fe) {
      const y4 = fe.match(/\b(20\d{2})\b/);
      if (y4) return y4[1];
      const parts = fe.split(/[/\-.]/).map((p) => p.trim());
      if (parts.length >= 3) {
        let y = parseInt(parts[parts.length - 1]!, 10);
        if (y >= 0 && y < 100) y += 2000;
        if (y >= 1990 && y <= 2100) return String(y);
      }
    }
    return String(new Date().getFullYear());
  }

  private formatoSerialRevision(data: CertificadoRtvData): string {
    const raw = String(data.numeroRevision ?? data.turno?.numeroTurno ?? '0').replace(/\D/g, '') || '0';
    const n = parseInt(raw, 10) || 0;
    return String(n).padStart(7, '0');
  }

  private renderCuerpo(data: CertificadoRtvData, qrDataUrl: string): string {
    const emp = data.empresa ?? {};
    const veh = data.vehiculo ?? {};
    const turno = data.turno ?? {};
    const iniciales = (emp.nombre ?? 'RTV').trim().substring(0, 2).toUpperCase() || 'RT';
    const logoHtml = (emp.logoempresa && emp.logoempresa.trim())
      ? `<div class="cert-logo-wrap"><img src="${emp.logoempresa}" alt="Logo" class="cert-logo" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
       <div class="cert-logo-text" style="display:none"><span class="cert-cr">${this.escape(iniciales)}</span><span class="cert-tvm">RTV</span></div></div>`
      : `<div class="cert-logo-wrap"><div class="cert-logo-text"><span class="cert-cr">${this.escape(iniciales)}</span><span class="cert-tvm">RTV</span></div></div>`;

    const marcaModeloAnio = [veh.marca, veh.modelo, veh.anio].filter(Boolean).join(', ');
    const chasisMotor = [veh.chasis, veh.motor].filter(Boolean).join(' / ') || '-';
    const placaCert = veh.placa ?? turno.placa ?? '-';
    const anioAdh = this.anioSticker(data);
    const serialRev = this.formatoSerialRevision(data);
    const qrImg = qrDataUrl
      ? `<img class="cert-adh-qr" src="${qrDataUrl}" width="200" height="200" alt="QR datos vehículo"/>`
      : '<span class="cert-adh-qr-fail">QR no disponible</span>';
    const logoMini =
      emp.logoempresa && emp.logoempresa.trim()
        ? `<img src="${emp.logoempresa}" alt="" class="cert-adh-logo" onerror="this.style.display='none'"/>`
        : `<div class="cert-adh-logo-fallback">${this.escape((emp.nombre ?? 'RTV').substring(0, 18))}</div>`;

    const pruebasMecRows = (data.pruebasMecatronicas ?? []).map(p => `
      <tr>
        <td class="cert-td-cod">${this.escape(p.codigo ?? '-')}</td>
        <td class="cert-td-desc">${this.escape(p.descripcionPrueba ?? '-')}</td>
        <td class="cert-td-unidad">${this.escape(p.unidad ?? '-')}</td>
        <td class="cert-td-valor">${this.escape(p.valor ?? '-')}</td>
        <td class="cert-td-lim">${this.escape(p.limites ?? '-')}</td>
        <td class="cert-td-cal ${(p.calificacion || '').toUpperCase() === 'OK' ? 'cert-ok' : 'cert-tipo'}">${this.escape(p.calificacion ?? '-')}</td>
      </tr>
    `).join('');

    const inspectoresTexto = (data.inspectores && data.inspectores.length > 0)
      ? data.inspectores.map(n => this.escape(n)).join(', ')
      : '-';

    return `
      <div class="cert-header-block">
        <div class="cert-header-top">
          <div class="cert-header-gob">
            <div class="cert-ec-titulo">REPÚBLICA DEL ECUADOR</div>
            <div class="cert-ec-rtv">REVISIÓN TÉCNICA VEHICULAR</div>
          </div>
          <div class="cert-header-logo-center">${logoHtml}</div>
          <div class="cert-header-empresa">
            <div class="cert-empresa-datos">
              <div class="cert-empresa-nombre">${this.escape(emp.nombre ?? '')}</div>
              <div class="cert-empresa-linea">${this.escape(emp.direccion ?? '')}</div>
              <div class="cert-empresa-linea">Tel: ${this.escape(emp.telefono ?? '')} · ${this.escape(emp.correo ?? '')}</div>
              <div class="cert-empresa-linea">RUC: ${this.escape(emp.ruc ?? '')}</div>
            </div>
          </div>
        </div>
        <div class="cert-header-divider"></div>
        <div class="cert-encabezado-vehiculo">
          <div class="cert-datos-vehiculo-wrap">
          <table class="cert-tabla-enc">
            <colgroup><col class="cert-col-lbl"><col><col class="cert-col-lbl"><col></colgroup>
            <tr>
              <td class="cert-lbl">No. Revisión</td>
              <td class="cert-val">${this.escape(data.numeroRevision ?? '1')}</td>
              <td class="cert-lbl">Fecha Emisión</td>
              <td class="cert-val">${this.escape(data.fechaEmision ?? '-')}</td>
            </tr>
            <tr>
              <td class="cert-lbl">Marca/Modelo/Año</td>
              <td class="cert-val" colspan="3">${this.escape(marcaModeloAnio || '-')}</td>
            </tr>
            <tr>
              <td class="cert-lbl">Placa</td>
              <td class="cert-val">${this.escape(veh.placa ?? turno.placa ?? '-')}</td>
              <td class="cert-lbl">Chasis/Motor</td>
              <td class="cert-val">${this.escape(chasisMotor)}</td>
            </tr>
            <tr>
              <td class="cert-lbl">Resultado</td>
              <td class="cert-val cert-resultado ${(data.resultadoFinal || '').toUpperCase() === 'APROBADO' ? 'ok' : 'ko'}" colspan="3">${this.escape(data.resultadoFinal ?? 'PENDIENTE')}</td>
            </tr>
            <tr>
              <td class="cert-lbl">Válido hasta</td>
              <td class="cert-val">${this.escape(data.validoHasta ?? '-')}</td>
              <td class="cert-lbl">Línea</td>
              <td class="cert-val">${this.escape(data.linea?.descripcion ?? data.linea?.codigo ?? '-')}</td>
            </tr>
            <tr>
              <td class="cert-lbl">Tipo 1 / 2 / 3</td>
              <td class="cert-val" colspan="3">${data.totalTipo1 ?? 0} / ${data.totalTipo2 ?? 0} / ${data.totalTipo3 ?? 0}</td>
            </tr>
            <tr>
              <td class="cert-lbl">Kilometraje</td>
              <td class="cert-val" colspan="3">${data.kilometraje != null ? (data.kilometraje.toLocaleString('es-EC') + ' km') : 'N/D'}</td>
            </tr>
            <tr>
              <td class="cert-lbl">Inspector(es)</td>
              <td class="cert-val" colspan="3">${inspectoresTexto}</td>
            </tr>
          </table>
          </div>
        </div>
      </div>
      <div class="cert-divider"></div>
      <div class="cert-section-title">RESULTADOS PRUEBAS MECATRÓNICAS</div>
      <table class="cert-tabla-mecatronica">
        <thead>
          <tr>
            <th>Código</th>
            <th>Descripción Prueba Mecatrónica</th>
            <th>Unidad</th>
            <th>Valor</th>
            <th>Límites</th>
            <th>Calificación</th>
          </tr>
        </thead>
        <tbody>${pruebasMecRows || '<tr><td colspan="6">Sin pruebas mecatrónicas registradas</td></tr>'}</tbody>
      </table>
      <div class="cert-divider"></div>
      <div class="cert-section-title">DEFECTOS INSPECCIÓN VISUAL</div>
      <table class="cert-tabla-pruebas">
        <thead>
          <tr><th>Código</th><th>Defecto</th><th>Tipo</th></tr>
        </thead>
        <tbody>${(data.defectos ?? []).map(d => `
          <tr>
            <td>${this.escape(d.codigo ?? '-')}</td>
            <td>${this.escape(d.descripcion ?? '-')}</td>
            <td>${this.escape(d.tipo ?? '-')}</td>
          </tr>
        `).join('') || '<tr><td colspan="3">Sin defectos detectados</td></tr>'}</tbody>
      </table>
      ${(data.equiposUtilizados && data.equiposUtilizados.length > 0) ? `
      <div class="cert-divider"></div>
      <div class="cert-section-title">EQUIPOS UTILIZADOS (TRAZABILIDAD)</div>
      <table class="cert-tabla-pruebas">
        <thead>
          <tr><th>Equipo</th><th>Modelo</th><th>Serial</th><th>Código interno</th></tr>
        </thead>
        <tbody>${data.equiposUtilizados.map(e => `
          <tr>
            <td>${this.escape(e.nombre ?? '-')}</td>
            <td>${this.escape(e.modelo ?? '-')}</td>
            <td>${this.escape(e.serial ?? '-')}</td>
            <td>${this.escape(e.codigoInterno ?? '-')}</td>
          </tr>
        `).join('')}</tbody>
      </table>
      ` : ''}
      <div class="cert-divider cert-adh-divider"></div>
      <div class="cert-adhesivos-fila" aria-label="Adhesivos certificación RTV">
        <div class="cert-adhesivo cert-adhesivo-holo">
          <div class="cert-adh-holo-band">CERTIFICADO REVISIÓN TÉCNICA VEHICULAR</div>
          <div class="cert-adh-holo-body">
            <div class="cert-adh-blanco">
              <div class="cert-adh-anio">${this.escape(anioAdh)}</div>
              <div class="cert-adh-placa">${this.escape(placaCert)}</div>
              ${qrImg}
              <div class="cert-adh-solo">SOLO REVISIÓN TÉCNICA</div>
            </div>
          </div>
          <div class="cert-adh-serial">${this.escape(serialRev)}</div>
        </div>
        <div class="cert-adhesivo cert-adhesivo-marco">
          <div class="cert-adh-marco-inner">
            <div class="cert-adh-lateral cert-adh-lateral-izq">VEHICULO</div>
            <div class="cert-adh-centro">
              <div class="cert-adh-centro-logo">${logoMini}</div>
              <div class="cert-adh-anio">${this.escape(anioAdh)}</div>
              <div class="cert-adh-placa">${this.escape(placaCert)}</div>
              ${qrImg}
              <div class="cert-adh-solo cert-adh-solo-largo">SOLO REVISIÓN TÉCNICA VEHICULAR</div>
            </div>
            <div class="cert-adh-lateral cert-adh-lateral-der">${this.escape(serialRev)}</div>
          </div>
        </div>
      </div>
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
      * { box-sizing: border-box; }
      body { margin: 0; padding: 0; font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; font-size: 12px; color: #1a1a1a; line-height: 1.4; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .cert-wrap { padding: 28px 32px 24px; max-width: 800px; margin: 0 auto; }
      .cert-header-block { margin-bottom: 24px; }
      .cert-header-top { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 20px; padding: 16px 20px; background: linear-gradient(180deg, #f0f7ef 0%, #fff 100%); border: 1px solid #d4e5d2; border-radius: 10px; }
      .cert-header-gob { text-align: left; }
      .cert-header-logo-center { display: flex; justify-content: center; align-items: center; }
      .cert-header-logo-center .cert-logo-wrap { margin: 0; }
      .cert-header-logo-center .cert-logo { height: 72px; max-width: 160px; }
      .cert-header-logo-center .cert-logo-text { width: 72px; height: 72px; font-size: 16px; }
      .cert-header-empresa { text-align: right; }
      .cert-ec-titulo { font-size: 10px; font-weight: 600; color: #5a6b59; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 6px; }
      .cert-ec-rtv { font-size: 17px; font-weight: 700; color: #1a3d16; letter-spacing: 0.03em; line-height: 1.2; }
      .cert-header-divider { height: 2px; background: linear-gradient(90deg, #1a3d16 0%, #2d5a27 50%, transparent 100%); margin: 18px 0 20px; border-radius: 1px; }
      .cert-logo-wrap { position: relative; flex-shrink: 0; }
      .cert-logo { height: 64px; width: auto; max-width: 140px; object-fit: contain; display: block; border-radius: 8px; }
      .cert-logo-text { display: flex; align-items: center; justify-content: center; width: 64px; height: 64px; background: linear-gradient(135deg, #1a3d16 0%, #2d5a27 100%); color: #fff; font-weight: 700; font-size: 14px; border-radius: 10px; box-shadow: 0 3px 8px rgba(26,61,22,0.3); }
      .cert-cr { color: #fff; }
      .cert-tvm { color: #8bc34a; margin-left: 2px; }
      .cert-empresa-datos { font-size: 12px; color: #444; line-height: 1.65; }
      .cert-empresa-nombre { font-weight: 700; font-size: 14px; color: #1a3d16; margin-bottom: 8px; letter-spacing: 0.02em; }
      .cert-empresa-linea { color: #555; font-size: 11px; }
      @media (max-width: 600px) { .cert-header-top { grid-template-columns: 1fr; text-align: center; } .cert-header-empresa { text-align: center; } }
      .cert-encabezado-vehiculo { width: 100%; }
      .cert-datos-vehiculo-wrap { background: #fafbfa; border: 1px solid #dce5dc; border-radius: 10px; padding: 20px 24px; box-shadow: 0 1px 3px rgba(26,61,22,0.06); }
      .cert-tabla-enc { width: 100%; border-collapse: collapse; font-size: 12px; table-layout: fixed; }
      .cert-tabla-enc .cert-col-lbl { width: 150px; min-width: 150px; }
      .cert-tabla-enc .cert-lbl { color: #5a6b59; font-weight: 600; font-size: 11px; padding: 10px 16px 10px 0; min-width: 150px; vertical-align: top; text-transform: uppercase; letter-spacing: 0.03em; }
      .cert-tabla-enc .cert-val { color: #1a1a1a; font-weight: 500; padding: 10px 0; border-bottom: 1px solid #e8ece8; }
      .cert-tabla-enc tr:last-child .cert-val { border-bottom: none; }
      .cert-tabla-enc tr:last-child td { padding-bottom: 0; }
      .cert-divider { border: none; border-top: 1px solid #ddd; margin: 20px 0; }
      .cert-section-title { font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; background: #1a3d16; color: #fff; padding: 10px 14px; margin-bottom: 0; border-radius: 4px 4px 0 0; }
      .cert-tabla-mecatronica { width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 0; border: 1px solid #ddd; border-top: none; }
      .cert-tabla-mecatronica th { background: #2d5a27; color: #fff; padding: 10px 12px; text-align: left; font-weight: 600; font-size: 10px; }
      .cert-tabla-mecatronica td { padding: 10px 12px; border-bottom: 1px solid #eee; }
      .cert-tabla-mecatronica tbody tr:nth-child(even) { background: #f8faf8; }
      .cert-td-cod { font-weight: 600; color: #1a3d16; }
      .cert-td-unidad { text-align: center; }
      .cert-td-valor { text-align: right; font-weight: 500; }
      .cert-td-lim { font-size: 9px; color: #444; min-width: 90px; white-space: nowrap; }
      .cert-td-cal.cert-ok { color: #1e7b34; font-weight: 700; }
      .cert-td-cal.cert-tipo { color: #c62828; font-weight: 700; }
      .cert-tabla-pruebas { width: 100%; border-collapse: collapse; font-size: 11px; border: 1px solid #ddd; border-top: none; }
      .cert-tabla-pruebas th { background: #2d5a27; color: #fff; padding: 10px 14px; text-align: left; font-weight: 600; font-size: 10px; }
      .cert-tabla-pruebas td { padding: 10px 14px; border-bottom: 1px solid #eee; }
      .cert-tabla-pruebas tbody tr:nth-child(even) { background: #f8faf8; }
      .cert-resultado { font-weight: 700; font-size: 14px; letter-spacing: 0.04em; }
      .cert-resultado.ok { color: #1e7b34; }
      .cert-resultado.ko { color: #c62828; }
      .cert-adh-divider { margin-top: 24px; }
      .cert-adhesivos-fila {
        display: flex;
        flex-direction: row;
        gap: 5mm;
        justify-content: space-between;
        align-items: flex-end;
        margin-top: 4px;
        page-break-inside: avoid;
        break-inside: avoid;
      }
      .cert-adhesivo {
        flex: 1 1 0;
        min-width: 0;
        box-sizing: border-box;
        position: relative;
      }
      .cert-adhesivo-holo {
        border: 0.35mm solid #9e9e9e;
        border-radius: 2mm;
        background:
          linear-gradient(125deg, rgba(255,255,255,0.35) 0%, transparent 40%),
          linear-gradient(210deg, #e8f5e9 0%, #b2dfdb 18%, #fff9c4 35%, #e1bee7 52%, #bbdefb 70%, #c8e6c9 100%);
        box-shadow: inset 0 0 0 1px rgba(255,255,255,0.5);
        padding: 2mm 2mm 0;
        width: 90mm;
        max-width: 100%;
      }
      .cert-adh-holo-band {
        font-size: 5.5px;
        font-weight: 800;
        text-align: center;
        letter-spacing: 0.04em;
        color: #1a237e;
        line-height: 1.15;
        padding: 1mm 2mm 1.5mm;
        text-transform: uppercase;
      }
      .cert-adh-holo-body { padding: 0 1mm 1mm; }
      .cert-adh-blanco {
        background: #fff;
        border: 0.25mm solid #cfd8dc;
        border-radius: 1mm;
        padding: 2mm 3mm 2mm;
        text-align: center;
        box-shadow: 0 1px 2px rgba(0,0,0,0.08);
      }
      .cert-adh-anio {
        font-size: 22px;
        font-weight: 800;
        line-height: 1;
        color: #111;
        letter-spacing: 0.02em;
      }
      .cert-adh-placa {
        font-size: 13px;
        font-weight: 700;
        margin: 2px 0 3px;
        letter-spacing: 0.12em;
        color: #1a1a1a;
      }
      .cert-adh-qr-fail { font-size: 8px; color: #c62828; display: block; padding: 4px; }
      .cert-adh-qr {
        display: block;
        margin: 0 auto;
        width: 26mm !important;
        height: 26mm !important;
        max-width: 100%;
        image-rendering: pixelated;
        image-rendering: crisp-edges;
      }
      .cert-adh-solo {
        font-size: 5.5px;
        font-weight: 700;
        letter-spacing: 0.06em;
        margin-top: 2px;
        color: #37474f;
        text-transform: uppercase;
      }
      .cert-adh-solo-largo { font-size: 5px; line-height: 1.2; }
      .cert-adh-serial {
        text-align: center;
        font-size: 11px;
        font-weight: 800;
        color: #c62828;
        letter-spacing: 0.15em;
        padding: 2mm 0 1mm;
      }
      .cert-adhesivo-marco {
        border: 1.2mm solid #5d4037;
        border-radius: 3mm;
        background: #faf8f5;
        padding: 1.5mm;
        width: 90mm;
        max-width: 100%;
        min-height: 44mm;
        box-sizing: border-box;
      }
      .cert-adh-marco-inner {
        display: flex;
        flex-direction: row;
        align-items: stretch;
        justify-content: space-between;
        gap: 1mm;
        min-height: 38mm;
        background: #fff;
        border-radius: 2mm;
        border: 0.25mm solid #d7ccc8;
        overflow: hidden;
      }
      .cert-adh-lateral {
        writing-mode: vertical-rl;
        text-orientation: mixed;
        font-size: 6px;
        font-weight: 800;
        letter-spacing: 0.12em;
        color: #3e2723;
        padding: 2mm 1mm;
        background: #efebe9;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .cert-adh-centro {
        flex: 1;
        min-width: 0;
        text-align: center;
        padding: 2mm 2mm 2.5mm;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .cert-adh-centro-logo { margin-bottom: 1mm; min-height: 14px; }
      .cert-adh-logo {
        max-height: 14px;
        max-width: 100px;
        object-fit: contain;
        display: block;
        margin: 0 auto;
      }
      .cert-adh-logo-fallback {
        font-size: 6px;
        font-weight: 700;
        color: #1a3d16;
        line-height: 1.2;
        max-width: 90px;
        margin: 0 auto;
      }
      @media screen {
        .cert-adhesivo-holo, .cert-adhesivo-marco { width: auto; }
        .cert-adhesivos-fila { flex-wrap: wrap; }
      }
      @media print {
        @page { size: A4; margin: 12mm; }
        body { background: #fff; }
        .cert-wrap { padding: 0 8px; max-width: none; }
        .cert-adhesivos-fila { gap: 4mm; }
        .cert-adhesivo-holo, .cert-adhesivo-marco {
          width: 90mm;
          flex: 0 0 90mm;
        }
        .cert-adh-qr { width: 24mm !important; height: 24mm !important; }
      }
    `;
  }
}
