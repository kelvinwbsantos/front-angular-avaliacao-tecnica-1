// Caminho: src/app/pages/certifications/components/ai-question-generator/ai-question-generator.ts
// v2.9 - Corrige erros TS (?.), fileName e duplicata selectedFile

import { Component, inject, Inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { catchError, finalize, of } from 'rxjs';
import { BackendQuestion, ApiResponse} from '../../shared/models/question-models'; // Caminho corrigido na última iteração
import { CertificationsService } from '../../shared/services/certifications.service';

export interface AiGeneratorModalData {
    certificationId: string;
    certificationTitle: string;
    existingPdfPath: string | null;
}

@Component({
    selector: 'app-ai-question-generator',
    standalone: true,
    imports: [
        CommonModule, MatDialogModule, MatButtonModule, MatIconModule,
        MatProgressSpinnerModule, MatCardModule, MatTooltipModule,
        MatDividerModule, MatTableModule
    ],
    templateUrl: './ai-question-generator.html',
    styleUrl: './ai-question-generator.scss',
})
export class AiQuestionGenerator implements OnInit {
    public dialogRef = inject(MatDialogRef<AiQuestionGenerator>);
    private certificationsService = inject(CertificationsService);

    // Estados
    isGeneratingQuestions: boolean = false;
    isSavingAll: boolean = false;
    selectedFile: File | null = null; // CORREÇÃO: Removida a declaração duplicada
    existingPdfName: string | null = null;
    fileName: string = 'Nenhum arquivo selecionado'; // CORREÇÃO: Propriedade adicionada

    // Tabela
    generatedQuestions = new MatTableDataSource<BackendQuestion>([]);
    displayedColumns: string[] = ['question', 'answer', 'actions'];

    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: AiGeneratorModalData
    ) {}

    ngOnInit(): void {
        console.log(`[AI Gen] Modal aberto para: ${this.data.certificationTitle} (ID: ${this.data.certificationId})`);
        console.log(`[AI Gen] Dados recebidos:`, this.data);
        console.log(`[AI Gen] Verificando existingPdfPath:`, this.data.existingPdfPath);

        if (this.data.existingPdfPath) {
            try {
                this.existingPdfName = this.data.existingPdfPath.substring(this.data.existingPdfPath.lastIndexOf('/') + 1);
                console.log(`[AI Gen] Nome do PDF existente definido:`, this.existingPdfName);
            } catch (e) {
                console.error(`[AI Gen] Erro ao extrair nome do PDF do path:`, this.data.existingPdfPath, e);
                this.existingPdfName = 'Erro ao ler nome';
            }
        } else {
            console.log("[AI Gen] Nenhum PDF existente (existingPdfPath é nulo ou vazio).");
            this.existingPdfName = null;
        }
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.selectedFile = input.files[0];
            this.fileName = this.selectedFile.name; // Atualiza fileName quando um arquivo é selecionado
            console.log(`[AI Gen] Novo arquivo selecionado: ${this.selectedFile.name}`);
        } else {
            this.selectedFile = null;
            this.fileName = 'Nenhum arquivo selecionado'; // Reseta fileName
            console.log("[AI Gen] Seleção de arquivo cancelada.");
        }
        if(this.fileInput) this.fileInput.nativeElement.value = '';
    }

   generateQuestions(): void {
        let fileToUpload: File | null = null;
        let isUsingExisting = false;
        let pdfNameToUseMessage = "";

        if (this.selectedFile) {
            fileToUpload = this.selectedFile;
            pdfNameToUseMessage = `novo arquivo "${fileToUpload.name}"`;
            if (this.data.existingPdfPath) {
                if (!confirm(`Você selecionou um novo arquivo ("${fileToUpload.name}").\n\nDeseja substituir o PDF existente associado a esta certificação ("${this.existingPdfName || 'nome desconhecido'}") e gerar novas questões?`)) {
                    console.log("[AI Gen] Geração cancelada pelo usuário (substituição).");
                    return;
                }
                console.log("[AI Gen] Usuário confirmou substituição do PDF.");
            }
        } else if (this.data.existingPdfPath) {
            fileToUpload = null;
            isUsingExisting = true;
            pdfNameToUseMessage = `PDF existente "${this.existingPdfName}"`;
        } else {
            alert("Por favor, selecione um arquivo PDF para gerar as questões.");
            return;
        }

        this.isGeneratingQuestions = true;
        this.generatedQuestions.data = [];

        console.log(`[AI Gen] Iniciando geração para ID ${this.data.certificationId} usando ${pdfNameToUseMessage}. Enviando arquivo? ${!!fileToUpload}`);

        this.certificationsService.generateAiQuestions(this.data.certificationId, fileToUpload).pipe(
            finalize(() => {
                this.isGeneratingQuestions = false;
                console.log("[AI Gen] Geração finalizada (sucesso ou erro).");
            }),
            catchError(error => {
                console.error("[AI Gen] Erro ao gerar questões:", error);
                let errorMsg = 'Erro ao gerar questões.';
                if (error.status === 404) {
                    errorMsg = "Erro 404: Rota não encontrada (/questions/generate-from-pdf). Verifique o backend e o serviço.";
                } else if (error.error?.message) {
                    errorMsg = Array.isArray(error.error.message) ? error.error.message.join('\n') : error.error.message;
                }
                alert(errorMsg);
                return of(null);
            })
        ).subscribe((response: ApiResponse | null) => {
          // CORREÇÃO FINAL: Usando Array.isArray() para máxima segurança
            if (response && Array.isArray(response.questions) && response.questions.length > 0) {
                // Dentro deste bloco, é 100% GARANTIDO que response.questions é um array com itens.
                console.log(`[AI Gen] ${response.created} questões recebidas.`);
                alert(response.message);
                this.generatedQuestions.data = response.questions; // Seguro acessar

                if (this.selectedFile) {
                    this.existingPdfName = this.selectedFile.name;
                    this.data.existingPdfPath = `path/simulado/${this.selectedFile.name}`;
                    this.selectedFile = null;
                    this.fileName = 'Nenhum arquivo selecionado';
                }
            } else if (response) { // response não é null, mas questions não é um array com itens
                console.warn("[AI Gen] Resposta recebida, mas sem questões válidas ou formato inesperado.");
                alert(response.message || "A I.A. concluiu, mas não retornou questões válidas.");
                this.generatedQuestions.data = []; // Garante tabela vazia
            } else {
                // Se response for null (erro na API), o catchError já tratou
                this.generatedQuestions.data = []; // Garante tabela vazia
            }
        });
    }

    /**
     * Função chamada pelo botão "OK". Por enquanto, apenas fecha o modal.
     */
    saveAllQuestions(): void {
        console.log("[AI Gen] Botão OK clicado. Fechando modal.");
        this.dialogRef.close(true); // Indica sucesso genérico
    }

    // --- Funções da Tabela ---
    getAnswerText(answer: boolean): string {
        return answer ? 'Verdadeiro' : 'Falso';
    }

    deleteQuestion(index: number): void {
        const currentData = this.generatedQuestions.data;
        const removedQuestion = currentData.splice(index, 1);
        this.generatedQuestions.data = currentData;
        console.log(`[AI Gen] Questão descartada (índice ${index}):`, removedQuestion[0]?.question);
        alert("Questão descartada da lista de revisão.");
    }

    openQuestionDetailsForEdit(question: BackendQuestion, index: number): void {
        console.log(`[AI Gen] Abrindo modal de edição para Questão ID: ${question.id}`);
        alert("A edição de questões individuais geradas pela IA será implementada a seguir.");
    }

    saveQuestion(question: BackendQuestion, index: number): void {
         alert("Salvamento individual não implementado nesta tela.");
    }

    triggerFileInput(): void {
        this.fileInput?.nativeElement.click();
    }
}