import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RoleSelectionComponent } from './roles-selection/roles-selection.component';
import { EmpregadoComponent } from './empregado/empregado.component';
import { EmpregadorComponent } from './empregador/empregador.component';
import { RegistroComponent } from './registro/registro.component';
import { EmpregadorPerfilComponent } from './empregador/empregador-perfil/empregador-perfil.component';
import { EmpregadoPerfilComponent } from './empregado/empregado-perfil/empregado-perfil.component';

export const routes: Routes = [
    { path: '', redirectTo: '/role-selection', pathMatch: 'full' },
    { path: 'role-selection', component: RoleSelectionComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegistroComponent },
    { path: 'dashboard-empregado', component: EmpregadoComponent },
    { path: 'dashboard-empregador', component: EmpregadorComponent },
    { path: 'perfil/:id', component: EmpregadoPerfilComponent }
];
