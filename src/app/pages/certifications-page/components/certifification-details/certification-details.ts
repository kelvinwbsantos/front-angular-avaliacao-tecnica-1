// src/app/pages/certifications/components/certification-details/certification-details.ts
// v9.0 - Limpo: Removeu lógica da tabela de questões interna

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
import { Certification, CertificationPayloadDTO } from '../../models/certification-models'; 
import { CertificationsService } from '../../services/certifications.service';
import { AiQuestionGenerator, AiGeneratorModalData } from '../../../ai-question-generator-page/ai-question-generator';

// Imports para abrir o Banco de Questões
import { QuestionsPage, QuestionBankModalData } from '../../../questions-page/questions'; 

export interface CertificationModalData {
    certificationId: string | null;
    isCreation: boolean;
    certification?: Certification;
}

@Component({
    selector: 'app-certification-details',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, MatDialogModule,
        MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, 
        MatInputModule, MatDividerModule, MatProgressSpinnerModule, 
        MatTooltipModule, MatSlideToggleModule, // Removido MatTableModule, MatPaginatorModule
        MatOptionModule, MatSelectModule
    ],
    templateUrl: './certification-details.html',
    styleUrl: './certification-details.scss',
})
export class CertificationDetails implements OnInit { // Removido AfterViewInit
    
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

    saveCertificationDetails(shouldClose: boolean): void {
        if (this.certificationForm.invalid) {
            console.warn("Formulário inválido.");
            this.certificationForm.markAllAsTouched();
            return;
        }

        this.isLoadingQuestions = true;
        const formValue = this.certificationForm.getRawValue();

        if (this.data.isCreation) {
            // --- MODO CRIAÇÃO (POST com FormData) ---

            // CORREÇÃO: A definição de createPayload estava faltando aqui.
            const createPayload: CertificationPayloadDTO = {
                name: formValue.name!,
                shortDescription: formValue.shortDescription!,
                description: formValue.description!,
                passingScore: Number(formValue.passingScore!),
                modality: formValue.modality!,
                durationHours: Number(formValue.durationHours!),
           };
            // Fim da correção

            console.log("Chamando createCertification com createPayload:", createPayload);
            this.certificationsService.createCertification(createPayload, this.selectedFile!).pipe(
                tap(savedCert => {
                    console.log('Certificação criada com sucesso:', savedCert);
                    this.data.certification = savedCert;
                    this.data.certificationId = savedCert.id.toString();
                    this.data.isCreation = false;
                    this.existingPdfFileName = savedCert.pdfFileName || null; // Atualiza nome do PDF
                }),
                catchError(error => {
                     console.error('Erro ao criar certificação:', error);
                     let errorMsg = 'Erro ao criar. Verifique o console.';
                     if (error.error?.message) {
                        errorMsg = Array.isArray(error.error.message) ? error.error.message.join('\n') : error.error.message;
                     }
                     alert(errorMsg);
                    return of(null);
                }),
                finalize(() => this.isLoadingQuestions = false)
            ).subscribe(result => {
                if (result && shouldClose) {
                    this.dialogRef.close(true);
                }
            });

        } else {
            // --- MODO EDIÇÃO (PATCH para texto, depois POST/PUT para PDF) ---
            if (!this.data.certificationId) {
                console.error('Erro: ID da certificação não encontrado para atualização.');
                this.isLoadingQuestions = false;
                return;
            }
            const updatePayload: Partial<Certification> = {
                name: formValue.name!,
                shortDescription: formValue.shortDescription!,
                description: formValue.description!,
                passingScore: Number(formValue.passingScore!),
                modality: formValue.modality!,
                durationHours: Number(formValue.durationHours!),
                isActive: formValue.isActive!
            };

            // 1. Salva os dados de texto primeiro
            this.certificationsService.updateCertification(this.data.certificationId, updatePayload).pipe(
                tap(savedCert => {
                    console.log('Dados da certificação atualizados:', savedCert);
                    this.data.certification = savedCert;
                    this.existingPdfFileName = savedCert.pdfFileName || null;
                }),
                catchError(error => {
                    console.error('Erro ao atualizar dados da certificação:', error);
                    let errorMsg = 'Erro ao salvar alterações. Verifique o console.';
                     if (error.error?.message) {
                        errorMsg = Array.isArray(error.error.message) ? error.error.message.join('\n') : error.error.message;
                    }
                    alert(errorMsg);
                    this.isLoadingQuestions = false;
                    return of(null);
                })
            ).subscribe(updateResult => {
                if (!updateResult) { return; }

                // 2. Se um NOVO arquivo foi selecionado, faz o upload
                if (this.selectedFile) {
                    console.log(`Atualização de dados OK. Fazendo upload do novo PDF: ${this.selectedFile.name}`);
                    this.certificationsService.uploadCertificationPdf(this.data.certificationId!, this.selectedFile).pipe(
                        finalize(() => {
                             this.isLoadingQuestions = false;
                             if (shouldClose) this.dialogRef.close(true);
                        }),
                        catchError(uploadError => {
                            console.error('Erro ao fazer upload do PDF:', uploadError);
                            alert('Os dados foram salvos, mas houve um erro ao enviar o novo PDF.');
                            return of(null);
                        }),
                        // Atualiza o nome do PDF exibido após o upload
                        tap(uploadResult => {
                            if (uploadResult) {
                                this.existingPdfFileName = uploadResult.pdfFileName || null;
                            }
                        })
                    ).subscribe(uploadResult => {
                         if (uploadResult) {
                            console.log("Upload do PDF concluído com sucesso.");
                            this.selectedFile = null;
                            this.fileName = 'Nenhum arquivo selecionado';
                         }
                    });

                } else {
                    // Se não havia arquivo novo, finaliza
                    this.isLoadingQuestions = false;
                    if (shouldClose) this.dialogRef.close(true);
                }
            });
        }
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
            certificationPdfPath: this.data.certification?.pdfPath || null 
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