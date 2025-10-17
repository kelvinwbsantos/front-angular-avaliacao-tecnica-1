// src/app/pages/certifications/components/certification-details/certification-details.ts

//v8.1 - Correção de tipagem e Inclusão do Título no Modal I.A.
import { Component, inject, Inject, OnInit, ViewChild, AfterViewInit } from '@angular/core';
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
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { Certification, Question } from '../../services/certifications.service'; // Assumindo Question interface

// Importa o Gerador de Questões
import { AiQuestionGenerator, AiGeneratorModalData } from '../ai-question-generator/ai-question-generator';

// Interfaces (MANTIDAS)
export interface CertificationModalData {
	certificationId: string | null;
	isCreation: boolean;
	certification?: Certification;
}

// Interface de Exemplo para a Tabela de Questões
interface QuestionRow extends Question {
	validUntil: string;
}

@Component({
	selector: 'app-certification-details',
	standalone: true,
	imports: [
		CommonModule, ReactiveFormsModule, MatDialogModule,
		MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, 
		MatInputModule, MatDividerModule, MatProgressSpinnerModule, 
		MatTooltipModule, MatTableModule, MatPaginatorModule
	],
	templateUrl: './certification-details.html',
	styleUrl: './certification-details.scss',
})
export class CertificationDetails implements OnInit, AfterViewInit {
	private readonly dialog = inject(MatDialog);
	private readonly fb = inject(FormBuilder);
	public dialogRef = inject(MatDialogRef<CertificationDetails>);
	
	// PROPRIEDADES DO FORMULÁRIO E ESTADO
	certificationForm!: FormGroup;
	isLoadingDetails: boolean = false;
	isLoadingQuestions: boolean = false;
	selectedFile: File | null = null;
	fileName: string = 'Nenhum arquivo selecionado';

