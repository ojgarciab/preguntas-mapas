import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EjecucionExamen } from './ejecucion-examen';

describe('EjecucionExamen', () => {
  let component: EjecucionExamen;
  let fixture: ComponentFixture<EjecucionExamen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EjecucionExamen],
    }).compileComponents();

    fixture = TestBed.createComponent(EjecucionExamen);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
