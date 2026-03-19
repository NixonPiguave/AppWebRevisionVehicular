import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../notification.service';
import { forkJoin } from 'rxjs';

export interface CertImprontaData {
  empresa?: { nombre?: string; logoempresa?: string };
  propietario?: { nombre?: string; documento?: string };
  vehiculo?: {
    placa?: string;
    marca?: string;
    modelo?: string;
    color?: string;
    anio?: number;
    chasis?: string;
    motor?: string;
    centroRtv?: string;
  };
  fechaEmision?: string;
  fechaRegistroImpronta?: string;
  improntaChasisTipo?: string;
  improntaMotorTipo?: string;
}

export interface CertMatriculaData {
  empresa?: { nombre?: string; logoempresa?: string };
  propietario?: { nombre?: string; documento?: string };
  vehiculo?: {
    placaActual?: string;
    placaAnterior?: string;
    matriculaVehicular?: string;
    marca?: string;
    modelo?: string;
    anio?: number;
    color?: string;
    chasis?: string;
    motor?: string;
    tipoServicio?: string;
    clase?: string;
  };
  fechaEmision?: string;
}

const API_TURNOS = 'http://localhost:8080/api/turnos';

@Injectable({ providedIn: 'root' })
export class CertificadosRegistroService {
  private overlayEl: HTMLElement | null = null;

  constructor(private http: HttpClient, private notification: NotificationService) {}

  mostrarParaTurno(turnoId: number, onImpreso?: () => void): void {
    this.destruir();
    forkJoin({
      impronta: this.http.get<CertImprontaData>(`${API_TURNOS}/${turnoId}/certificado-impronta`),
      matricula: this.http.get<CertMatriculaData>(`${API_TURNOS}/${turnoId}/certificado-matricula`)
    }).subscribe({
      next: ({ impronta, matricula }) => {
        const overlay = document.createElement('div');
        overlay.id = 'cert-registro-overlay';
        overlay.innerHTML = this.renderOverlay(impronta, matricula);
        document.body.appendChild(overlay);
        this.overlayEl = overlay;

        overlay.addEventListener('click', (e) => {
          if ((e.target as HTMLElement).id === 'cert-registro-overlay') this.destruir();
        });
        overlay.querySelector('#cert-reg-btn-cerrar')?.addEventListener('click', () => this.destruir());
        overlay.querySelector('#cert-reg-btn-impronta')?.addEventListener('click', () => this.imprimirImpronta(impronta));
        overlay.querySelector('#cert-reg-btn-matricula')?.addEventListener('click', () => this.imprimirMatricula(matricula));
        overlay.querySelector('#cert-reg-btn-ambos')?.addEventListener('click', () => {
          this.imprimirImpronta(impronta);
          setTimeout(() => this.imprimirMatricula(matricula), 350);
          this.destruir();
          onImpreso?.();
        });
      },
      error: () => this.notification.error('No se pudieron cargar los certificados.')
    });
  }

  // Para menú Improntas (no tenemos turnoId). Abrimos el certificado de impronta “ligado” al vehículo.
  mostrarImprontaPorVehiculoId(vehiculoId: number): void {
    this.destruir();
    this.http.get<CertImprontaData>(`${API_TURNOS}/vehiculos/${vehiculoId}/certificado-impronta`).subscribe({
      next: (data) => this.imprimirImpronta(data),
      error: () => this.notification.error('No se pudo generar el certificado de impronta.')
    });
  }

  private destruir(): void {
    this.overlayEl?.remove();
    this.overlayEl = null;
  }

