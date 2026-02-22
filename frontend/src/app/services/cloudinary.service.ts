import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CloudinaryResponse {
  url: string;
  publicId: string;
}

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private apiUrl = 'http://localhost:8080/api/upload';

  constructor(private http: HttpClient) {}


   //Subir imagen a Cloudinary
   //El parametro file es el Archivo de imagen
   // folder es la Carpeta en Cloudinary ('empresas', 'vehiculos', 'propietarios', 'marcas')
  uploadImage(file: File, folder: string = 'general'): Observable<CloudinaryResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<CloudinaryResponse>(
      `${this.apiUrl}/image?folder=${folder}`,
      formData
    );
  }


   //Subir PDF a Cloudinary
   //file Archivo PDF
   //folder Carpeta en Cloudinary

  uploadPdf(file: File, folder: string = 'documentos'): Observable<CloudinaryResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<CloudinaryResponse>(
      `${this.apiUrl}/pdf?folder=${folder}`,
      formData
    );
  }


   //Eliminar archivo de Cloudinary
   // el parametro publicId es el public_id retornado al subir (ej: "rtv/empresas/abc123")
  deleteFile(publicId: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}?publicId=${encodeURIComponent(publicId)}`
    );
  }


   // Obtener URL optimizada de Cloudinary con transformaciones
   //Útil para redimensionar imágenes on-the-fly

  getOptimizedUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      crop?: 'fill' | 'fit' | 'scale' | 'thumb';
      quality?: 'auto' | number;
      format?: 'auto' | 'webp' | 'jpg' | 'png';
    } = {}
  ): string {
    const {
      width = 400,
      height,
      crop = 'fill',
      quality = 'auto',
      format = 'auto'
    } = options;


    const cloudName = 'dslyznfyx';

    let transformation = `c_${crop},q_${quality},f_${format}`;
    if (width) transformation += `,w_${width}`;
    if (height) transformation += `,h_${height}`;

    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}/${publicId}`;
  }

   // Extraer publicId de una URL de Cloudinary
   // Para eliminar imágenes

  extractPublicId(cloudinaryUrl: string): string | null {
    const match = cloudinaryUrl.match(/\/v\d+\/(.+)\.\w+$/);
    return match ? match[1] : null;
  }
}
