import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpregadoPerfilComponent } from './empregado-perfil.component';

describe('EmpregadoPerfilComponent', () => {
  let component: EmpregadoPerfilComponent;
  let fixture: ComponentFixture<EmpregadoPerfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpregadoPerfilComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpregadoPerfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
