import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardOperaciones } from './dashboard-operaciones';

describe('DashboardOperaciones', () => {
  let component: DashboardOperaciones;
  let fixture: ComponentFixture<DashboardOperaciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardOperaciones],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardOperaciones);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
