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
import { BackendQuestion, ApiResponse} from '../../../shared/models/question-models';
import { CertificationsService } from '../../services/certifications.service';

// Importa os modelos de Certificação
import { CompleteCertification, InitialCertification } from '../../../shared/models/certification.models';

/**
 * Interface de dados atualizada: Agora recebe o objeto 'CompleteCertification'
 */
export interface AiGeneratorModalData {
    certification: CompleteCertification;
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
    isGeneratingQuestions: boolean = false; // Spinner do botão "Gerar"
    isSavingPdf: boolean = false; // Spinner do novo botão "Substituir PDF"
    selectedFile: File | null = null;
    existingPdfName: string | null = null;
    fileName: string = 'Nenhum arquivo selecionado';

    // Tabela
    generatedQuestions = new MatTableDataSource<BackendQuestion>([]);
    displayedColumns: string[] = ['question', 'answer', 'actions'];

    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: AiGeneratorModalData
    ) {}

    ngOnInit(): void {
        const cert = this.data.certification;
        console.log(`[AI Gen] Modal aberto para: ${cert.name} (ID: ${cert.id})`);

       // Lógica para extrair o nome do PDF (priorizando 'pdfFileName' limpo)
        if (cert.pdfFileName) {
            // Usa o nome do arquivo, mas aplica a limpeza
            this.existingPdfName = this.cleanPdfFileName(cert.pdfFileName); 
        } else if (cert.pdfPath) {
            // Se veio apenas o path, extrai o nome e aplica a limpeza
            try {
                const fileNameFromPath = cert.pdfPath.substring(cert.pdfPath.lastIndexOf('/') + 1);
                this.existingPdfName = this.cleanPdfFileName(fileNameFromPath);
            } catch (e) { 
                this.existingPdfName = 'Erro ao ler nome'; 
            }
        } else {
            this.existingPdfName = null;
        }
    }

    /**
     * Helper para atualizar o nome do PDF na UI
     */
    private updatePdfInfo(cert: CompleteCertification): void {
        if (cert.pdfFileName) {
            this.existingPdfName = cert.pdfFileName;
        } else if (cert.pdfPath) {
            try {
                this.existingPdfName = cert.pdfPath.substring(cert.pdfPath.lastIndexOf('/') + 1);
            } catch (e) { this.existingPdfName = 'Erro ao ler nome'; }
        } else {
            this.existingPdfName = null;
        }
        console.log(`[AI Gen] PDF existente atualizado:`, this.existingPdfName);
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.selectedFile = input.files[0];
            this.fileName = this.selectedFile.name; 
            console.log(`[AI Gen] Novo arquivo selecionado: ${this.selectedFile.name}`);
        } else {
            this.selectedFile = null;
            this.fileName = 'Nenhum arquivo selecionado'; 
        }
        if(this.fileInput) this.fileInput.nativeElement.value = '';
    }

    /**
     * Requisito 3: NOVO MÉTODO - Salva (PATCH) o PDF sem gerar questões.
     */
    substitutePdf(): void {
        if (!this.selectedFile) {
            alert("Nenhum novo arquivo selecionado.");
            return;
        }

        // Confirmação
        const confirmMsg = this.existingPdfName 
            ? `Deseja substituir o PDF existente ("${this.existingPdfName}") pelo novo ("${this.selectedFile.name}")?`
            : `Deseja adicionar o PDF "${this.selectedFile.name}" a esta certificação?`;

        if (!confirm(confirmMsg)) {
            console.log("[AI Gen] Substituição de PDF cancelada.");
            return;
        }

        this.isSavingPdf = true; // Inicia spinner do botão "Substituir"
        const fileToUpload = this.selectedFile;
        const cert = this.data.certification;

        // Monta o payload (necessário para o service 'updateCertification')
        const payload: InitialCertification & { isActive: boolean } = {
            name: cert.name,
            shortDescription: cert.shortDescription,
            description: cert.description,
            modality: cert.modality,
            passingScore: cert.passingScore,
            durationHours: cert.durationHours,
            isActive: cert.isActive 
        };

        // Chama o PATCH
        this.certificationsService.updateCertification(cert.id, payload, fileToUpload).pipe(
            finalize(() => this.isSavingPdf = false),
            catchError(err => {
                console.error("[AI Gen] Erro ao SALVAR (PATCH) o PDF:", err);
                alert("Erro ao salvar o novo PDF. A operação foi cancelada.");
                return of(null);
            })
        ).subscribe((updatedCertification: CompleteCertification | null) => {
            if (updatedCertification) {
                console.log(`[AI Gen] PDF salvo com sucesso.`);
                alert("PDF substituído com sucesso!");
                
                // Atualiza o estado local e a UI
                this.data.certification = updatedCertification; // Salva o novo estado
                this.updatePdfInfo(updatedCertification); // Atualiza o nome na UI
                this.selectedFile = null;
                this.fileName = 'Nenhum arquivo selecionado';
            }
        });
    }

    /**
     * Requisito 4: MÉTODO ANTIGO (generateQuestions) - Agora renomeado
     * para 'executeQuestionGeneration' e só faz o POST.
     */
    generateQuestions(): void {
        // Lógica de verificação: SÓ GERA se um PDF existir no servidor
        if (!this.data.certification.pdfPath && !this.existingPdfName) {
            alert("Não há um PDF associado a esta certificação. Por favor, adicione um PDF antes de gerar questões.");
            return;
        }
        // Se um arquivo está selecionado mas não foi salvo, avisa o usuário
        if (this.selectedFile) {
            alert("Você selecionou um novo PDF, mas ele ainda não foi salvo. Clique em 'Substituir PDF' primeiro.");
            return;
        }

        this.isGeneratingQuestions = true;
        this.generatedQuestions.data = [];
        const certId = this.data.certification.id;
        console.log(`[AI Gen] Iniciando geração (POST) para ID ${certId} usando o PDF do servidor.`);

        // Chama a geração SEMPRE passando 'null' para o arquivo
        this.certificationsService.generateAiQuestions(certId, null).pipe(
            finalize(() => {
                this.isGeneratingQuestions = false;
                console.log("[AI Gen] Geração finalizada (sucesso ou erro).");
            }),
            catchError(error => {
                console.error("[AI Gen] Erro ao gerar questões (POST):", error);
                let errorMsg = 'Erro ao gerar questões.';
                if (error.status === 404) {
                    errorMsg = "Erro 404: Rota não encontrada (/questions/generate-from-pdf). Verifique o backend.";
                } else if (error.error?.message) {
                    errorMsg = Array.isArray(error.error.message) ? error.error.message.join('\n') : error.error.message;
                }
                alert(errorMsg);
                return of(null);
            })
        ).subscribe((response: ApiResponse | null) => {
            if (response && Array.isArray(response.questions) && response.questions.length > 0) {
                console.log(`[AI Gen] ${response.created} questões recebidas.`);
                alert(response.message);
                this.generatedQuestions.data = response.questions;
            } else if (response) {
                console.warn("[AI Gen] Resposta recebida, mas sem questões válidas.");
                alert(response.message || "A I.A. concluiu, mas não retornou questões válidas.");
                this.generatedQuestions.data = [];
            } else {
                this.generatedQuestions.data = [];
            }
        });
    }

    /**
     * Função chamada pelo botão "OK". Retorna o estado atualizado
     */
    saveAllQuestions(): void {
        console.log("[AI Gen] Botão OK clicado. Fechando modal.");
        this.dialogRef.close(this.data.certification); // Retorna o estado atualizado
    }
    cleanPdfFileName(originalName: string | null | undefined): string | null {
        if (!originalName) {
            return null;
        }
        
        // Assume o formato: [timestamp]-[hash]-nome_original.pdf
        const parts = originalName.split('-');
        
        // Heurística: Se tiver pelo menos 3 partes e a primeira for longa (timestamp/hash)
        if (parts.length >= 3 && parts[0].length >= 8) { 
            // Retorna tudo a partir da terceira parte (índice 2)
            return parts.slice(2).join('-').trim(); 
        } 
        
        // Se houver apenas um prefixo longo (ex: UUID-nome.pdf)
        if (parts.length > 1 && parts[0].length >= 36) {
             return parts.slice(1).join('-').trim();
        }
        
        // Retorna o nome original se não encontrar prefixo
        return originalName;
    }

    // --- Funções da Tabela (Sem alterações) ---
    getAnswerText(answer: boolean): string { return answer ? 'Verdadeiro' : 'Falso'; }
    deleteQuestion(index: number): void { /* ... seu código ... */ }
    openQuestionDetailsForEdit(question: BackendQuestion, index: number): void { /* ... seu código ... */ }
    saveQuestion(question: BackendQuestion, index: number): void { /* ... seu código ... */ }
    triggerFileInput(): void { this.fileInput?.nativeElement.click(); }
}