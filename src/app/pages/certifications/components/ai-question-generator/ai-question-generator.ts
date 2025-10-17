// Certificações: Componente de Geração de Questões com I.A. e Revisão

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

// Interfaces necessárias (Replicadas aqui para o componente ser standalone e auto-contido)
export interface Option {
    text: string;
    isCorrect: boolean;
}
export interface Question {
    id: string;
    questionText: string;
    options: Option[];
    isActive: boolean;
    validUntil: string;
    isValidated: boolean;
    createdAt: string;
}
export interface AiGeneratorModalData {
    certificationId: string; 
    certificationTitle: string; 
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

    // Estados
    isGeneratingQuestions: boolean = false;
    isSavingAll: boolean = false;
    selectedFile: File | null = null;

    // Tabela de Questões Geradas
    generatedQuestions = new MatTableDataSource<Question>([]);
    displayedColumns: string[] = ['questionText', 'correctAnswer', 'actions'];

    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: AiGeneratorModalData
    ) {}

    ngOnInit(): void {
        console.log(`Gerador I.A. aberto para: ${this.data.certificationTitle}`);
    }

    /**
     * Lógica de Seleção de Arquivo (Upload)
     */
    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.selectedFile = input.files[0];
        } else {
            this.selectedFile = null;
        }
    }

    /**
     * Simula o processo de Geração de Questões pela I.A.
     */
    generateQuestions(): void {
        if (!this.selectedFile) {
            console.warn("Nenhum arquivo selecionado.");
            return;
        }

        this.isGeneratingQuestions = true;
        
        // Simulação da chamada de I.A. e retorno dos dados
        setTimeout(() => {
            const today = new Date().toISOString().split('T')[0];

            // Mock de 5 Questões geradas pela I.A.
            const mockGenerated: Question[] = [
                { 
                    id: 'AI-1', 
                    questionText: 'Qual o principal fator que distingue um modelo de Regressão Logística de uma Regressão Linear em termos de saída?', 
                    isActive: true, 
                    validUntil: '2027-01-01', 
                    isValidated: false,
                    createdAt: today,
                    options: [
                        { text: 'Regressão Logística é mais rápida.', isCorrect: false },
                        { text: 'A saída da Regressão Logística é uma probabilidade (0 a 1).', isCorrect: true },
                        { text: 'Regressão Linear só funciona com mais de 1000 dados.', isCorrect: false },
                    ]
                },
                { 
                    id: 'AI-2', 
                    questionText: 'Descreva em poucas palavras o que é um "Conjunto de Validação Cruzada" (Cross-Validation Set).', 
                    isActive: true, 
                    validUntil: '2027-01-01', 
                    isValidated: false,
                    createdAt: today,
                    options: [] // Questão dissertativa/aberta simulada
                },
                { 
                    id: 'AI-3', 
                    questionText: 'Qual biblioteca Python é comumente usada para manipulação de dados em aprendizado de máquina?', 
                    isActive: true, 
                    validUntil: '2027-01-01', 
                    isValidated: false,
                    createdAt: today,
                    options: [
                        { text: 'TensorFlow', isCorrect: false },
                        { text: 'Pandas', isCorrect: true },
                        { text: 'Pygame', isCorrect: false },
                    ]
                },
                { 
                    id: 'AI-4', 
                    questionText: 'O que o *Epoch* representa no treinamento de redes neurais?', 
                    isActive: false, 
                    validUntil: '2027-01-01', 
                    isValidated: false,
                    createdAt: today,
                    options: [
                        { text: 'Apenas uma passagem completa de todo o conjunto de treinamento.', isCorrect: true },
                        { text: 'O número de camadas ocultas da rede.', isCorrect: false },
                        { text: 'O tamanho do lote de dados.', isCorrect: false },
                    ]
                },
            ];

            this.generatedQuestions.data = mockGenerated;
            this.isGeneratingQuestions = false;
        }, 3000);
    }

    /**
     * Simula o salvamento de TODAS as questões geradas no banco de dados.
     * @returns boolean | Question[] (dependendo do que o chamador espera)
     */
    saveAllQuestions(): void {
        this.isSavingAll = true;
        console.log("Salvando todas as questões no Firestore:", this.generatedQuestions.data);

        setTimeout(() => {
            this.isSavingAll = false;
            // Retorna a lista de questões salvas para o componente pai
            this.dialogRef.close(true); 
        }, 1500);
    }

    /**
     * Simula o salvamento de uma única questão gerada.
     */
    saveQuestion(question: Question, index: number): void {
        console.log(`Salvando questão ${question.id} individualmente e fechando...`);
        // Aqui, você faria a chamada real de salvamento da questão individual.
        
        // Simulação de delay de save
        setTimeout(() => {
             // Fecha a modal e retorna true para recarregar a lista principal
            this.dialogRef.close(true); 
        }, 500);
    }
    
    /**
     * Função auxiliar para a tabela: retorna o texto da opção correta.
     */
    getCorrectOptionText(question: Question): string {
        const correctOption = question.options.find(opt => opt.isCorrect);
        return correctOption ? correctOption.text : '(Dissertativa ou Sem Opção Correta)';
    }

    /**
     * Remove uma questão da lista de revisão (apenas localmente).
     */
    deleteQuestion(index: number): void {
        const data = this.generatedQuestions.data;
        data.splice(index, 1);
        this.generatedQuestions.data = data; // Atualiza a fonte de dados
    }

    /**
     * Abre um novo modal para editar os detalhes da questão.
     */
    openQuestionDetailsForEdit(question: Question, index: number): void {
        console.log(`Abrindo modal de edição para Questão ID: ${question.id}`);
        // Lógica para abrir um modal de edição de questão (não implementado aqui, apenas simulação)
    }

    /**
     * Dispara o clique no input de arquivo
     */
    triggerFileInput(): void {
        this.fileInput.nativeElement.click();
    }
}



