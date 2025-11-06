// Caminho: src/app/pages/questions/components/question-details/question-details.ts
// v5.0 - Limpo e focado APENAS em Verdadeiro/Falso (V/F)

import { Component, inject, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogActions, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CommonModule } from '@angular/common';
import { finalize, catchError, of } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

// Imports Corrigidos
import { QuestionsService } from '../../services/question.service';
import { BackendQuestion } from '../../../shared/models/question-models';

/**
 * DTO de dados que o modal recebe (Focado em V/F)
 */
export interface QuestionDetailsModalData {
    question?: BackendQuestion | null; // Aceita uma questão V/F (edição) ou nulo (criação)
    certificationId: string; // ID da certificação para associar
}

@Component({
    selector: 'app-question-details',
    standalone: true,
    imports: [
        CommonModule, // Necessário para @if
        ReactiveFormsModule,
        MatDialogTitle, MatDialogContent, MatDialogActions, MatButtonModule, 
        MatIconModule, MatFormFieldModule, MatInputModule, 
        MatTooltipModule,
        MatSlideToggleModule,
        MatDatepickerModule, MatNativeDateModule
    ],
    templateUrl: './question-details.html',
    styleUrl: './question-details.scss',
})
export class QuestionDetails implements OnInit {
    
    // Injeções de Dependência
    private readonly fb = inject(FormBuilder);
    public readonly dialogRef = inject(MatDialogRef<QuestionDetails>); 
    private readonly questionsService = inject(QuestionsService);

    // DADOS DE ESTADO (Corrigindo os erros TS2339)
    public isEditing: boolean = false;
    public isSaving: boolean = false;
    
    questionForm!: FormGroup;

    constructor(@Inject(MAT_DIALOG_DATA) public data: QuestionDetailsModalData) {}

    ngOnInit(): void {
        this.isEditing = !!this.data.question; // Define se está editando
        
        // Inicializa o formulário V/F
        this.questionForm = this.fb.group({
            question: new FormControl('', Validators.required),
            answer: new FormControl(false, Validators.required),
            isActive: new FormControl(true),
            validUntil: new FormControl(null)
        });

        // Se estiver editando, carrega os dados
        if (this.isEditing && this.data.question) {
            this.loadQuestionData(this.data.question);
        }
    }

    /**
     * Carrega os dados da questão V/F no formulário
     */
    loadQuestionData(question: BackendQuestion): void {
        this.questionForm.patchValue({
            question: question.question,
            answer: question.answer,
            isActive: question.isActive ?? true, // Usa 'true' como padrão
            //validUntil: question.validity_months ? new Date(question.validity_months) : null 
            validity_months: new FormControl(12, [Validators.required, Validators.min(1)])
        });
    }

    /**
     * Salva a questão (Criação ou Edição V/F)
     */
   /**
     * Salva a questão (Criação ou Edição V/F)
     */
    saveQuestion(): void {
        if (this.questionForm.invalid) {
            this.questionForm.markAllAsTouched();
            return;
        }
        this.isSaving = true;

        if (this.isEditing && this.data.question) {
            // --- ATUALIZAR (UPDATE) ---
            
            // CORREÇÃO: O payload de Update NÃO deve incluir o certificationId
            const payload: Partial<BackendQuestion> = {
                question: this.questionForm.value.question,
                answer: this.questionForm.value.answer,
                //isActive: this.questionForm.value.isActive
            };

            this.questionsService.updateQuestion(this.data.question.id, payload).pipe(
                finalize(() => this.isSaving = false),
                catchError(err => {
                    console.error("Erro ao atualizar (400?):", err);
                    // Tenta extrair a mensagem de erro do DTO do NestJS
                    let errorMsg = "Erro ao atualizar. Verifique os dados.";
                    if (err.error && Array.isArray(err.error.message)) {
                        errorMsg = err.error.message.join('\n');
                    }
                    alert(errorMsg);
                    return of(null);
                })
            ).subscribe(result => {
                if (result) this.dialogRef.close(true); // Sucesso
            });

        } else {
            // --- CRIAR (CREATE) ---
            
            // O payload de Create PRECISA do certificationId
            const payload: Partial<BackendQuestion> = {
                question: this.questionForm.value.question,
                answer: this.questionForm.value.answer,
                certificationId: this.data.certificationId,
                validity_months: Number(this.questionForm.value.validity_months),
                //isActive: this.questionForm.value.isActive
            };

            this.questionsService.createQuestion(payload).pipe(
                finalize(() => this.isSaving = false),
                catchError(err => {
                    console.error("Erro ao criar:", err);
                    alert("Erro ao criar. Tente novamente.");
                    return of(null);
                })
            ).subscribe(result => {
                if (result) this.dialogRef.close(true); // Sucesso
            });
        }
    }
}