	// PROPRIEDADES DA TABELA DE QUESTÕES
	displayedColumns: string[] = ['id', 'questionText', 'isActive', 'validUntil', 'actions'];
	dataSource = new MatTableDataSource<QuestionRow>();
	@ViewChild(MatPaginator) paginator!: MatPaginator;

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: CertificationModalData
	) {}

	ngOnInit(): void {
		// Garante que a contagem de questões seja um Number
		const initialQuestionsCount = Number(this.data.certification?.questions?.length ?? 0);
		
		this.certificationForm = this.fb.group({
			title: [this.data.certification?.title || '', Validators.required],
			description: [this.data.certification?.description || ''],
			// Adicionado para controle interno e tipagem correta
			certificationId: new FormControl<string | null>(this.data.certificationId),
			questionsCount: new FormControl<number>(initialQuestionsCount),
		});

		if (!this.data.isCreation) {
			this.loadQuestions();
		}
	}

	ngAfterViewInit() {
		this.dataSource.paginator = this.paginator;
	}

	// SIMULAÇÃO DE CARREGAMENTO DE QUESTÕES
	loadQuestions(): void {
		this.isLoadingQuestions = true;
		
		// Dados simulados AGORA COMPATÍVEIS com a interface Question
		const mockQuestions: QuestionRow[] = [
			// Questão 1: Múltipla Escolha
			{ 
				id: 'Q1', 
				questionText: 'Qual a definição de Machine Learning?', 
				isActive: true, 
				validUntil: '2026-01-01', 
				isValidated: true,
				createdAt: '2025-10-10',
				options: [
					{ text: 'Um algoritmo que aprende com dados sem ser explicitamente programado.', isCorrect: true },
					{ text: 'Um tipo de linguagem de programação orientada a objetos.', isCorrect: false },
					{ text: 'Apenas uma técnica de banco de dados.', isCorrect: false },
				]
			},
			// Questão 2: Dissertativa (Opcional: usar options vazias)
			{ 
				id: 'Q2', 
				questionText: 'Explique a diferença entre overfitting e underfitting.', 
				isActive: true, 
				validUntil: '2026-01-01', 
				isValidated: true,
				createdAt: '2025-10-10',
				options: [] 
			},
			// Questão 3: Múltipla Escolha (Inativa)
			{ 
				id: 'Q3', 
				questionText: 'O que é um algoritmo de classificação?', 
				isActive: false, 
				validUntil: '2025-12-31', 
				isValidated: false,
				createdAt: '2025-10-10',
				options: [
					{ text: 'Um algoritmo que prevê um valor contínuo.', isCorrect: false },
					{ text: 'Um algoritmo que atribui rótulos a dados de entrada.', isCorrect: true },
					{ text: 'Um algoritmo que reduz a dimensionalidade.', isCorrect: false },
				]
			},
            // Questão 4: Múltipla Escolha (Mais uma para lista)
            { 
				id: 'Q4', 
				questionText: 'Qual a principal função do pré-processamento de dados?', 
				isActive: true, 
				validUntil: '2026-06-15', 
				isValidated: true,
				createdAt: '2025-10-10',
				options: [
					{ text: 'Tornar os dados mais claros e eficientes para a modelagem.', isCorrect: true },
					{ text: 'Aumentar o tempo de treinamento do modelo.', isCorrect: false },
					{ text: 'Diminuir a acurácia do modelo.', isCorrect: false },
				]
			},
		];

		setTimeout(() => {
			this.dataSource.data = mockQuestions;
			// Atualiza a contagem no formulário (se necessário)
			this.certificationForm.get('questionsCount')?.setValue(mockQuestions.length);
			this.isLoadingQuestions = false;
		}, 800);
	}

	// MÉTODO PARA SELECIONAR ARQUIVO PDF
	onFileSelected(event: Event): void {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			this.selectedFile = input.files[0];
			this.fileName = this.selectedFile.name;
		} else {
			this.selectedFile = null;
			this.fileName = 'Nenhum arquivo selecionado';
		}
	}

	/**
	 * MÉTODO PRINCIPAL DE SALVAR DETALHES (USADO NA EDIÇÃO)
	 */
	saveCertificationDetails(shouldClose: boolean): void {
		if (this.certificationForm.invalid) {
			console.warn("Formulário inválido.");
			return;
		}
		this.isLoadingQuestions = true; // Usando o mesmo loader para o save
		console.log("Salvando detalhes da certificação...");
		
		setTimeout(() => {
			this.isLoadingQuestions = false;
			if (shouldClose) {
				this.dialogRef.close(true); 
			} else {
				// Em caso de "Salvar" sem fechar, apenas recarrega os detalhes/tabela
			}
		}, 700);
	}

	/**
	 * 1. Salva a certificação (se for nova) e faz o upload do arquivo.
	 * 2. Abre a modal de I.A.
	 */
	generateQuestions(): void {
		if (this.certificationForm.invalid || !this.selectedFile) {
			console.warn("Formulário inválido ou PDF não selecionado.");
			return;
		}

		this.isLoadingQuestions = true;
		console.log("1. Simulação: Salvando Certificação e Upload do PDF...");

		// Simulação de delay de save/upload
		setTimeout(() => {
			// Aqui, simulamos que o save gerou um ID (que é string)
			const tempCertId: string = this.data.certificationId || 'new-cert-123';
			console.log(`2. Certificação salva (ID: ${tempCertId}). Abrindo Gerador de I.A...`);
			
			this.openAiGenerator(tempCertId);
		}, 1000);
	}

	/**
	 * Funções auxiliares para abrir modais
	 */

	// Unifica a lógica de chamada ao Gerador de I.A.
	private openAiGenerator(certId: string): void {
        // CORREÇÃO: Puxa o título do formulário para passar para a modal I.A.
        const title = this.certificationForm.get('title')?.value || 'Certificação Sem Título';

		const aiData: AiGeneratorModalData = { 
            certificationId: certId,
            certificationTitle: title // PROPRIEDADE OBRIGATÓRIA ADICIONADA
        };

		this.dialog.open(AiQuestionGenerator, {
			width: '600px',
			data: aiData,
		}).afterClosed().subscribe(result => {
			this.isLoadingQuestions = false; // Desativa o loader após o retorno
			if (result === true) {
				console.log("Questões geradas com sucesso. Recarregando tabela.");
				this.loadQuestions(); // Recarrega a tabela de questões
			}
		});
	}

	// Método unificado para abertura de detalhes de questão ou Gerador de I.A.
	openQuestionDetails(question?: Question, isAi: boolean = false): void {
		if (!this.data.certificationId) {
			console.error("ID da Certificação não encontrado.");
			return;
		}

		// Se isAi for verdadeiro, chama o gerador de I.A.
		if (isAi) {
			this.isLoadingQuestions = true; // Ativa o loader enquanto a modal está aberta
			this.openAiGenerator(this.data.certificationId);
			return;
		}
		
		// Lógica existente para abrir detalhes de uma questão (a ser implementada)
		console.log(question ? `Abrindo detalhes da Questão ID: ${question.id}` : 'Abrindo modal de Nova Questão manual');
	}
}

