export interface Coordenada {
  x: number;
  y: number;
}

export interface Circulo extends Coordenada {
  r?: number;
}

export type AreaRespuesta = Coordenada[] | Circulo;

export interface DefinicionRespuesta {
  tipo: 'opciones' | 'pulsar';
  numero?: number;
}

export interface Examen {
  nombre: string;
  pregunta: string;
  respuesta: DefinicionRespuesta;
}

export interface CategoriaExamen {
  mapa: string;
  examenes: Examen[];
  respuestas: { [clave: string]: AreaRespuesta };
}

export interface ExamenCompleto {
  nombre: string;
  descripcion: string;
  tipos: { [tipo: string]: CategoriaExamen };
}

export interface EstadoPregunta {
  id: number;
  tipo: string;
  subExamenNombre: string;
  preguntaTexto: string;
  tipoRespuesta: 'opciones' | 'pulsar';
  opciones?: string[];
  respuestaCorrecta: string;
  respuestaUsuario?: string;
  respondida: boolean;
  esCorrecta?: boolean;
  mapa: string;
  areaRespuesta: AreaRespuesta;
}

export interface ResultadoExamen {
  totalPreguntas: number;
  aciertos: number;
  porcentaje: number;
  estadisticasPorTipo: { [tipo: string]: { total: number; aciertos: number } };
}
