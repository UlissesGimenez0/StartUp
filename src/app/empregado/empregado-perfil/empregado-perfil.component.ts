import { Component, OnInit, OnDestroy } from '@angular/core'; // 1. IMPORTAR OnDestroy
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { StorageService } from '../../storage.service';
import { Empregado } from '../../Model/empregado.type';
import { Vaga } from '../../Model/vaga.type';
import { Subject, filter, takeUntil } from 'rxjs'; // 2. IMPORTAR Subject, filter, takeUntil

// Importações do Angular Material e FormsModule
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-empregado-perfil',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatListModule
  ],
  templateUrl: './empregado-perfil.component.html',
  styleUrls: ['./empregado-perfil.component.scss']
})
export class EmpregadoPerfilComponent implements OnInit, OnDestroy { // 3. IMPLEMENTAR OnDestroy

  empregado: Empregado | undefined;
  vagasAplicadas: Vaga[] = [];
  modoEdicao = false;

  descricaoEditavel = '';
  experienciaEditavel = '';

  // 4. Subject para gerenciar a desinscrição
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private storageService: StorageService,
    private location: Location
  ) { }

  ngOnInit(): void {
    // 5. Carregar dados iniciais
    this.carregarDadosDoPerfil();

    // 6. Inscrever-se a atualizações do StorageService
    this.storageService.onDBUpdate$
      .pipe(
        // Reagir se vagas (candidatura) ou empregados (edição de perfil) mudarem
        filter(scope => scope === 'vagas' || scope === 'empregados'),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        console.log('Perfil: DB atualizado, recarregando dados...');
        // Recarregar os dados do perfil
        this.carregarDadosDoPerfil();
      });
  }

  // 7. Implementar ngOnDestroy
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Busca os dados frescos do StorageService e atualiza a view.
   */
  private carregarDadosDoPerfil(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = +idParam;
      this.empregado = this.storageService.getEmpregadoById(id);
      if (this.empregado) {
        this.vagasAplicadas = this.storageService.getVagasAplicadas(this.empregado.id);
      }
    }
  }

  entrarModoEdicao(): void {
    if (this.empregado) {
      this.descricaoEditavel = this.empregado.descricao || '';
      this.experienciaEditavel = this.empregado.experiencia || '';
      this.modoEdicao = true;
    }
  }

  salvarAlteracoes(): void {
    if (this.empregado) {
      this.empregado.descricao = this.descricaoEditavel;
      this.empregado.experiencia = this.experienciaEditavel;
      // 8. Salvar (isso irá disparar o onDBUpdate$ e atualizar a UI)
      this.storageService.salvarEmpregado(this.empregado);
      this.modoEdicao = false;
      // Não precisamos chamar carregarDadosDoPerfil() manualmente, o Observable fará isso.
    }
  }

  cancelarEdicao(): void {
    this.modoEdicao = false;
  }

  voltar(): void {
    this.location.back();
  }
}