  private imprimirImpronta(data: CertImprontaData): void {
    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
    <title>Certificado de Impronta</title><style>${this.estilos()}</style></head>
    <body onload="window.focus(); window.print();">
    <script>window.addEventListener('afterprint', function fn(){window.removeEventListener('afterprint', fn); window.close();});</script>
    ${this.renderImpronta(data)}
    </body></html>`;
    const win = window.open('', '_blank', 'width=900,height=900,scrollbars=yes');
    if (!win) { this.notification.warn('Permite ventanas emergentes para imprimir.'); return; }
    win.document.write(html);
    win.document.close();
  }

  private imprimirMatricula(data: CertMatriculaData): void {
    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
    <title>Matrícula Vehicular</title><style>${this.estilos()}</style></head>
    <body onload="window.focus(); window.print();">
    <script>window.addEventListener('afterprint', function fn(){window.removeEventListener('afterprint', fn); window.close();});</script>
    ${this.renderMatricula(data)}
    </body></html>`;
    const win = window.open('', '_blank', 'width=900,height=900,scrollbars=yes');
    if (!win) { this.notification.warn('Permite ventanas emergentes para imprimir.'); return; }
    win.document.write(html);
    win.document.close();
  }

  private renderOverlay(impronta: CertImprontaData, matricula: CertMatriculaData): string {
    return `
      <style>
        #cert-registro-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:9999}
        #cert-registro-modal{background:#fff;border-radius:10px;width:820px;max-height:92vh;overflow:auto;box-shadow:0 24px 64px rgba(0,0,0,.35);font-family:Inter,system-ui,sans-serif}
        .cert-reg-actions{display:flex;justify-content:flex-end;gap:10px;padding:12px 16px;border-top:1px solid #eee;background:#fafafa}
        .cert-reg-actions button{border:none;border-radius:10px;padding:10px 14px;font-weight:700;cursor:pointer;display:flex;gap:6px;align-items:center}
        #cert-reg-btn-ambos{background:#1a3d16;color:#fff}
        #cert-reg-btn-impronta{background:#ff7a00;color:#fff}
        #cert-reg-btn-matricula{background:#2b4dff;color:#fff}
        #cert-reg-btn-cerrar{background:#e9e9e9;color:#333}
        .preview{padding:14px 16px}
        .preview h3{margin:0 0 8px 0;font-size:14px}
        .mini{border:1px dashed #ddd;border-radius:10px;padding:12px}
      </style>
      <div id="cert-registro-modal">
        <div class="preview">
          <h3>Vista previa</h3>
          <div class="mini">
            <div><b>Impronta</b>: ${this.escape(impronta?.vehiculo?.placa ?? '-')} - ${this.escape(impronta?.propietario?.nombre ?? '-')}</div>
            <div><b>Matrícula</b>: ${this.escape(matricula?.vehiculo?.placaActual ?? '-')} - ${this.escape(matricula?.vehiculo?.matriculaVehicular ?? '-')}</div>
          </div>
        </div>
        <div class="cert-reg-actions">
          <button id="cert-reg-btn-cerrar">Cerrar</button>
          <button id="cert-reg-btn-impronta">Impronta</button>
          <button id="cert-reg-btn-matricula">Matrícula</button>
          <button id="cert-reg-btn-ambos">Imprimir ambos</button>
        </div>
      </div>
    `;
  }

