// Caminho: src/app/pages/questions/questions.component.ts
// (NOVO ARQUIVO)

import { Component, inject, Inject, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { catchError, debounceTime, distinctUntilChanged, finalize, of, tap } from 'rxjs';

// Imports locais
import { QuestionsService } from '../../services/question.service';
import { QuestionDetails } from '../../components/question-details/question-details';
import { AiQuestionGenerator, AiGeneratorModalData } from '../../components/ai-question-generator/ai-question-generator';
import { BackendQuestion } from '../../../shared/models/question-models';
import { QuestionFilterDTO } from '../../../shared/models/question-models';  
import { CompleteCertification } from '../../../shared/models/certification.models';

export interface QuestionBankModalData {
    certificationId: string | null; // ID da certificação para pré-filtrar
    certificationTitle?: string;
    certificationPdfPath?: string | null;
    certification?: CompleteCertification
}

@Component({
    selector: 'app-questions',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, MatDialogModule,
        MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, 
        MatInputModule, MatProgressSpinnerModule, MatTooltipModule, 
        MatTableModule, MatPaginatorModule, MatSelectModule, MatOptionModule
    ],
    templateUrl: './questions.html',
    styleUrl: './questions.scss',
})
export class QuestionsPage implements OnInit, AfterViewInit {

    // Injeções
    private readonly fb = inject(FormBuilder);
    private readonly dialog = inject(MatDialog);
    public dialogRef = inject(MatDialogRef<QuestionsPage>);
    private questionsService = inject(QuestionsService);

    // Propriedades do estado
    filterForm!: FormGroup;
    isLoading: boolean = false;
    certificationId: string | null;
    certificationTitle: string | null;
    certificationPdfPath: string | null;
    certification: CompleteCertification | null;

    // Tabela
    displayedColumns: string[] = ['question', 'isActive', 'createdAt', 'actions'];
    dataSource = new MatTableDataSource<BackendQuestion>();
    totalQuestions = 0;
    
    @ViewChild(MatPaginator) paginator!: MatPaginator;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: QuestionBankModalData
    ) {
        this.certificationId = data.certificationId;
        this.certificationTitle = data.certificationTitle || null;
        this.certificationPdfPath = data.certificationPdfPath || null;
        this.certification = data.certification || null;
    }

    ngOnInit(): void {
        this.filterForm = this.fb.group({
            questionText: [null],
            isActive: [null],
            // Pré-filtra pela certificação, se o ID foi passado
            certificationId: [this.certificationId] 
        });

        // Carrega as questões iniciais
        this.loadQuestions();

        // Recarrega ao mudar filtros
        this.filterForm.valueChanges.pipe(
            debounceTime(500),
            distinctUntilChanged()
        ).subscribe(() => {
            this.paginator.firstPage(); // Reseta para a primeira página
            this.loadQuestions();
        });
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
    }

    /**
     * Carrega as questões do backend
     */
    loadQuestions(): void {
        this.isLoading = true;
        
        const filters: QuestionFilterDTO = {
            page: this.paginator ? this.paginator.pageIndex + 1 : 1,
            limit: this.paginator ? this.paginator.pageSize : 10,
            ...this.filterForm.value
        };

        this.questionsService.findAllQuestions(filters).pipe(
            tap(response => {
                this.dataSource.data = response.data;
                this.totalQuestions = response.total;
            }),
            catchError(err => {
                console.error("Erro ao buscar questões:", err);
                alert("Não foi possível carregar as questões.");
                return of(null);
            }),
            finalize(() => this.isLoading = false)
        ).subscribe();
    }

    /**
     * Limpa os filtros do formulário
     */
    resetFilters(): void {
        this.filterForm.reset();
        // Restaura o ID da certificação se ele existir
        if (this.certificationId) {
            this.filterForm.get('certificationId')?.setValue(this.certificationId);
        }
        this.paginator.firstPage();
        this.loadQuestions();
    }
    
    /**
     * Chamado quando o paginador muda de página
     */
    onPageChange(event: PageEvent): void {
        this.loadQuestions();
    }

    /**
     * Abre o modal de Adição Manual ou Edição
     */
    openQuestionDetails(question?: BackendQuestion): void {
        const dialogRef = this.dialog.open(QuestionDetails, {
            width: '800px',
            maxWidth: '90vw',
            data: { 
                question: question,
                certificationId: this.certificationId // Passa o ID da certificação atual
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result === true) {
                this.loadQuestions(); // Recarrega a lista se algo foi salvo
                this.dialogRef.close(true); // Fecha o banco de questões (opcional)
            }
        });
    }

    /**
     * Abre o modal de Geração com I.A.
     */
    get hasPdf(): boolean {
        // Verifica se o objeto certification existe e se tem path ou filename
        return !!this.certification && (!!this.certification.pdfPath || !!this.certification.pdfFileName);
    }

    // 2. Remova a validação de alerta do openAiGenerator (já que o botão estará bloqueado)
    openAiGenerator(): void {
        if (!this.certification) return;

        // Prepara dados e abre modal
        const aiData: AiGeneratorModalData = { 
            certification: this.certification
        };

        this.dialog.open(AiQuestionGenerator, {
            width: '900px', 
            maxWidth: '95vw',
            data: aiData,
            disableClose: true
        }).afterClosed().subscribe(result => {
            if (result) {
                this.loadQuestions(); 
                if (typeof result === 'object') {
                    this.certification = result; 
                }
            }
        });
    }
// ...

    /**
     * Exclui uma questão
     */
    deleteQuestion(question: BackendQuestion): void {
        if (!confirm(`Tem certeza que deseja excluir a questão: "${question.question?.slice(0, 50)}..."?`)) {
            return;
        }

        this.isLoading = true;
        this.questionsService.deleteQuestion(question.id).pipe(
            tap(() => {
                alert("Questão excluída com sucesso.");
                this.loadQuestions(); // Recarrega a lista
            }),
            catchError(err => {
                console.error("Erro ao excluir questão:", err);
                alert("Não foi possível excluir a questão.");
                return of(null);
            }),
            finalize(() => this.isLoading = false)
        ).subscribe();
    }
   
}