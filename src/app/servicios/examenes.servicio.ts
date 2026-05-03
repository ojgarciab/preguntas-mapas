import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ExamenCompleto } from '../modelos/examen.modelo';

@Injectable({
  providedIn: 'root'
})
export class ExamenesService {
  private http = inject(HttpClient);

  obtenerExamenesDisponibles(): Observable<{ id: string, nombre: string }[]> {
    // Por ahora devolvemos los dos solicitados de ejemplo
    return of([
      { id: 'europa-politico', nombre: 'Mapa político de Europa' },
      { id: 'europa-fisico', nombre: 'Mapa físico de Europa' }
    ]);
  }

  cargarExamen(id: string): Observable<ExamenCompleto> {
    return this.http.get<ExamenCompleto>(`./datos/${id}.json`);
  }
}
