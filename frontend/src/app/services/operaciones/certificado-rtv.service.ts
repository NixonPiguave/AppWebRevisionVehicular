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
  <title>Certificado RTV - ${this.escape(String(data.turno?.numeroTurno ?? data.numeroRevision ?? ''))}</title>
  <style>${this.estilosCertificado()}</style>
</head>
<body onload="window.focus(); window.print();">
  <script>window.addEventListener('afterprint', function fn() { window.removeEventListener('afterprint', fn); window.close(); });</script>
  <div class="cert-wrap">${this.renderCuerpo(data)}</div>
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
    const veh = data.vehiculo ?? {};
    const turno = data.turno ?? {};
    const iniciales = (emp.nombre ?? 'RTV').trim().substring(0, 2).toUpperCase() || 'RT';
    const logoHtml = (emp.logoempresa && emp.logoempresa.trim())
      ? `<div class="cert-logo-wrap"><img src="${emp.logoempresa}" alt="Logo" class="cert-logo" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
       <div class="cert-logo-text" style="display:none"><span class="cert-cr">${this.escape(iniciales)}</span><span class="cert-tvm">RTV</span></div></div>`
      : `<div class="cert-logo-wrap"><div class="cert-logo-text"><span class="cert-cr">${this.escape(iniciales)}</span><span class="cert-tvm">RTV</span></div></div>`;

    const marcaModeloAnio = [veh.marca, veh.modelo, veh.anio].filter(Boolean).join(', ');
    const chasisMotor = [veh.chasis, veh.motor].filter(Boolean).join(' / ') || '-';

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
      @media print {
        @page { size: A4; margin: 12mm; }
        body { background: #fff; }
        .cert-wrap { padding: 0 8px; max-width: none; }
      }
    `;
  }
}
