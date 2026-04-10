import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardAtencion } from './dashboard-atencion';

describe('DashboardAtencion', () => {
  let component: DashboardAtencion;
  let fixture: ComponentFixture<DashboardAtencion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardAtencion],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardAtencion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
