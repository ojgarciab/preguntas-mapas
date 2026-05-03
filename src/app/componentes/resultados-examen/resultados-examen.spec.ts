import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultadosExamen } from './resultados-examen';

describe('ResultadosExamen', () => {
  let component: ResultadosExamen;
  let fixture: ComponentFixture<ResultadosExamen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultadosExamen],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultadosExamen);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