// import { Component, inject, Inject, OnInit } from '@angular/core';
// import { MAT_DIALOG_DATA, MatDialogRef, MatDialog, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { MatCardModule } from '@angular/material/card';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { MatDividerModule } from '@angular/material/divider';
// import { MatTooltipModule } from '@angular/material/tooltip';
// import { MatTableDataSource, MatTableModule } from '@angular/material/table';
// import { SlicePipe } from '@angular/common'; 
// import { Question, QuestionOption } from '../../services/certifications.service'; 
// import { QuestionDetails, QuestionModalData } from '../questions/question-details'; 

// // Interface de dados para o novo modal
// export interface AiGeneratorModalData {
//     certificationId: string; // ID da certificação existente
//     certificationTitle: string; // Título para referência
// }

// @Component({
//     selector: 'app-ai-question-generator',
//     standalone: true,
//     // Importa todos os módulos necessários para o template de geração/revisão
//     imports: [
//         MatDialogTitle, MatDialogContent, MatDialogActions, MatButtonModule, 
//         MatIconModule, MatCardModule, MatProgressSpinnerModule, MatDividerModule, 
//         MatTableModule, MatTooltipModule, SlicePipe
//     ],
//     templateUrl: './ai-question-generator.html',
//     styleUrl: './ai-question-generator.scss',
// })
// export class AiQuestionGenerator implements OnInit {
    
//     private readonly dialog = inject(MatDialog);
//     public readonly dialogRef = inject(MatDialogRef<AiQuestionGenerator>); 

//     isGeneratingQuestions = false; 
//     isSavingAll = false;
    
//     selectedFile: File | null = null;
//     fileName = 'Nenhum arquivo selecionado';

//     // Tabela de Questões Geradas (Pendentes de Revisão)
//     generatedQuestions = new MatTableDataSource<Question>([]);
//     displayedColumns: string[] = ['questionText', 'correctAnswer', 'actions'];


//     constructor(@Inject(MAT_DIALOG_DATA) public data: AiGeneratorModalData) { }

//     ngOnInit(): void {
//         console.log(`Abrindo gerador de I.A. para Certificação ID: ${this.data.certificationId}`);
//     }

//     onFileSelected(event: Event): void {
//         const input = event.target as HTMLInputElement;
//         if (input.files && input.files.length > 0) {
//             this.selectedFile = input.files[0];
//             this.fileName = this.selectedFile.name;
//         } else {
//             this.selectedFile = null;
//             this.fileName = 'Nenhum arquivo selecionado';
//         }
//     }

//     /**
//      * Simula o upload do arquivo e a chamada à I.A. para gerar questões.
//      */
//     generateQuestions(): void {
//         if (!this.selectedFile) {
//             console.error('Arquivo PDF é obrigatório para gerar questões.');
//             return;
//         }