//v8.0 - Versão final com Gerador de I.A. integrado
// import { Component, inject, Inject, OnInit, ViewChild, AfterViewInit } from '@angular/core';
// import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
// import { MatCardModule } from '@angular/material/card';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { CommonModule } from '@angular/common';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatDividerModule } from '@angular/material/divider';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { MatTooltipModule } from '@angular/material/tooltip';
// import { MatTableDataSource, MatTableModule } from '@angular/material/table';
// import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
// import { Certification, Question } from '../../services/certifications.service'; // Assumindo Question interface

// // Importa o Gerador de Questões
// import { AiQuestionGenerator, AiGeneratorModalData } from '../ai-question-generator/ai-question-generator';

// // Interfaces (MANTIDAS)
// export interface CertificationModalData {
// 	certificationId: string | null;
// 	isCreation: boolean;
// 	certification?: Certification;
// }

// // Interface de Exemplo para a Tabela de Questões
// interface QuestionRow extends Question {
// 	validUntil: string;
// }

// @Component({
// 	selector: 'app-certification-details',
// 	standalone: true,
// 	imports: [
// 		CommonModule, ReactiveFormsModule, MatDialogModule,
// 		MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, 
// 		MatInputModule, MatDividerModule, MatProgressSpinnerModule, 
// 		MatTooltipModule, MatTableModule, MatPaginatorModule
// 	],
// 	templateUrl: './certification-details.html',
// 	styleUrl: './certification-details.scss',
// })
// export class CertificationDetails implements OnInit, AfterViewInit { // Implementação de AfterViewInit adicionada
// 	private readonly dialog = inject(MatDialog);
// 	private readonly fb = inject(FormBuilder);
// 	public dialogRef = inject(MatDialogRef<CertificationDetails>);
	
// 	// PROPRIEDADES DO FORMULÁRIO E ESTADO
// 	certificationForm!: FormGroup;
// 	isLoadingDetails: boolean = false;
// 	isLoadingQuestions: boolean = false;
// 	selectedFile: File | null = null;
// 	fileName: string = 'Nenhum arquivo selecionado';

// 	// PROPRIEDADES DA TABELA DE QUESTÕES
// 	displayedColumns: string[] = ['id', 'questionText', 'isActive', 'validUntil', 'actions'];
// 	dataSource = new MatTableDataSource<QuestionRow>();
// 	@ViewChild(MatPaginator) paginator!: MatPaginator;

// 	constructor(
// 		@Inject(MAT_DIALOG_DATA) public data: CertificationModalData
// 	) {}

// 	ngOnInit(): void {
// 		// Garante que a contagem de questões seja um Number
// 		const initialQuestionsCount = Number(this.data.certification?.questions?.length ?? 0);
		
// 		this.certificationForm = this.fb.group({
// 			title: [this.data.certification?.title || '', Validators.required],
// 			description: [this.data.certification?.description || ''],
// 			// Adicionado para controle interno e tipagem correta
// 			certificationId: new FormControl<string | null>(this.data.certificationId),
// 			questionsCount: new FormControl<number>(initialQuestionsCount),
// 		});

