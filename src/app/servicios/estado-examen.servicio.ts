import { Injectable, signal, computed } from '@angular/core';
import { EstadoPregunta, ResultadoExamen } from '../modelos/examen.modelo';

@Injectable({
  providedIn: 'root'
})
export class EstadoExamenService {
  preguntas = signal<EstadoPregunta[]>([]);
  preguntaActualIndex = signal<number>(0);
  examenFinalizado = signal<boolean>(false);

  preguntaActual = computed(() => this.preguntas()[this.preguntaActualIndex()]);
  
  totalPreguntas = computed(() => this.preguntas().length);
  respondidas = computed(() => this.preguntas().filter(p => p.respondida).length);
  
  resultados = computed((): ResultadoExamen => {
    const total = this.totalPreguntas();
    const aciertos = this.preguntas().filter(p => p.esCorrecta).length;
    const porcentaje = total > 0 ? (aciertos / total) * 100 : 0;
    
    const estadisticas: { [tipo: string]: { total: number; aciertos: number } } = {};
    this.preguntas().forEach(p => {
      if (!estadisticas[p.subExamenNombre]) {
        estadisticas[p.subExamenNombre] = { total: 0, aciertos: 0 };
      }
      estadisticas[p.subExamenNombre].total++;
      if (p.esCorrecta) estadisticas[p.subExamenNombre].aciertos++;
    });

    return {
      totalPreguntas: total,
      aciertos,
      porcentaje,
      estadisticasPorTipo: estadisticas
    };
  });

  iniciarExamen(preguntas: EstadoPregunta[]) {
    this.preguntas.set(preguntas);
    this.preguntaActualIndex.set(0);
    this.examenFinalizado.set(false);
  }

  registrarRespuesta(id: number, respuesta: string, esCorrecta: boolean) {
    this.preguntas.update(prev => prev.map(p => 
      p.id === id ? { ...p, respuestaUsuario: respuesta, respondida: true, esCorrecta } : p
    ));
  }

  irAPregunta(index: number) {
    if (index >= 0 && index < this.totalPreguntas()) {
      this.preguntaActualIndex.set(index);
    }
  }

  terminarExamen() {
    this.examenFinalizado.set(true);
  }

  reiniciar() {
    this.preguntas.set([]);
    this.preguntaActualIndex.set(0);
    this.examenFinalizado.set(false);
  }
}
