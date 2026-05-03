import { Component, Input, Output, EventEmitter, inject, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AreaRespuesta, Coordenada, Circulo } from '../../modelos/examen.modelo';

@Component({
  selector: 'app-visor-mapa',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mapa-wrapper" #wrapper (click)="onMapaClick($event)">
      <div class="svg-container" [innerHTML]="svgContent()" #container></div>
      <svg class="overlay-svg" [attr.viewBox]="viewBox()">
         <!-- Círculo de respuesta del usuario -->
         <circle *ngIf="clickUsuario()" [attr.cx]="clickUsuario()?.x" [attr.cy]="clickUsuario()?.y" r="8" fill="rgba(99, 102, 241, 0.6)" stroke="white" stroke-width="2" />
         
         <!-- Área correcta (para revisión) -->
         <ng-container *ngIf="mostrarRespuestaCorrecta && areaCorrecta">
            <!-- Si es polígono -->
            <polygon *ngIf="esPoligono(areaCorrecta)" [attr.points]="getPoints(areaCorrecta)" fill="rgba(34, 197, 94, 0.4)" stroke="#16a34a" stroke-width="2" />
            <!-- Si es círculo -->
            <circle *ngIf="!esPoligono(areaCorrecta)" [attr.cx]="getCircle(areaCorrecta).x" [attr.cy]="getCircle(areaCorrecta).y" [attr.r]="getCircle(areaCorrecta).r || defaultR()" fill="rgba(34, 197, 94, 0.4)" stroke="#16a34a" stroke-width="2" />
            <!-- Punto central del círculo -->
            <circle *ngIf="!esPoligono(areaCorrecta)" [attr.cx]="getCircle(areaCorrecta).x" [attr.cy]="getCircle(areaCorrecta).y" r="2" fill="#16a34a" />
         </ng-container>
      </svg>
    </div>
  `,
  styles: [`
    .mapa-wrapper { position: relative; width: 100%; height: 100%; min-height: 400px; overflow: hidden; background: #f0f4f8; cursor: crosshair; border-radius: 12px; }
    .svg-container { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
    ::ng-deep .svg-container svg { width: 100%; height: auto; max-height: 100%; display: block; }
    .overlay-svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; }
  `]
})
export class VisorMapaComponent {
  private http = inject(HttpClient);
  
  @Input() set mapaUrl(url: string) {
    if (!url) return;
    this.http.get(`./mapas/${url}`, { responseType: 'text' }).subscribe(content => {
      // Eliminar scripts si los hay por seguridad
      const cleanContent = content.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "");
      this.svgContent.set(cleanContent);
      
      const match = content.match(/viewBox="([^"]+)"/);
      if (match) {
        this.viewBox.set(match[1]);
        const vb = match[1].split(' ').map(Number);
        this.vbWidth.set(vb[2]);
        this.vbHeight.set(vb[3]);
      }
    });
  }

  @Input() areaCorrecta?: AreaRespuesta;
  @Input() mostrarRespuestaCorrecta = false;
  
  @Input() set respuestaPrevia(coord: Coordenada | undefined) {
    if (coord) {
      this.clickUsuario.set(coord);
    } else {
      this.clickUsuario.set(null);
    }
  }

  @Output() mapaClickeado = new EventEmitter<{ punto: Coordenada, esCorrecto: boolean }>();

  svgContent = signal<string>('');
  viewBox = signal<string>('0 0 800 600');
  vbWidth = signal<number>(800);
  vbHeight = signal<number>(600);
  clickUsuario = signal<Coordenada | null>(null);

  @ViewChild('container') container!: ElementRef;

  onMapaClick(event: MouseEvent) {
    if (this.mostrarRespuestaCorrecta) return;

    const svgElement = this.container.nativeElement.querySelector('svg');
    if (!svgElement) return;

    const pt = svgElement.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    
    const cursorPt = pt.matrixTransform(svgElement.getScreenCTM().inverse());
    
    const punto = { x: cursorPt.x, y: cursorPt.y };
    this.clickUsuario.set(punto);
    
    const esCorrecto = this.areaCorrecta ? this.verificarClic(punto, this.areaCorrecta) : false;
    this.mapaClickeado.emit({ punto, esCorrecto });
  }

  verificarClic(punto: Coordenada, area: AreaRespuesta): boolean {
    if (Array.isArray(area)) {
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
      const dx = punto.x - area.x;
      const dy = punto.y - area.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const r = area.r || this.defaultR();
      return dist <= r;
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
    return Math.min(this.vbWidth(), this.vbHeight()) / 10;
  }
}