// 		if (!this.data.isCreation) {
// 			this.loadQuestions();
// 		}
// 	}

// 	ngAfterViewInit() {
// 		this.dataSource.paginator = this.paginator;
// 	}

// 	// SIMULAÇÃO DE CARREGAMENTO DE QUESTÕES
// 	loadQuestions(): void {
// 		this.isLoadingQuestions = true;
		
// 		// Dados simulados
// 		const mockQuestions: QuestionRow[] = [
// 			{ id: 'Q1', questionText: 'Qual a definição de Machine Learning?', isActive: true, validUntil: '2026-01-01', type: 'multiple_choice' },
// 			{ id: 'Q2', questionText: 'Explique a diferença entre overfitting e underfitting.', isActive: true, validUntil: '2026-01-01', type: 'essay' },
// 			{ id: 'Q3', questionText: 'O que é um algoritmo de classificação?', isActive: false, validUntil: '2025-12-31', type: 'multiple_choice' },
// 		];

// 		setTimeout(() => {
// 			this.dataSource.data = mockQuestions;
// 			// Atualiza a contagem no formulário (se necessário)
// 			this.certificationForm.get('questionsCount')?.setValue(mockQuestions.length);
// 			this.isLoadingQuestions = false;
// 		}, 800);
// 	}

// 	// MÉTODO PARA SELECIONAR ARQUIVO PDF
// 	onFileSelected(event: Event): void {
// 		const input = event.target as HTMLInputElement;
// 		if (input.files && input.files.length > 0) {
// 			this.selectedFile = input.files[0];
// 			this.fileName = this.selectedFile.name;
// 		} else {
// 			this.selectedFile = null;
// 			this.fileName = 'Nenhum arquivo selecionado';
// 		}
// 	}

// 	/**
// 	 * MÉTODO PRINCIPAL DE SALVAR DETALHES (USADO NA EDIÇÃO)
// 	 */
// 	saveCertificationDetails(shouldClose: boolean): void {
// 		if (this.certificationForm.invalid) {
// 			console.warn("Formulário inválido.");
// 			return;
// 		}
// 		this.isLoadingQuestions = true; // Usando o mesmo loader para o save
// 		console.log("Salvando detalhes da certificação...");
		
// 		setTimeout(() => {
// 			this.isLoadingQuestions = false;
// 			if (shouldClose) {
// 				this.dialogRef.close(true); 
// 			} else {
// 				// Em caso de "Salvar" sem fechar, apenas recarrega os detalhes/tabela
// 			}
// 		}, 700);
// 	}

// 	/**
// 	 * 1. Salva a certificação (se for nova) e faz o upload do arquivo.
// 	 * 2. Abre a modal de I.A.
// 	 */
// 	generateQuestions(): void {
// 		if (this.certificationForm.invalid || !this.selectedFile) {
// 			console.warn("Formulário inválido ou PDF não selecionado.");
// 			return;
// 		}

// 		this.isLoadingQuestions = true;
// 		console.log("1. Simulação: Salvando Certificação e Upload do PDF...");

// 		// Simulação de delay de save/upload
// 		setTimeout(() => {
// 			// Aqui, simulamos que o save gerou um ID (que é string)
// 			const tempCertId: string = this.data.certificationId || 'new-cert-123';
// 			console.log(`2. Certificação salva (ID: ${tempCertId}). Abrindo Gerador de I.A...`);
			
// 			this.openAiGenerator(tempCertId);
// 		}, 1000);
// 	}

// 	/**
// 	 * Funções auxiliares para abrir modais
// 	 */

// 	// Unifica a lógica de chamada ao Gerador de I.A.
// 	private openAiGenerator(certId: string): void {
// 		const aiData: AiGeneratorModalData = { certificationId: certId };

// 		this.dialog.open(AiQuestionGenerator, {
// 			width: '600px',
// 			data: aiData,
// 		}).afterClosed().subscribe(result => {
// 			this.isLoadingQuestions = false; // Desativa o loader após o retorno
// 			if (result === true) {
// 				console.log("Questões geradas com sucesso. Recarregando tabela.");
// 				this.loadQuestions(); // Recarrega a tabela de questões
// 			}
// 		});
// 	}

