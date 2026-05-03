# Plan de Desarrollo: Aplicación de Preguntas de Mapas

Este documento detalla el plan de implementación para la aplicación web de mapas definida en `Requisitos.md`. La aplicación se desarrollará utilizando Angular, con soporte offline (PWA), y todo el código y comentarios estarán en castellano.

## User Review Required
> [!IMPORTANT]
> - **Tecnología de Mapas:** Se asume el uso de SVG como principal formato gráfico para permitir el escalado y detección de clics precisos. ¿Es aceptable incrustar los SVG directamente en el DOM para poder manipularlos con Angular, o prefieres cargarlos externamente y calcular interacciones mediante capas invisibles (canvas)?
> - **Gestión del Estado:** Dada la complejidad del examen (selección, progreso, respuestas, revisión), ¿se debe usar una librería de gestión de estado como NgRx, o bastaría con servicios (Signals/RxJS) integrados en Angular? (Se propone usar Angular Signals por simplicidad y modernidad).
> - **Generación del archivo:** Una vez apruebes este plan, crearé el archivo `Plan.md` en el repositorio con este contenido.

## Open Questions
> [!NOTE]
> - ¿Dónde se alojarán los archivos JSON y los SVG (en los assets de la propia aplicación o en un backend externo)? Por ahora asumiremos que estarán en `src/assets/`.
> - Para las áreas de respuesta (`pulsar`), las coordenadas del JSON de ejemplo muestran una lista de puntos `{x, y}` para países (polígonos) y `{x, y, r}` para capitales (círculos). Se implementará lógica matemática para detectar clics dentro de estos polígonos y círculos basándonos en las coordenadas nativas del SVG.

## Proposed Changes

### 1. Inicialización y Configuración Base
- Crear proyecto Angular con enrutamiento y estilos (SCSS).
- Añadir soporte PWA (`@angular/pwa`) para modo sin conexión y actualización automática en segundo plano (Service Workers).
- Configurar la estructura de carpetas (`componentes`, `servicios`, `modelos`, `activos`).

#### [NEW] Plan.md
**(Este archivo se generará en el repositorio con todo el detalle de este plan de desarrollo).**

---

### 2. Modelado de Datos y Servicios
- Definir las interfaces TypeScript en castellano correspondientes a la estructura del JSON (`ExamenCompleto`, `TipoExamen`, `SubExamen`, `Respuesta`, etc.).
- Crear `ServicioExamenes` (ExamenesService) para cargar los archivos JSON y gestionar los datos.
- Crear `ServicioEstadoExamen` (ExamenStateService) para mantener el estado del examen en curso (preguntas seleccionadas, respuestas dadas, tiempo, etc.).

---

### 3. Pantalla de Configuración de Examen (Inicio)
- Crear el componente para listar los exámenes disponibles.
- Interfaz para mostrar los subexámenes y controles numéricos (botones de "0", "-", "+", "max" y campo manual).
- Botones generales de "Todos" y "Ninguno".
- Cálculo reactivo del total de preguntas seleccionadas.

---

### 4. Motor de Renderizado e Interacción de Mapas
- Componente especializado en cargar y mostrar el SVG, adaptándolo al tamaño de la pantalla (viewBox).
- Lógica para traducir las coordenadas de un clic o toque en pantalla a coordenadas nativas del SVG para verificar respuestas del tipo `pulsar`.
- Algoritmo de *Point in Polygon* (Ray casting) para áreas de países y fórmula de distancia para radios de capitales.

---

### 5. Interfaz de Ejecución del Examen
- Componente principal del examen que une el visor de mapa, el encabezado y los controles.
- Barra de navegación inferior/superior con botones ("<<", "<", ">", ">>", "Terminar").
- Carrusel central de números de pregunta, con indicación de estado (respondida/no respondida, pregunta actual).
- Panel de opciones para preguntas tipo `opciones` (diseño responsive: derecha en horizontal, debajo en vertical mediante media queries).

---

### 6. Pantalla de Resultados y Revisión
- Componente que se muestra al "Terminar".
- Cálculo del porcentaje de aciertos y directiva o pipe para asignar el gradiente de color (verde a rojo).
- Desglose estadístico por subexamen.
- Modo "Revisión" que reutiliza el componente de ejecución pero en modo sólo lectura, mostrando la respuesta correcta (polígono iluminado o marcador en el mapa para `pulsar`, o clase CSS destacada para `opciones`).

---

### 7. Datos de Ejemplo
- Generar y almacenar los JSON de prueba solicitados.

## Verification Plan

### Automated Tests
- Ejecutar pruebas unitarias para el algoritmo de detección de colisiones (clic dentro de polígono / radio).
- Pruebas para los cálculos del número de preguntas y puntuación final.
- `ng test` para los servicios y funciones matemáticas puras.

### Manual Verification
- Cargar la aplicación y configurar una prueba con diferentes números de subexámenes.
- Intervenir en el flujo del examen: probar saltos de preguntas usando la navegación rápida y botones siguiente/anterior.
- Probar funcionalidad offline (parando el servidor de red desde las DevTools del navegador) para verificar que el PWA y Service Worker cachean el SVG y el JSON.
- Terminar un examen y verificar que el código de colores de los resultados se aplica correctamente en función de la puntuación (ej. fallar todas aposta, acertar todas aposta).
- Revisar que la interfaz sea responsiva en modo vertical y horizontal.
