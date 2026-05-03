# Objetivo
Hacer una página web para hacer preguntas sobre mapas políticos o físicos.

Será una aplicación web que correrá completamente en el navegador, modular, usando Angular.io con rutas y soporte para jugarlo completamente offline (sin conexión) usando workers o la tecnología adecuada, pero que cuando detecte que ha cambiado el juego de preguntas en el servidor lo actualizará inmediatamente y jugará con el juego actualizado sin intervención del usuario. Usar siempre la versión almacenada cuando el jugador esté sin conexión o el servidor no responda.

Comenzaremos con un ejemplo de Europa, pero lo iremos ampliando a preguntas sobre España (con comunidades autónomas y provincias), Francia, Asia, África, Oceanía, etc.

Cada mapa podrá ser una imagen PNG o SVG. Se recomienda SVG para que se adapte mejor al tamaño de la pantalla.

Todo el código, comentarios, clases, métodos, variables, etc deberán estar en castellano.

# Requisitos
Al principio la página debe solicitar elegir el número de preguntas por cada examen. Debe haber un botón para elegir el máximo y el mínimo de cada examen.

Cada examen estará definido en un archivo JSON.

Ejemplo de archivo JSON `europa-politico.json`:

```json
{
    "nombre": "Mapa político de Europa",
    "descripción": "Preguntas sobre el mapa político de Europa.",
    "tipos": {
        "paises": {
            "mapa": "europa-politico.svg",
            "exámenes": [
                {
                    "nombre": "Localizar países de Europa",
                    "pregunta": "¿Qué país es éste?",
                    "respuesta": {
                        "tipo": "opciones",
                        "número": 4
                    }
                },
                {
                    "nombre": "Identificar el país de Europa",
                    "pregunta": "Localiza {}",
                    "respuesta": {
                        "tipo": "pulsar"
                    }
                }
            ],
            "respuestas": {
                "España": [ {x: 200, y: 300 }, {x: 250, y: 350 }, {x: 300, y: 400 }],
                "Francia": [ {x: 200, y: 300 }, {x: 250, y: 350 }, {x: 300, y: 400 }],
                "Italia": [ {x: 200, y: 300 }, {x: 250, y: 350 }, {x: 300, y: 400 }]
            }
        },
        "capitales": {
            "mapa": "europa-politico.svg",
            "exámenes": [
                {
                    "nombre": "Localizar capitales de Europa",
                    "pregunta": "¿Qué capital es ésta?",
                    "respuesta": {
                        "tipo": "opciones",
                        "número": 4
                    }
                },
                {
                    "nombre": "Identificar capitales de Europa",
                    "pregunta": "Localiza {}",
                    "respuesta": {
                        "tipo": "pulsar"
                    }
                }
            ],
            "respuestas": {
                "Madrid": { x: 200, y: 300, r: 10 },
                "París": { x: 250, y: 350, r: 10 },
                "Roma": { x: 300, y: 400, r: 10 }
            }
        }
    }
}
```

Si se despliega un examen, se podrá elegir el número de preguntas que se harán de cada subexamen (apartados "exámenes" de cada JSON), poniendo en cada examen botón rápido para "0", "-", "+" y "max" (el máximo disponible) además del campo de texto de tipo número para poder introducir el valor manualmente.

También debe haber en la parte superior un botón para "Todos" y "Ninguno" para poner todos a 0 o al máximo.

Ajustar el número de preguntas del examen con la suma de los subexámenes seleccionados.

Las coordenadas de las respuestas se corresponden con el mapa almacenado en el SVG o PNG "mapa", que puede ser el mismo en diferentes subexámenes o podrían ser diferentes. Hay que tener en cuenta que el mapa se adaptará al tamaño de la pantalla, para tenerlo en cuenta a la hora de detectar las pulsaciones de las respuestas, áreas, etc.

# Examen
Debe tener un encabezado que muestre el examen que se está haciendo, el número de preguntas contestadas del total y debajo una barra para desplazarse entre preguntas.

Habrán estos botones:
- "Inicio" ("<<"): ir a la primera pregunta.
- "Anterior" ("<"): ir a la pregunta anterior.
- "Siguiente" (">"): ir a la siguiente pregunta.
- "Fin" (">>"): ir a la última pregunta.
- "Terminar": finalizar el examen y mostrar los resultados.

Entre anterior y siguiente, dependiendo del ancho de la página (usar consultas de medio) se mostrará en el centro la pregunta actual y tras él y detrás de él las preguntas anteriores y posteriores, resaltando el botón de la pregunta actual respecto de las siguientes y anteriores, además de indicar visiblemente las que han sido respondidas y las que no.

Tras el encabezado y la barra de preguntas aparecerá el mapa del examen en curso.

En pantallas horizontales la selección de múltiples respuestas podría aparecer a la derecha del mapa. Mientras que en pantallas verticales podría aparecer debajo.

# Tipos de preguntas
Cada examen tipo de respuestas tendrá varios exámenes que harán uso de las respuestas de ese examen.

Por ahora habrá dos tipos de exámenes (según el campo "tipo"):

* "opciones": Se presentarán 4 opciones de respuestas, una de ellas la correcta y las otras 3 elegidas del resto de respuestas disponibles.
* "pulsar": El usuario deberá pulsar sobre el mapa y se deberá comprobar si la pulsación entrá dentro del área de la respuesta o bien dentro del radio alrededor de la coordenada de la respuesta.

Al hacer una selección se quedará marcada y guardada la respuesta hasta que se finalice la prueba completa.

# Resultado de las prueba
Al finalizar la prueba se mostrará el resumen del porcentaje total de aciertos en grande, mostrando varios tonalidades de color desde verde (90% hacia arriba) hasta rojo (menos del 40%).

Debajo aparecerán las estadísticas de respuestas por examen y también por subexamen.

También deberá haber la posibilidad de revisar todas las respuestas, mostrando el área de la respuesta en caso de ser de tipo "pulsar" o bien resaltando la respuesta correcta en caso de ser de tipo "opciones". Resaltar las respuestas respondidas correctamente e incorrectamente respecto de la respuesta correcta (sobre todo si no coincide).

# Exámenes de ejemplo

Generar dos JSON para dos exámenes de ejemplo.

- Mapa político de Europa con preguntas sobre capitales y países.
- Mapa físico de Europa con preguntas sobre montañas y cordilleras.
