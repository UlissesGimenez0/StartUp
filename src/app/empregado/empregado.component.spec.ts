import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpregadoComponent } from './empregado.component';

describe('EmpregadoComponent', () => {
  let component: EmpregadoComponent;
  let fixture: ComponentFixture<EmpregadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpregadoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpregadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
