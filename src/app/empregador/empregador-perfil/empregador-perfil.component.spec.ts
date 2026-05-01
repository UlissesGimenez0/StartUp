import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpregadorPerfilComponent } from './empregador-perfil.component';

describe('EmpregadorPerfilComponent', () => {
  let component: EmpregadorPerfilComponent;
  let fixture: ComponentFixture<EmpregadorPerfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpregadorPerfilComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpregadorPerfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