// 	// Método unificado para abertura de detalhes de questão ou Gerador de I.A.
// 	openQuestionDetails(question?: Question, isAi: boolean = false): void {
// 		if (!this.data.certificationId) {
// 			console.error("ID da Certificação não encontrado.");
// 			return;
// 		}

// 		// Se isAi for verdadeiro, chama o gerador de I.A.
// 		if (isAi) {
// 			this.isLoadingQuestions = true; // Ativa o loader enquanto a modal está aberta
// 			this.openAiGenerator(this.data.certificationId);
// 			return;
// 		}
		
// 		// Lógica existente para abrir detalhes de uma questão (a ser implementada)
// 		console.log(question ? `Abrindo detalhes da Questão ID: ${question.id}` : 'Abrindo modal de Nova Questão manual');
// 	}
// }

//v7.0 - Versão final com Gerador de I.A. integrado
// import { Component, inject, Inject, OnInit, ViewChild } from '@angular/core';
// import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
// import { MatCardModule } from '@angular/material/card';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { CommonModule } from '@angular/common';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatDividerModule } from '@angular/material/divider';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { MatTooltipModule } from '@angular/material/tooltip';
// import { MatTableDataSource, MatTableModule } from '@angular/material/table';
// import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
// import { Certification, Question } from '../../services/certifications.service'; // Assumindo Question interface

// // Importa o Gerador de Questões
// import { AiQuestionGenerator, AiGeneratorModalData } from '../ai-question-generator/ai-question-generator';

// // Interfaces (MANTIDAS)
// export interface CertificationModalData {
//   certificationId: string | null;
//   isCreation: boolean;
//   certification?: Certification;
// }

// // Interface de Exemplo para a Tabela de Questões
// // OBS: Ajuste esta interface para refletir a estrutura real do seu backend
// interface QuestionRow extends Question {
//     validUntil: string;
// }

// @Component({
//   selector: 'app-certification-details',
//   standalone: true,
//   imports: [
//     CommonModule, ReactiveFormsModule, MatDialogModule,
//     MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, 
//     MatInputModule, MatDividerModule, MatProgressSpinnerModule, 
//     MatTooltipModule, MatTableModule, MatPaginatorModule
//   ],
//   templateUrl: './certification-details.html',
//   styleUrl: './certification-details.scss',
// })
// export class CertificationDetails implements OnInit {
//   private readonly dialog = inject(MatDialog);
//   private readonly fb = inject(FormBuilder);
//   public dialogRef = inject(MatDialogRef<CertificationDetails>);
  
//   // PROPRIEDADES DO FORMULÁRIO E ESTADO (Adicionadas para compilar com o novo HTML)
//   certificationForm!: FormGroup;
//   isLoadingDetails: boolean = false;
//   isLoadingQuestions: boolean = false;
//   selectedFile: File | null = null;
//   fileName: string = 'Nenhum arquivo selecionado';

//   // PROPRIEDADES DA TABELA DE QUESTÕES
//   displayedColumns: string[] = ['id', 'questionText', 'isActive', 'validUntil', 'actions'];
//   dataSource = new MatTableDataSource<QuestionRow>();
//   @ViewChild(MatPaginator) paginator!: MatPaginator;

//   constructor(
//     @Inject(MAT_DIALOG_DATA) public data: CertificationModalData
//   ) {}

//   ngOnInit(): void {
//     this.certificationForm = this.fb.group({
//       title: [this.data.certification?.title || '', Validators.required],
//       description: [this.data.certification?.description || ''],
//     });

//     if (!this.data.isCreation) {
//       this.loadQuestions();
//     }
//   }

//   ngAfterViewInit() {
//     this.dataSource.paginator = this.paginator;
//   }

//   // SIMULAÇÃO DE CARREGAMENTO DE QUESTÕES
//   loadQuestions(): void {
//     this.isLoadingQuestions = true;
    