  private renderImpronta(d: CertImprontaData): string {
    const v = d.vehiculo ?? {};
    const p = d.propietario ?? {};
    const fecha = d.fechaEmision ? new Date(d.fechaEmision + 'T00:00:00').toLocaleDateString('es-EC') : new Date().toLocaleDateString('es-EC');
    return `
      <div class="doc">
        <div class="doc-head">
          <div class="doc-left">
            <div class="doc-title">CERTIFICADO DE IMPRONTA VEHICULAR</div>
            <div class="doc-sub">Fecha: ${this.escape(fecha)}</div>
          </div>
          <div class="doc-right">
            ${d.empresa?.logoempresa ? `<img class="logo" src="${d.empresa.logoempresa}" onerror="this.style.display='none'"/>` : ''}
            <div class="org">${this.escape(d.empresa?.nombre ?? 'RTV')}</div>
          </div>
        </div>

        <div class="box">
          <div class="row2">
            <div><span class="lbl">PLACA:</span> ${this.escape(v.placa ?? '-')}</div>
            <div><span class="lbl">CENTRO RTV:</span> ${this.escape(v.centroRtv ?? d.empresa?.nombre ?? '-')}</div>
          </div>
          <div class="row2">
            <div><span class="lbl">MARCA:</span> ${this.escape(v.marca ?? '-')}</div>
            <div><span class="lbl">COLOR:</span> ${this.escape(v.color ?? '-')}</div>
          </div>
          <div class="row2">
            <div><span class="lbl">MODELO:</span> ${this.escape(v.modelo ?? '-')}</div>
            <div><span class="lbl">AÑO:</span> ${this.escape(String(v.anio ?? ''))}</div>
          </div>
          <div class="row2">
            <div><span class="lbl">PROPIETARIO:</span> ${this.escape(p.nombre ?? '-')}</div>
            <div><span class="lbl">DOC:</span> ${this.escape(p.documento ?? '-')}</div>
          </div>
        </div>

        <div class="bar">
          <div class="bar-cell">FÍSICA</div>
          <div class="bar-cell">OCULAR</div>
          <div class="bar-cell">INACCESIBLE</div>
        </div>

        <div class="sec">
          <div class="sec-title">CHASIS</div>
          <div class="sec-body">
            <div class="tag">${this.escape((d.improntaChasisTipo ?? '-').toUpperCase())}</div>
            <div class="value">${this.escape(v.chasis ?? '')}</div>
          </div>
        </div>

        <div class="sec">
          <div class="sec-title">MOTOR</div>
          <div class="sec-body">
            <div class="tag">${this.escape((d.improntaMotorTipo ?? '-').toUpperCase())}</div>
            <div class="value">${this.escape(v.motor ?? '')}</div>
          </div>
        </div>

        <div class="foot">
          <div class="sign">
            <div class="sign-title">IMPRONTERO</div>
            <div class="sign-line">FIRMA Y SELLO</div>
          </div>
          <div class="sign">
            <div class="sign-title">JEFE DE MATRICULACIÓN</div>
            <div class="sign-line">FIRMA Y SELLO</div>
          </div>
        </div>
      </div>
    `;
  }

  private renderMatricula(d: CertMatriculaData): string {
    const v = d.vehiculo ?? {};
    const p = d.propietario ?? {};
    const fecha = d.fechaEmision ? new Date(d.fechaEmision + 'T00:00:00').toLocaleDateString('es-EC') : new Date().toLocaleDateString('es-EC');
    return `
      <div class="doc doc-mat">
        <div class="doc-head">
          <div class="doc-left">
            <div class="doc-title-sm">REPÚBLICA DEL ECUADOR</div>
            <div class="doc-title">MATRÍCULA VEHICULAR</div>
            <div class="doc-sub">Nro: ${this.escape(v.matriculaVehicular ?? '-')} - Fecha: ${this.escape(fecha)}</div>
          </div>
          <div class="doc-right">
            ${d.empresa?.logoempresa ? `<img class="logo" src="${d.empresa.logoempresa}" onerror="this.style.display='none'"/>` : ''}
            <div class="org">${this.escape(d.empresa?.nombre ?? 'RTV')}</div>
          </div>
        </div>

        <table class="mat-table">
          <tr>
            <th>PLACA ACTUAL</th>
            <th>PLACA ANTERIOR</th>
            <th>FECHA MATRÍCULA</th>
          </tr>
          <tr>
            <td>${this.escape(v.placaActual ?? '-')}</td>
            <td>${this.escape(v.placaAnterior ?? v.placaActual ?? '-')}</td>
            <td>${this.escape(fecha)}</td>
          </tr>

          <tr>
            <th>MARCA</th>
            <th>CLASE</th>
            <th>TIPO</th>
          </tr>
          <tr>
            <td>${this.escape(v.marca ?? '-')}</td>
            <td>${this.escape(v.clase ?? '-')}</td>
            <td>${this.escape(v.tipoServicio ?? '-')}</td>
          </tr>

          <tr>
            <th>AÑO FAB</th>
            <th>MODELO</th>
            <th>COLOR</th>
          </tr>
          <tr>
            <td>${this.escape(String(v.anio ?? '-'))}</td>
            <td>${this.escape(v.modelo ?? '-')}</td>
            <td>${this.escape(v.color ?? '-')}</td>
          </tr>

          <tr>
            <th>MOTOR</th>
            <th colspan="2">CHASIS</th>
          </tr>
          <tr>
            <td>${this.escape(v.motor ?? '-')}</td>
            <td colspan="2">${this.escape(v.chasis ?? '-')}</td>
          </tr>

          <tr>
            <th>PROPIETARIO</th>
            <th>DOCUMENTO</th>
            <th>OBSERVACIONES</th>
          </tr>
          <tr>
            <td>${this.escape(p.nombre ?? '-')}</td>
            <td>${this.escape(p.documento ?? '-')}</td>
            <td>SIN GRAVAMEN</td>
          </tr>
        </table>
      </div>
    `;
  }

