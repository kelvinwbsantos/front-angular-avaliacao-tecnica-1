// src/app/features/certifications/components/certification-details/certification-details.ts

import { Component, inject, Inject, OnInit, ViewChild, ElementRef } from '@angular/core'; // Removido AfterViewInit
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { Observable, catchError, finalize, of, tap } from 'rxjs';
// Imports de Models e Serviços
import { CompleteCertification, InitialCertification } from '../../../shared/models/certification.models'; 
import { CertificationsService } from '../../services/certifications.service';

// Imports para abrir o Banco de Questões
import { QuestionsPage, QuestionBankModalData } from '../../pages/questions-page/questions'; 

export interface CertificationModalData {
    certificationId: string | null;
    isCreation: boolean;
    certification?: CompleteCertification;
}

@Component({
    selector: 'app-certification-details',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, MatDialogModule,
        MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, 
        MatInputModule, MatDividerModule, MatProgressSpinnerModule, 
        MatTooltipModule, MatSlideToggleModule, 
        MatOptionModule, MatSelectModule
    ],
    templateUrl: './certification-details.html',
    styleUrl: './certification-details.scss',
})
export class CertificationDetails implements OnInit { 
    
    private readonly dialog = inject(MatDialog);
    private readonly fb = inject(FormBuilder);
    public dialogRef = inject(MatDialogRef<CertificationDetails>);
    private certificationsService = inject(CertificationsService); 
    
