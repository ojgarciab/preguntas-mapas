import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, KeyValuePipe, TitleCasePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExamenesService } from '../../servicios/examenes.servicio';
import { EstadoExamenService } from '../../servicios/estado-examen.servicio';
import { Router } from '@angular/router';
import { ExamenCompleto, EstadoPregunta } from '../../modelos/examen.modelo';

@Component({
  selector: 'app-configuracion-examen',
  standalone: true,
  imports: [CommonModule, FormsModule, KeyValuePipe, TitleCasePipe, NgFor, NgIf],
  templateUrl: './configuracion-examen.component.html',
  styleUrl: './configuracion-examen.component.scss'
})
export class ConfiguracionExamenComponent {
  private examenesService = inject(ExamenesService);
  private estadoService = inject(EstadoExamenService);
  private router = inject(Router);

  examenesDisponibles = signal<{id: string, nombre: string}[]>([]);
  examenSeleccionado = signal<ExamenCompleto | null>(null);
  cantidades = signal<{[key: string]: number}>({});

  totalSeleccionado = computed(() => {
    return Object.values(this.cantidades()).reduce((acc, curr) => acc + curr, 0);
  });

  constructor() {
    this.examenesService.obtenerExamenesDisponibles().subscribe(exs => {
      this.examenesDisponibles.set(exs);
    });
  }

  seleccionarExamen(id: string) {
    this.examenesService.cargarExamen(id).subscribe(examen => {
      this.examenSeleccionado.set(examen);
      const inicial: {[key: string]: number} = {};
      Object.keys(examen.tipos).forEach(tipoKey => {
        examen.tipos[tipoKey].examenes.forEach((ex, idx) => {
          inicial[`${tipoKey}_${idx}`] = 0;
        });
      });
      this.cantidades.set(inicial);
    });
  }

  ajustarCantidad(key: string, delta: number, max: number) {
    this.cantidades.update(prev => {
      let val = (prev[key] || 0) + delta;
      if (val < 0) val = 0;
      if (val > max) val = max;
      return { ...prev, [key]: val };
    });
  }

  setCantidad(key: string, val: number, max: number) {
    let finalVal = Number(val);
    if (isNaN(finalVal) || finalVal < 0) finalVal = 0;
    if (finalVal > max) finalVal = max;
    this.cantidades.update(prev => ({ ...prev, [key]: finalVal }));
  }

  setTodos(modo: 'max' | 'cero') {
    const examen = this.examenSeleccionado();
    if (!examen) return;
    this.cantidades.update(prev => {
      const nuevo = { ...prev };
      Object.keys(examen.tipos).forEach(tipoKey => {
        const cat = examen.tipos[tipoKey];
        const numRespuestas = Object.keys(cat.respuestas).length;
        cat.examenes.forEach((ex, idx) => {
          nuevo[`${tipoKey}_${idx}`] = modo === 'max' ? numRespuestas : 0;
        });
      });
      return nuevo;
    });
  }

  getObjectLength(obj: any): number {
    return obj ? Object.keys(obj).length : 0;
  }

  comenzar() {
    const examen = this.examenSeleccionado();
    if (!examen || this.totalSeleccionado() === 0) return;

    const preguntas: EstadoPregunta[] = [];
    let idCounter = 0;

    Object.keys(examen.tipos).forEach(tipoKey => {
      const cat = examen.tipos[tipoKey];
      const respuestasKeys = Object.keys(cat.respuestas);

      cat.examenes.forEach((exDef, exIdx) => {
        const cant = this.cantidades()[`${tipoKey}_${exIdx}`];
        if (cant > 0) {
          const seleccionadas = [...respuestasKeys].sort(() => 0.5 - Math.random()).slice(0, cant);
          seleccionadas.forEach(respCorrecta => {
            const esOpciones = exDef.respuesta.tipo === 'opciones';
            let opciones: string[] | undefined;
            
            if (esOpciones) {
              const otras = respuestasKeys.filter(k => k !== respCorrecta);
              const distractores = otras.sort(() => 0.5 - Math.random()).slice(0, (exDef.respuesta.numero || 4) - 1);
              opciones = [respCorrecta, ...distractores].sort(() => 0.5 - Math.random());
            }

            preguntas.push({
              id: idCounter++,
              tipo: tipoKey,
              subExamenNombre: exDef.nombre,
              preguntaTexto: exDef.pregunta.includes('{}') ? exDef.pregunta.replace('{}', respCorrecta) : exDef.pregunta,
              tipoRespuesta: exDef.respuesta.tipo,
              opciones,
              respuestaCorrecta: respCorrecta,
              respondida: false,
              mapa: cat.mapa,
              areaRespuesta: cat.respuestas[respCorrecta]
            });
          });
        }
      });
    });

    if (preguntas.length > 0) {
      this.estadoService.iniciarExamen(preguntas.sort(() => 0.5 - Math.random()));
      this.router.navigate(['/examen']);
    }
  }
}