  private estilos(): string {
    return `
      *{
        box-sizing:border-box;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      body{font-family:Inter,system-ui,sans-serif;color:#111;margin:0;padding:18px;background:#fff}
      :root{
        --sys-green:#2f6b2f;
        --sys-green-dark:#1f4f1f;
        --sys-green-soft:#eaf4ea;
      }
      .doc{border:2px solid var(--sys-green-dark); padding:14px}
      .doc-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:10px}
      .doc-title{font-weight:900;font-size:18px;letter-spacing:.5px;color:var(--sys-green-dark)}
      .doc-title-sm{font-weight:800;font-size:13px;color:var(--sys-green-dark)}
      .doc-sub{font-size:12px;color:#333;margin-top:4px}
      .doc-right{text-align:right}
      .logo{height:40px;object-fit:contain;margin-bottom:4px}
      .org{font-size:12px;font-weight:700;color:var(--sys-green-dark)}
      .box{border:1px solid var(--sys-green-dark);padding:10px;margin:8px 0}
      .row2{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:6px 0;font-size:12px}
      .lbl{font-weight:800}
      .bar{display:grid;grid-template-columns:1fr 1fr 1fr;margin-top:10px}
      .bar-cell{background:var(--sys-green);color:#fff;text-align:center;font-weight:800;padding:6px 0;border:1px solid var(--sys-green-dark)}
      .sec{border:1px solid var(--sys-green-dark);margin-top:10px}
      .sec-title{background:var(--sys-green);color:#fff;font-weight:900;padding:6px 10px;border-bottom:1px solid var(--sys-green-dark)}
      .sec-body{display:flex;gap:10px;align-items:center;padding:10px}
      .tag{
        min-width:120px;border:1px solid var(--sys-green-dark);padding:8px 10px;
        font-weight:900;text-align:center;color:#fff;background:var(--sys-green) !important
      }
      .value{flex:1;border:1px dashed #aaa;padding:8px 10px;min-height:34px}
      .foot{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px}
      .sign{border-top:2px solid var(--sys-green-dark);padding-top:10px}
      .sign-title{background:var(--sys-green);color:#fff;font-weight:900;padding:6px 10px;border:1px solid var(--sys-green-dark)}
      .sign-line{padding:10px 10px;font-size:12px}

      .doc-mat { border-color:var(--sys-green-dark); }
      .mat-table{width:100%;border-collapse:collapse;margin-top:8px;font-size:12px}
      .mat-table th{
        background:var(--sys-green);color:#fff;text-align:left;padding:6px 8px;
        border:1px solid var(--sys-green-dark);font-weight:800
      }
      .mat-table td{
        background:#fff;padding:7px 8px;border:1px solid #b8c6b7;color:#1d1d1d
      }

      @media print {
        .tag, .bar-cell, .sec-title, .sign-title, .mat-table th {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `;
  }

  private escape(s: string): string {
    const div = document.createElement('div');
    div.textContent = s ?? '';
    return div.innerHTML;
  }
}