//         this.isGeneratingQuestions = true; 
//         this.generatedQuestions.data = []; // Limpa a lista antes de gerar
//         console.log('Iniciando geração de questões para:', this.selectedFile.name);

//         setTimeout(() => {
//             this.isGeneratingQuestions = false; 
            
//             // Simulação de 3 questões geradas pela IA
//             const aiGenerated: Question[] = [
//                 { id: '113', questionText: 'Qual o ciclo de vida de um componente Angular?', options: [{text: 'A resposta correta.', isCorrect: true, id: 'o1'} as QuestionOption, {text: 'A resposta errada.', isCorrect: false, id: 'o2'} as QuestionOption], isActive: true, validUntil: '2025-12-31', isValidated: false, createdAt: new Date().toISOString().split('T')[0] },
//                 { id: '114', questionText: 'Para que serve o OnPush ChangeDetectionStrategy?', options: [{text: 'Performance.', isCorrect: true, id: 'o3'} as QuestionOption, {text: 'Simplicidade.', isCorrect: false, id: 'o4'} as QuestionOption], isActive: true, validUntil: '2025-12-31', isValidated: false, createdAt: new Date().toISOString().split('T')[0] },
//                 { id: '115', questionText: 'O que são Signals no Angular?', options: [{text: 'Nova reatividade.', isCorrect: true, id: 'o5'} as QuestionOption, {text: 'Novo roteamento.', isCorrect: false, id: 'o6'} as QuestionOption], isActive: true, validUntil: '2025-12-31', isValidated: false, createdAt: new Date().toISOString().split('T')[0] },
//             ];
            
//             this.generatedQuestions.data = aiGenerated;
//             console.log('Questões geradas com sucesso. Prontas para revisão.');
            
//         }, 3000);
//     }

//     /**
//      * Salva todas as questões geradas (pendentes) e fecha o modal, retornando-as.
//      */
//     public saveAllQuestions(): void {
//         if (this.generatedQuestions.data.length === 0) {
//             console.warn('Não há questões geradas para salvar.');
//             return;
//         }

//         this.isSavingAll = true;
//         console.log('Iniciando salvamento em lote...');

//         setTimeout(() => {
//             this.isSavingAll = false;
//             // Retorna a lista de questões validadas para o modal pai (CertificationDetails)
//             this.dialogRef.close({ 
//                 success: true, 
//                 newQuestions: this.generatedQuestions.data.map(q => ({...q, isValidated: true}))
//             });
//             console.log('Todas as questões foram salvas com sucesso!');
//         }, 1500);
//     }

//     /**
//      * Obtém o texto da opção correta.
//      */
//     getCorrectOptionText(question: Question): string {
//         const correctOption = question.options?.find(opt => opt.isCorrect); 
//         return correctOption ? correctOption.text : 'N/A';
//     }

//     /**
//      * Abre modal de detalhes/edição da questão gerada.
//      */
//     openQuestionDetailsForEdit(question: Question, index: number): void {
//         const data: QuestionModalData = {
//             question: question,
//             isCreation: false,
//             isAiGenerated: true
//         };

//         this.dialog.open(QuestionDetails, {
//             width: '600px',
//             data: data
//         }).afterClosed().subscribe(result => {
//             if (result) {
//                 // Atualiza a questão editada na lista generatedQuestions
//                 const currentGenerated = this.generatedQuestions.data;
//                 currentGenerated[index] = {...question, ...result};
//                 this.generatedQuestions.data = [...currentGenerated];
//             }
//         });
//     }

//     /**
//      * Salva uma questão gerada individualmente.
//      */
//     saveQuestion(question: Question, index: number): void {
//         console.log(`Salvando questão gerada no índice ${index} individualmente.`);
        
//         const savedQuestion = {...question, isValidated: true};
        
//         const currentGenerated = this.generatedQuestions.data;
//         currentGenerated.splice(index, 1);
//         this.generatedQuestions.data = [...currentGenerated];

//         // Fecha o modal retornando *apenas* essa questão
//         this.dialogRef.close({ 
//             success: true, 
//             newQuestions: [savedQuestion] 
//         });
//     }

//     /**
//      * Deleta uma questão gerada (descarta).
//      */
//     deleteQuestion(index: number): void {
//         console.log(`Descartando questão gerada no índice ${index}.`);
//         const currentGenerated = this.generatedQuestions.data;
//         currentGenerated.splice(index, 1);
//         this.generatedQuestions.data = [...currentGenerated];
//     }
// }
