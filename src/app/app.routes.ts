import { Routes } from '@angular/router';
import { ConfiguracionExamenComponent } from './componentes/configuracion-examen/configuracion-examen.component';
import { EjecucionExamenComponent } from './componentes/ejecucion-examen/ejecucion-examen.component';
import { ResultadosExamenComponent } from './componentes/resultados-examen/resultados-examen.component';

export const routes: Routes = [
  { path: '', component: ConfiguracionExamenComponent },
  { path: 'examen', component: EjecucionExamenComponent },
  { path: 'resultados', component: ResultadosExamenComponent },
  { path: '**', redirectTo: '' }
];
