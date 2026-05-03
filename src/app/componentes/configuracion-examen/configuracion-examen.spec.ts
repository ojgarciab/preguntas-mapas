import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfiguracionExamen } from './configuracion-examen';

describe('ConfiguracionExamen', () => {
  let component: ConfiguracionExamen;
  let fixture: ComponentFixture<ConfiguracionExamen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfiguracionExamen],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfiguracionExamen);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
