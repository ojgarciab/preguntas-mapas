import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe, KeyValuePipe, NgFor, NgIf } from '@angular/common';
import { EstadoExamenService } from '../../servicios/estado-examen.servicio';
import { Router } from '@angular/router';
import { VisorMapaComponent } from '../visor-mapa/visor-mapa.component';
import { Coordenada } from '../../modelos/examen.modelo';

@Component({
  selector: 'app-resultados-examen',
  standalone: true,
  imports: [CommonModule, VisorMapaComponent, DecimalPipe, KeyValuePipe, NgFor, NgIf],
  templateUrl: './resultados-examen.component.html',
  styleUrl: './resultados-examen.component.scss'
})
export class ResultadosExamenComponent {
  estadoService = inject(EstadoExamenService);
  private router = inject(Router);

  modoRevision = signal<boolean>(false);
  preguntaRevisionIndex = signal<number>(0);

  preguntaActual = computed(() => {
    return this.estadoService.preguntas()[this.preguntaRevisionIndex()];
  });

  get colorResultado() {
    const p = this.estadoService.resultados().porcentaje;
    if (p >= 90) return '#22c55e'; // Verde
    if (p >= 70) return '#84cc16'; // Lima
    if (p >= 50) return '#eab308'; // Amarillo
    if (p >= 40) return '#f97316'; // Naranja
    return '#ef4444'; // Rojo
  }

  getRespuestaPreviaCoord(resp?: string): Coordenada | undefined {
    if (!resp) return undefined;
    try {
      return JSON.parse(resp) as Coordenada;
    } catch {
      return undefined;
    }
  }

  activarRevision() {
    this.modoRevision.set(true);
    this.preguntaRevisionIndex.set(0);
  }

  nuevaPrueba() {
    this.estadoService.reiniciar();
    this.router.navigate(['/']);
  }

  irAPregunta(idx: number) {
    this.preguntaRevisionIndex.set(idx);
  }

  anterior() {
    if (this.preguntaRevisionIndex() > 0) {
      this.preguntaRevisionIndex.update(i => i - 1);
    }
  }

  siguiente() {
    if (this.preguntaRevisionIndex() < this.estadoService.totalPreguntas() - 1) {
      this.preguntaRevisionIndex.update(i => i + 1);
    }
  }
}