//     // Dados simulados
//     const mockQuestions: QuestionRow[] = [
//       { id: 'Q1', questionText: 'Qual a definição de Machine Learning?', isActive: true, validUntil: '2026-01-01', type: 'multiple_choice' },
//       { id: 'Q2', questionText: 'Explique a diferença entre overfitting e underfitting.', isActive: true, validUntil: '2026-01-01', type: 'essay' },
//       { id: 'Q3', questionText: 'O que é um algoritmo de classificação?', isActive: false, validUntil: '2025-12-31', type: 'multiple_choice' },
//     ];

//     setTimeout(() => {
//       this.dataSource.data = mockQuestions;
//       this.isLoadingQuestions = false;
//     }, 800);
//   }

//   // MÉTODO PARA SELECIONAR ARQUIVO PDF
//   onFileSelected(event: Event): void {
//     const input = event.target as HTMLInputElement;
//     if (input.files && input.files.length > 0) {
//       this.selectedFile = input.files[0];
//       this.fileName = this.selectedFile.name;
//     } else {
//       this.selectedFile = null;
//       this.fileName = 'Nenhum arquivo selecionado';
//     }
//   }

//   /**
//    * MÉTODO PRINCIPAL DE SALVAR DETALHES (USADO NA EDIÇÃO)
//    */
//   saveCertificationDetails(shouldClose: boolean): void {
//       if (this.certificationForm.invalid) {
//           console.warn("Formulário inválido.");
//           return;
//       }
//       this.isLoadingQuestions = true; // Usando o mesmo loader para o save
//       console.log("Salvando detalhes da certificação...");
      
//       setTimeout(() => {
//         this.isLoadingQuestions = false;
//         if (shouldClose) {
//             this.dialogRef.close(true); 
//         } else {
//             // Em caso de "Salvar" sem fechar, apenas recarrega os detalhes/tabela
//             // Em caso de criação, você obteria o novo ID aqui
//         }
//       }, 700);
//   }

//   /**
//    * 1. Salva a certificação (se for nova) e faz o upload do arquivo.
//    * 2. Abre a modal de I.A.
//    */
//   generateQuestions(): void {
//     if (this.certificationForm.invalid || !this.selectedFile) {
//       console.warn("Formulário inválido ou PDF não selecionado.");
//       return;
//     }

//     this.isLoadingQuestions = true;
//     console.log("1. Simulação: Salvando Certificação e Upload do PDF...");

//     // Simulação de delay de save/upload
//     setTimeout(() => {
//         const tempCertId = this.data.certificationId || 'new-cert-123';
//         console.log(`2. Certificação salva (ID: ${tempCertId}). Abrindo Gerador de I.A...`);
        
//         this.openAiGenerator(tempCertId);
//     }, 1000);
//   }

//   /**
//    * Funções auxiliares para abrir modais
//    */

//   // Unifica a lógica de chamada ao Gerador de I.A.
//   private openAiGenerator(certId: string): void {
//     const aiData: AiGeneratorModalData = { certificationId: certId };

//     this.dialog.open(AiQuestionGenerator, {
//       width: '600px',
//       data: aiData,
//     }).afterClosed().subscribe(result => {
//         this.isLoadingQuestions = false; // Desativa o loader após o retorno
//         if (result === true) {
//             console.log("Questões geradas com sucesso. Recarregando tabela.");
//             this.loadQuestions(); // Recarrega a tabela de questões
//         }
//     });
//   }

//   // Método unificado para abertura de detalhes de questão ou Gerador de I.A.
//   openQuestionDetails(question?: Question, isAi: boolean = false): void {
//       if (!this.data.certificationId) {
//           console.error("ID da Certificação não encontrado.");
//           return;
//       }

//       // NOVO: Se isAi for verdadeiro, chama o gerador de I.A.
//       if (isAi) {
//           this.openAiGenerator(this.data.certificationId);
//           return;
//       }
      
//       // Lógica existente para abrir detalhes de uma questão (a ser implementada)
//       console.log(question ? `Abrindo detalhes da Questão ID: ${question.id}` : 'Abrindo modal de Nova Questão manual');
//   }
// }
