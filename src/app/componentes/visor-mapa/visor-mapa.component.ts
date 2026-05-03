import { Component, Input, Output, EventEmitter, inject, signal, ElementRef, ViewChild, SecurityContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AreaRespuesta, Coordenada, Circulo } from '../../modelos/examen.modelo';

@Component({
  selector: 'app-visor-mapa',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mapa-wrapper">
      <svg #mainSvg 
           [attr.viewBox]="viewBox()" 
           (click)="onMapaClick($event)" 
           preserveAspectRatio="xMidYMid meet">
        
        <!-- Contenido del mapa base -->
        <g [innerHTML]="svgBody()"></g>
        
        <!-- Capa de interacción y respuestas -->
        <g class="capa-respuestas">
           <!-- Área preguntada (Solo para preguntas tipo 'opciones') -->
           <g *ngIf="areaAPreguntar" class="capa-pregunta">
              <!-- Polígono -->
              <polygon *ngIf="esPoligono(areaAPreguntar)" 
                       [attr.points]="getPoints(areaAPreguntar)" 
                       fill="#6366f1">
                 <animate attributeName="opacity" values="1;0;1" dur="2s" repeatCount="indefinite" />
              </polygon>
              
              <!-- Punto (Círculo) con Zoom y Pulso -->
              <circle *ngIf="!esPoligono(areaAPreguntar)"
                      [attr.cx]="getCircle(areaAPreguntar).x" 
                      [attr.cy]="getCircle(areaAPreguntar).y"
                      fill="#6366f1">
                 <animate attributeName="r" 
                          [attr.values]="(getCircle(areaAPreguntar).r || defaultR()) + ';' + ((getCircle(areaAPreguntar).r || defaultR()) * 1.25) + ';' + (getCircle(areaAPreguntar).r || defaultR())" 
                          dur="2s" repeatCount="indefinite" />
                 <animate attributeName="opacity" values="1;0;1" dur="2s" repeatCount="indefinite" />
              </circle>
           </g>

           <!-- Respuesta del usuario (Punto donde clickeó) -->
           <circle *ngIf="clickUsuario()" 
                   [attr.cx]="clickUsuario()?.x" 
                   [attr.cy]="clickUsuario()?.y" 
                   r="8" 
                   fill="#6366f1" 
                   stroke="white" 
                   stroke-width="2" />
           
           <!-- Área correcta (Solo visible en modo revisión) -->
           <ng-container *ngIf="mostrarRespuestaCorrecta && areaCorrecta">
              <!-- Polígono para países/regiones -->
              <polygon *ngIf="esPoligono(areaCorrecta)" 
                       [attr.points]="getPoints(areaCorrecta)" 
                       fill="#22c55e" 
                       stroke="#16a34a" 
                       stroke-width="3" 
                       stroke-dasharray="4">
                 <animate attributeName="fill-opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
              </polygon>
              
              <!-- Círculo para ciudades/capitales -->
              <ng-container *ngIf="!esPoligono(areaCorrecta)">
                 <circle [attr.cx]="getCircle(areaCorrecta).x" 
                         [attr.cy]="getCircle(areaCorrecta).y" 
                         [attr.r]="getCircle(areaCorrecta).r || defaultR()" 
                         fill="#22c55e" 
                         stroke="#16a34a" 
                         stroke-width="3" 
                         stroke-dasharray="4">
                    <animate attributeName="fill-opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
                 </circle>
                 
                 <!-- Punto central (especificado por el usuario) -->
                 <circle [attr.cx]="getCircle(areaCorrecta).x" 
                         [attr.cy]="getCircle(areaCorrecta).y" 
                         r="3" 
                         fill="#166534" />
              </ng-container>
           </ng-container>
        </g>
      </svg>
    </div>
  `,
  styles: [`
    .mapa-wrapper {
      width: 100%;
      height: 100%;
      min-height: 400px;
      background: #f1f5f9;
      border-radius: 16px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
    }
    svg {
      width: 100%;
      height: 100%;
      display: block;
      cursor: crosshair;
      touch-action: none;
    }
    .capa-respuestas {
      pointer-events: none;
    }
  `]
})
export class VisorMapaComponent {
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);
  
  @Input() set mapaUrl(url: string) {
    if (!url) return;
    this.http.get(`./mapas/${url}`, { responseType: 'text' }).subscribe(content => {
      // Extraer viewBox para alinear nuestra capa de dibujo
      const viewBoxMatch = content.match(/viewBox="([^"]+)"/i);
      if (viewBoxMatch) {
        this.viewBox.set(viewBoxMatch[1]);
        const vb = viewBoxMatch[1].split(' ').map(Number);
        this.vbWidth.set(vb[2]);
        this.vbHeight.set(vb[3]);
      }
      
      // Extraer solo el contenido interior del <svg>
      const bodyMatch = content.match(/<svg[^>]*>([\s\S]*)<\/svg>/i);
      if (bodyMatch) {
        // Limpieza básica de scripts por seguridad
        const cleanBody = bodyMatch[1].replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "");
        // Sanitizar el HTML para permitir inyección en el SVG
        this.svgBody.set(this.sanitizer.bypassSecurityTrustHtml(cleanBody));
      }
    });
  }

  @Input() areaCorrecta?: AreaRespuesta;
  @Input() areaAPreguntar?: AreaRespuesta;
  @Input() mostrarRespuestaCorrecta = false;
  
  @Input() set respuestaPrevia(coord: Coordenada | undefined) {
    this.clickUsuario.set(coord || null);
  }

  @Output() mapaClickeado = new EventEmitter<{ punto: Coordenada, esCorrecto: boolean }>();

  svgBody = signal<SafeHtml>('');
  viewBox = signal<string>('0 0 800 600');
  vbWidth = signal<number>(800);
  vbHeight = signal<number>(600);
  clickUsuario = signal<Coordenada | null>(null);

  @ViewChild('mainSvg') mainSvg!: ElementRef<SVGSVGElement>;

  onMapaClick(event: MouseEvent) {
    if (this.mostrarRespuestaCorrecta) return;

    const svg = this.mainSvg.nativeElement;
    if (!svg) return;

    // Convertir coordenadas de pantalla a coordenadas del SVG (ViewBox)
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    
    const cursorPt = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    
    if (cursorPt) {
      const punto = { x: cursorPt.x, y: cursorPt.y };
      this.clickUsuario.set(punto);
      
      const esCorrecto = this.areaCorrecta ? this.verificarClic(punto, this.areaCorrecta) : false;
      this.mapaClickeado.emit({ punto, esCorrecto });
    }
  }

  verificarClic(punto: Coordenada, area: AreaRespuesta): boolean {
    if (Array.isArray(area)) {
      // Point in Polygon (Ray Casting)
      let inside = false;
      for (let i = 0, j = area.length - 1; i < area.length; j = i++) {
        const xi = area[i].x, yi = area[i].y;
        const xj = area[j].x, yj = area[j].y;
        const intersect = ((yi > punto.y) !== (yj > punto.y))
            && (punto.x < (xj - xi) * (punto.y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
      }
      return inside;
    } else {
      // Circle detection
      const dx = punto.x - area.x;
      const dy = punto.y - area.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const r = area.r || this.defaultR();
      // Duplicamos el margen de error (r * 2) para que sea más intuitivo
      return dist <= r * 2;
    }
  }

  esPoligono(area: AreaRespuesta): area is Coordenada[] {
    return Array.isArray(area);
  }

  getPoints(area: AreaRespuesta): string {
    if (Array.isArray(area)) {
      return area.map(p => `${p.x},${p.y}`).join(' ');
    }
    return '';
  }

  getCircle(area: AreaRespuesta): Circulo {
    if (Array.isArray(area)) return { x: 0, y: 0 };
    return area;
  }

  defaultR() {
    return Math.min(this.vbWidth(), this.vbHeight()) / 12;
  }
}
