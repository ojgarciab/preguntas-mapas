# Plan de Desarrollo: Aplicación de Preguntas de Mapas

## 1. Visión General
Este documento detalla el plan de implementación para la aplicación web de mapas descrita en `Requisitos.md`. El objetivo es crear una aplicación interactiva, responsiva y que funcione completamente sin conexión para realizar preguntas sobre mapas políticos y físicos.

**Stack Tecnológico:**
- **Framework:** Angular (versión más reciente).
- **Estilos:** SCSS (Sass) con un diseño responsivo utilizando Flexbox/Grid y Media Queries.
- **Gráficos:** SVG (Scalable Vector Graphics) para garantizar el correcto escalado de los mapas y coordenadas.
- **PWA (Progressive Web App):** Service Workers de Angular (`@angular/pwa`) para cacheo de assets (mapas, JSON) y funcionamiento offline.
- **Gestión de Estado:** Angular Signals para un flujo de datos reactivo y ligero.

---

## 2. Fases de Desarrollo

### Fase 1: Inicialización del Proyecto y Arquitectura Base
1. Generar el proyecto Angular con enrutamiento y SCSS.
2. Instalar y configurar `@angular/pwa` para habilitar el soporte offline.
3. Configurar el archivo `ngsw-config.json` para asegurar que los archivos JSON y los mapas SVG se guarden en caché.
4. Establecer la estructura de directorios:
   - `src/app/componentes/` (UI de la aplicación)
   - `src/app/servicios/` (Lógica de negocio y carga de datos)
   - `src/app/modelos/` (Interfaces TypeScript)
   - `src/assets/datos/` (Archivos JSON de exámenes)
   - `src/assets/mapas/` (Imágenes SVG/PNG)

### Fase 2: Modelado de Datos y Servicios
1. **Modelos (TypeScript):** Crear interfaces que reflejen exactamente la estructura del JSON.
   - `ExamenDefinicion`, `TipoExamen`, `SubExamen`, `RespuestaOpciones`, `RespuestaPulsar`, `Coordenada`, `Circulo`.
2. **Servicio de Exámenes (`ExamenesService`):**
   - Método para cargar el índice de exámenes disponibles.
   - Método para cargar el JSON específico de un examen (ej. `europa-politico.json`) mediante `HttpClient`.
3. **Servicio de Estado (`EstadoExamenService`):**
   - Almacenar el examen seleccionado.
   - Guardar el conteo de preguntas de cada subexamen.
   - Registrar las respuestas del usuario durante la prueba.

### Fase 3: Pantalla de Configuración Inicial (Selección de Examen)
1. **Componente de Selección:**
   - Listar todos los exámenes disponibles.
   - Al elegir uno, mostrar sus subexámenes (ej. Países, Capitales).
2. **Controles de Configuración:**
   - Botones generales: **"Todos"** y **"Ninguno"** para ajustar rápidamente.
   - Por cada subexamen: Botones **"0"**, **"-"**, **"+"**, **"max"** y un `<input type="number">`.
   - Lógica para asegurar que el input manual no supere el máximo de preguntas disponibles en ese subexamen.
3. **Resumen:** Mostrar reactivamente la suma total de preguntas seleccionadas antes de pulsar "Comenzar Examen".

### Fase 4: Visualización e Interacción con el Mapa (SVG)
1. **Componente del Visor de Mapa:**
   - Cargar el SVG correspondiente. Se recomienda usar inyección inline o un `<object>` manejado con ViewChild para poder detectar eventos sobre elementos del mapa, o utilizar una capa transparente (canvas/SVG invisible) superpuesta al mapa para gestionar los clics.
   - Escalar dinámicamente usando el atributo `viewBox` del SVG para que sea responsive.
2. **Detección de Interacción (Tipo "pulsar"):**
   - Trasladar las coordenadas del clic (en píxeles de pantalla) a las coordenadas del viewBox del SVG.
   - **Capitales (círculos):** Calcular la distancia Euclidiana entre el clic y la coordenada central `{x, y}`, comprobando si es menor o igual al radio `{r}`.
   - **Países (polígonos):** Implementar un algoritmo de "Point in Polygon" (Ray casting) para comprobar si la coordenada del clic cae dentro de la lista de puntos `{x, y}` suministrada en el JSON.

### Fase 5: Ejecución del Examen (UI Principal)
1. **Encabezado y Estado:**
   - Mostrar el nombre del examen.
   - Contador de "Respondidas / Total".
2. **Barra de Navegación:**
   - Botones fijos: **"<<"** (Inicio), **"<"** (Anterior), **">"** (Siguiente), **">>"** (Fin), **"Terminar"**.
   - Carrusel central mostrando el número de la pregunta actual resaltado, flanqueado por las preguntas inmediatamente anteriores y posteriores.
   - Indicador visual (ej. código de colores o iconos) en los números para diferenciar preguntas respondidas de no respondidas.
3. **Área de Pregunta:**
   - **Tipo "opciones":** Mostrar la pregunta en texto ("¿Qué país es éste?") e iluminar el país en el mapa, o dar el nombre del país y mostrar 4 opciones de respuesta a la derecha (horizontal) o debajo (vertical).
   - **Tipo "pulsar":** Mostrar texto ("Localiza España") y esperar clic en el mapa. Al hacer clic, marcar el punto visualmente para confirmar la respuesta almacenada hasta el final.

### Fase 6: Resultados y Revisión
1. **Pantalla de Resumen:**
   - Calcular el porcentaje total de aciertos.
   - Mostrar el porcentaje en tamaño grande con un color dinámico calculado mediante una escala de gradiente (Verde = >90%, Amarillo = ~60%, Rojo = <40%).
   - Generar tabla de estadísticas separadas por examen y subexamen.
2. **Modo Revisión:**
   - Reutilizar el componente del examen pero en modo "solo lectura".
   - **Pulsar:** Mostrar en el mapa el punto donde clicó el usuario (en rojo si falló) y resaltar el área correcta real (polígono o círculo en verde).
   - **Opciones:** Resaltar la respuesta correcta seleccionada. Si el usuario se equivocó, mostrar su elección en rojo y la correcta en verde.

### Fase 7: Creación de Datos de Prueba
- Desarrollar `europa-politico.json` (Capitales y Países) y `europa-fisico.json` (Montañas, Ríos).
- Generar o adaptar SVGs de Europa político y físico, asegurando que las coordenadas del JSON coincidan con su mapeo en `viewBox`.

---

## 3. Consideraciones Técnicas Clave
- **Responsive Design:** Obligatorio el uso de Media Queries para alterar el diseño de las preguntas tipo "opciones" (panel lateral en pantallas anchas, panel inferior en móviles).
- **Idioma:** Variables, métodos, comentarios y textos visibles estarán estricta e íntegramente en castellano.
- **Offline First:** Gracias al Service Worker, al intentar recargar la página sin internet, el cascarón de Angular y los JSON/SVG cacheados permitirán la ejecución normal del juego. La comprobación de actualizaciones de los JSON se hará silenciosamente en segundo plano cuando haya conexión.
