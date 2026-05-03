import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisorMapa } from './visor-mapa';

describe('VisorMapa', () => {
  let component: VisorMapa;
  let fixture: ComponentFixture<VisorMapa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisorMapa],
    }).compileComponents();

    fixture = TestBed.createComponent(VisorMapa);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
