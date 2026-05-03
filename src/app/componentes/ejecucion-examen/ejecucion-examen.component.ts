import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstadoExamenService } from '../../servicios/estado-examen.servicio';
import { Router } from '@angular/router';
import { VisorMapaComponent } from '../visor-mapa/visor-mapa.component';
import { Coordenada } from '../../modelos/examen.modelo';

@Component({
  selector: 'app-ejecucion-examen',
  standalone: true,
  imports: [CommonModule, VisorMapaComponent],
  templateUrl: './ejecucion-examen.component.html',
  styleUrl: './ejecucion-examen.component.scss'
})
export class EjecucionExamenComponent {
  estadoService = inject(EstadoExamenService);
  private router = inject(Router);

  preguntasVisibles = computed(() => {
    const idx = this.estadoService.preguntaActualIndex();
    const total = this.estadoService.totalPreguntas();
    // Mostrar hasta 5 preguntas en la barra de navegación
    const indices = [];
    const inicio = Math.max(0, idx - 2);
    const fin = Math.min(total - 1, idx + 2);
    for (let i = inicio; i <= fin; i++) {
      indices.push(i);
    }
    return indices;
  });

  getRespuestaPreviaCoord(resp?: string): Coordenada | undefined {
    if (!resp) return undefined;
    try {
      return JSON.parse(resp) as Coordenada;
    } catch {
      return undefined;
    }
  }

  responderOpcion(opcion: string) {
    const p = this.estadoService.preguntaActual();
    if (!p) return;
    const esCorrecta = opcion === p.respuestaCorrecta;
    this.estadoService.registrarRespuesta(p.id, opcion, esCorrecta);
  }

  onMapaClick(res: { punto: Coordenada, esCorrecto: boolean }) {
    const p = this.estadoService.preguntaActual();
    if (!p) return;
    this.estadoService.registrarRespuesta(p.id, JSON.stringify(res.punto), res.esCorrecto);
  }

  terminar() {
    this.estadoService.terminarExamen();
    this.router.navigate(['/resultados']);
  }

  irAInicio() { this.estadoService.irAPregunta(0); }
  irAFin() { this.estadoService.irAPregunta(this.estadoService.totalPreguntas() - 1); }
  anterior() { this.estadoService.irAPregunta(this.estadoService.preguntaActualIndex() - 1); }
  siguiente() { this.estadoService.irAPregunta(this.estadoService.preguntaActualIndex() + 1); }
}