    // Propriedades do estado da tela
    certificationForm!: FormGroup;
    isDeleting: boolean = false;
    isLoadingDetails: boolean = false;
    isLoadingQuestions: boolean = false; // Usado para indicar "Salvando..."
    selectedFile: File | null = null;
    fileName: string = 'Nenhum arquivo selecionado';
    existingPdfFileName: string | null = null;
    
    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: CertificationModalData
    ) {}

    ngOnInit(): void {
        const certData = this.data.certification;

        console.log("Dados recebidos no modal:", this.data);
        console.log("Objeto Certification recebido:", certData);

        // --- Lógica para obter o nome do PDF ---
        if (!this.data.isCreation) { // Primeiro, verifica se está em modo Edição
            if (certData) { // DEPOIS, verifica se certData existe
                // Agora é seguro acessar as propriedades de certData
                if (certData.pdfFileName) {
                    this.existingPdfFileName = certData.pdfFileName ?? null;
                    console.log("Nome do PDF existente (via pdfFileName):", this.existingPdfFileName);
                } else if (certData.pdfPath) {
                    // Este bloco agora é seguro
                    try {
                        this.existingPdfFileName = certData.pdfPath.substring(certData.pdfPath.lastIndexOf('/') + 1);
                        console.log("Nome do PDF existente (extraído do pdfPath):", this.existingPdfFileName);
                    } catch (e) {
                        console.error("Erro ao extrair nome do PDF do path:", certData.pdfPath, e);
                        this.existingPdfFileName = 'Nome indisponível';
                    }
                } else {
                    // certData existe, mas não tem pdfFileName nem pdfPath
                    console.warn("Nenhum pdfFileName ou pdfPath encontrado para a certificação existente.");
                    this.existingPdfFileName = null;
                }
            } else {
                // Modo Edição, mas certData está faltando
                console.warn("Certificação não encontrada nos dados para modo edição.");
                this.existingPdfFileName = null;
            }
        } else {
            // Modo Criação
            this.existingPdfFileName = null;
        }
        // --- FIM DA LÓGICA REESTRUTURADA ---
        
        this.certificationForm = this.fb.group({
            name: [certData?.name || '', Validators.required], 
            shortDescription: [certData?.shortDescription || '', Validators.required],
            description: [certData?.description || ''],
            passingScore: [certData?.passingScore || 70, [Validators.required, Validators.min(0), Validators.max(100)]],
            modality: [certData?.modality || 'online', Validators.required],
            durationHours: [certData?.durationHours || 1, [Validators.required, Validators.min(1)]],
            isActive: [certData?.isActive ?? true,],
            certificationId: new FormControl<string | null>(this.data.certificationId),
            //questionsCount: new FormControl<number>(Number(certData?.questions?.length ?? 0)), 
        });

        // Lógica de carregamento inicial 
        if (!this.data.isCreation && this.data.certificationId) {
             this.isLoadingDetails = false; // Assume que os dados já vieram em 'data.certification'
        } else {
             this.isLoadingDetails = false; 
        }
    }

   onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.selectedFile = input.files[0];
            this.fileName = this.selectedFile.name;
            // Limpa o nome do PDF existente da UI para mostrar o novo
            // this.existingPdfFileName = null; // Opcional: descomentar para esconder o nome antigo imediatamente
        } else {
            this.selectedFile = null;
            this.fileName = 'Nenhum arquivo selecionado';
        }
        // Limpa o valor do input para permitir selecionar o mesmo arquivo novamente
        if (this.fileInput) {
            this.fileInput.nativeElement.value = '';
        }
    }

     /**
     * ****** FUNÇÃO 'SALVAR' (SIMPLIFICADA) ******
     * Agora ela faz UMA chamada, tanto para Criar quanto para Editar.
     */
    /**
     * FUNÇÃO SALVAR (Mantém a modal ABERTA)
     */
    saveCertificationDetails(): void {
        if (this.certificationForm.invalid) {
            this.certificationForm.markAllAsTouched();
            return;
        }

        this.isLoadingQuestions = true; // Liga spinner
        const formValue = this.certificationForm.getRawValue();
        
        let save$: Observable<CompleteCertification>;

        if (this.data.isCreation) {
             // --- CORREÇÃO AQUI ---
             // O TypeScript precisa garantir que o arquivo existe para criar
             if (!this.selectedFile) {
                alert('É necessário selecionar um arquivo PDF para criar a certificação.');
                this.isLoadingQuestions = false;
                return;
             }

             const createPayload: InitialCertification = { 
                 name: formValue.name,
                 shortDescription: formValue.shortDescription,
                 description: formValue.description,
                 passingScore: Number(formValue.passingScore),
                 modality: formValue.modality,
                 durationHours: Number(formValue.durationHours)
             };
             
             // Agora passamos 'this.selectedFile' com segurança
             save$ = this.certificationsService.createCertification(createPayload, this.selectedFile);

        } else {
             const updatePayload = { 
                 name: formValue.name,
                 shortDescription: formValue.shortDescription,
                 description: formValue.description,
                 passingScore: Number(formValue.passingScore),
                 modality: formValue.modality,
                 durationHours: Number(formValue.durationHours),
                 isActive: formValue.isActive
             };
             
             // Na edição, o arquivo pode ser null (o service aceita), então não precisa de IF
             save$ = this.certificationsService.updateCertification(this.data.certificationId!, updatePayload, this.selectedFile);
        }

        save$.pipe(
            finalize(() => this.isLoadingQuestions = false),
            catchError(error => {
                console.error('Erro ao salvar:', error);
                // Tenta extrair mensagem amigável do backend
                const msg = error.error?.message || 'Erro ao salvar. Verifique os dados.';
                alert(Array.isArray(msg) ? msg.join('\n') : msg); 
                return of(null);
            })
        ).subscribe(savedCert => {
            if (savedCert) {
                console.log('Salvo com sucesso. Modal permanece aberta.');
                
                // ATUALIZA O ESTADO DA TELA
                this.data.certification = savedCert;
                this.data.certificationId = savedCert.id;
                this.data.isCreation = false; 
                this.existingPdfFileName = savedCert.pdfFileName || null;
                this.selectedFile = null; 
                this.fileName = 'Nenhum arquivo selecionado';
            }
        });
    }
    get hasPdf(): boolean {
        // Verifica se temos um nome de arquivo na tela OU um path no objeto
        return !!this.existingPdfFileName || !!this.data.certification?.pdfPath;
    }
    /**
     * Abre o modal do Banco de Questões
     */
    openQuestionBank(): void {
        if (!this.data.certificationId) {
            console.error("ID da Certificação não encontrado para abrir o banco de questões.");
            return;
        }

        const modalData: QuestionBankModalData = {
            certificationId: this.data.certificationId,
            certificationTitle: this.data.certification?.name,
            certificationPdfPath: this.data.certification?.pdfPath || null,
            certification: this.data.certification 
        };
        

        this.dialog.open(QuestionsPage, { // <-- Abre o QuestionsComponent (Banco)
            width: '1200px', 
            maxWidth: '95vw',
            data: modalData
        }).afterClosed().subscribe(didChange => {
            if (didChange === true) {
                // TODO: Atualizar contagem de questões se necessário
                console.log("Banco de questões foi usado, recarregar contagem (TODO)");
            }
        });
    }
    /**
     * Aciona o clique no input de arquivo escondido
     */
    triggerFileInput(): void {
        this.fileInput?.nativeElement.click();
    }
    /** 
     * Apaga a certificação atual após confirmação do usuário
     * @returns 
     */
    deleteCertification(): void {
        if (!this.data.certificationId || !this.data.certification) {
            console.error("ID ou dados da certificação não encontrados para exclusão.");
            return;
        }

        const certName = this.data.certification.name || 'esta certificação';
        if (!confirm(`Tem certeza que deseja EXCLUIR "${certName}"?\nEsta ação não pode ser desfeita.`)) {
            return;
        }

        this.isDeleting = true;
        this.certificationsService.deleteCertification(this.data.certificationId).pipe(
            finalize(() => this.isDeleting = false),
            catchError(error => {
                console.error("Erro ao excluir certificação:", error);
                alert("Não foi possível excluir a certificação. Verifique o console.");
                return of(null); // Permanece no modal em caso de erro
            })
        ).subscribe(result => {
            // Se a exclusão foi bem-sucedida (não deu erro), fecha o modal
            // Retorna uma string específica para o componente pai saber que excluiu
            if (result !== null) {
                alert(`"${certName}" excluída com sucesso.`);
                this.dialogRef.close('deleted'); // <-- Sinaliza exclusão para o componente pai
            }
        });
    }
}