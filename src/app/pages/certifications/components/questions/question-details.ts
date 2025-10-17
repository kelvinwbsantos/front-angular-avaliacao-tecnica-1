// src/app/pages/certifications/components/questions/question-details.ts

// v4 - Refatorado com melhorias e correções

import { Component, inject, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogActions, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators, ValidatorFn } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CertificationsService, Question, Option } from '../../services/certifications.service';

/**
 * DTO de dados que o modal recebe do componente pai.
 */
export interface QuestionModalData {
    question?: Question;
    isCreation: boolean;
    isAiGenerated: boolean;
}

/**
 * Validador Customizado: Garante que pelo menos duas opções existam 
 * e que pelo menos uma opção correta seja selecionada.
 *
 * Movido para fora da classe para resolver o erro TS2345.
 * @param control O FormArray das opções.
 */
export const optionsArrayValidator: ValidatorFn = (control: AbstractControl): { [key: string]: any } | null => {
    const optionsArray = control as FormArray;
    if (!optionsArray) { return null; }
    
    const options = optionsArray.controls.map(group => group.value as Option);
    
    // 1. Validação de Mínimo de Opções
    if (options.length < 2) {
        return { notEnoughOptions: true };
    }

    // 2. Validação de Opção Correta
    const hasCorrectOption = options.some(option => option.isCorrect);
    
    return hasCorrectOption ? null : { noCorrectOption: true };
};

@Component({
    selector: 'app-question-details',
    standalone: true,
    imports: [
        MatDialogTitle, MatDialogContent, MatDialogActions, MatButtonModule, 
        MatIconModule, MatCardModule, MatFormFieldModule, MatInputModule, 
        MatTooltipModule, ReactiveFormsModule, MatCheckboxModule
    ],
    templateUrl: './question-details.html',
    styleUrl: './question-details.scss',
})
export class QuestionDetails implements OnInit {
    
    // Injeções de Dependência
    private readonly fb = inject(FormBuilder);
    public readonly dialogRef = inject(MatDialogRef<QuestionDetails>); 
    private readonly certificationsService = inject(CertificationsService);

    // Dados da certificação injetados
    constructor(@Inject(MAT_DIALOG_DATA) public data: QuestionModalData) {}

    questionForm!: FormGroup;

    ngOnInit(): void {
        this.initializeForm();
        if (this.data.question) {
            this.loadQuestionData(this.data.question);
        }
    }

    private initializeForm(): void {
        this.questionForm = this.fb.group({
            questionText: new FormControl('', Validators.required),
            validUntil: new FormControl(this.getDefaultValidUntil(), Validators.required),
            isActive: new FormControl(true),
            // CORREÇÃO: Usando a função importada diretamente
            options: this.fb.array([], optionsArrayValidator) 
        });

        // Adiciona um conjunto padrão de opções para começar
        if (this.data.isCreation) {
            this.addOption();
            this.addOption();
        }
    }

    get options(): FormArray {
        return this.questionForm.get('options') as FormArray;
    }

    loadQuestionData(question: Question): void {
        this.questionForm.patchValue({
            questionText: question.questionText,
            validUntil: question.validUntil,
            isActive: question.isActive
        });

        // Preenche o FormArray com as opções existentes
        question.options.forEach(option => {
            this.options.push(this.createOptionGroup(option));
        });
    }

    addOption(option?: Option): void {
        this.options.push(this.createOptionGroup(option));
    }

    removeOption(index: number): void {
        this.options.removeAt(index);
        this.options.updateValueAndValidity();
    }

    private createOptionGroup(option?: Option): FormGroup {
        return this.fb.group({
            text: new FormControl(option?.text || '', Validators.required),
            isCorrect: new FormControl(option?.isCorrect || false),
        });
    }
    
    private getDefaultValidUntil(): string {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 1); // Válida por 1 ano
        return date.toISOString().split('T')[0];
    }

    saveQuestion(): void {
        this.options.updateValueAndValidity();

        if (this.questionForm.invalid) {
            this.questionForm.markAllAsTouched();
            console.error('Formulário inválido. Verifique o texto da questão, validade e se há pelo menos uma resposta correta.');
            return;
        }

        const formValue = this.questionForm.value;
        const result: Partial<Question> = {
            questionText: formValue.questionText,
            validUntil: formValue.validUntil,
            isActive: formValue.isActive,
            options: formValue.options
        };

        this.dialogRef.close(result);
    }
}



// v3 - Refatorado com melhorias e correções
// import { Component, inject, Inject, OnInit } from '@angular/core';
// import { MAT_DIALOG_DATA, MatDialogRef, MatDialogActions, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { MatCardModule } from '@angular/material/card';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatTooltipModule } from '@angular/material/tooltip';
// import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// import { MatCheckboxModule } from '@angular/material/checkbox';
// import { CertificationsService, Question, Option } from '../../services/certifications.service';

// /**
//  * DTO de dados que o modal recebe do componente pai.
//  */
// export interface QuestionModalData {
//     question?: Question;
//     isCreation: boolean;
//     isAiGenerated: boolean;
// }

// @Component({
//     selector: 'app-question-details',
//     standalone: true,
//     imports: [
//         MatDialogTitle, MatDialogContent, MatDialogActions, MatButtonModule, 
//         MatIconModule, MatCardModule, MatFormFieldModule, MatInputModule, 
//         MatTooltipModule, ReactiveFormsModule, MatCheckboxModule
//     ],
//     templateUrl: './question-details.html',
//     styleUrl: './question-details.scss',
// })
// export class QuestionDetails implements OnInit {
    
//     // Injeções de Dependência
//     private readonly fb = inject(FormBuilder);
//     public readonly dialogRef = inject(MatDialogRef<QuestionDetails>); 
//     private readonly certificationsService = inject(CertificationsService);

//     // Dados da certificação injetados
//     constructor(@Inject(MAT_DIALOG_DATA) public data: QuestionModalData) {}

//     questionForm!: FormGroup;

//     ngOnInit(): void {
//         this.initializeForm();
//         if (this.data.question) {
//             this.loadQuestionData(this.data.question);
//         }
//     }

//     private initializeForm(): void {
//         this.questionForm = this.fb.group({
//             questionText: new FormControl('', Validators.required),
//             validUntil: new FormControl(this.getDefaultValidUntil(), Validators.required),
//             isActive: new FormControl(true),
//             // CORREÇÃO: Usando o método estático QuestionDetails.optionsArrayValidator
//             options: this.fb.array([], QuestionDetails.optionsArrayValidator) 
//         });

//         // Adiciona um conjunto padrão de opções para começar
//         if (this.data.isCreation) {
//             this.addOption();
//             this.addOption();
//         }
//     }

//     get options(): FormArray {
//         return this.questionForm.get('options') as FormArray;
//     }

//     loadQuestionData(question: Question): void {
//         this.questionForm.patchValue({
//             questionText: question.questionText,
//             validUntil: question.validUntil,
//             isActive: question.isActive
//         });

//         // Preenche o FormArray com as opções existentes
//         question.options.forEach(option => {
//             this.options.push(this.createOptionGroup(option));
//         });
//     }

//     addOption(option?: Option): void {
//         this.options.push(this.createOptionGroup(option));
//     }

//     removeOption(index: number): void {
//         this.options.removeAt(index);
//         // Garante que o validador do FormArray seja re-executado
//         this.options.updateValueAndValidity();
//     }

//     private createOptionGroup(option?: Option): FormGroup {
//         return this.fb.group({
//             text: new FormControl(option?.text || '', Validators.required),
//             isCorrect: new FormControl(option?.isCorrect || false),
//         });
//     }
    
//     /**
//      * Validador Customizado Estático: Garante que pelo menos duas opções existam 
//      * e que pelo menos uma opção correta seja selecionada.
//      * @param control O FormArray das opções.
//      */
//     static optionsArrayValidator(control: FormArray): { [key: string]: any } | null {
//         const options = control.controls.map(group => group.value as Option);
        
//         // 1. Validação de Mínimo de Opções
//         if (options.length < 2) {
//             return { notEnoughOptions: true };
//         }

//         // 2. Validação de Opção Correta
//         const hasCorrectOption = options.some(option => option.isCorrect);
        
//         return hasCorrectOption ? null : { noCorrectOption: true };
//     }

//     private getDefaultValidUntil(): string {
//         const date = new Date();
//         date.setFullYear(date.getFullYear() + 1); // Válida por 1 ano
//         return date.toISOString().split('T')[0];
//     }

//     saveQuestion(): void {
//         // Força a revalidação do FormArray antes de salvar
//         this.options.updateValueAndValidity();

//         if (this.questionForm.invalid) {
//             this.questionForm.markAllAsTouched();
//             console.error('Formulário inválido. Verifique o texto da questão, validade e se há pelo menos uma resposta correta.');
//             return;
//         }

//         const formValue = this.questionForm.value;
//         const result: Partial<Question> = {
//             questionText: formValue.questionText,
//             validUntil: formValue.validUntil,
//             isActive: formValue.isActive,
//             options: formValue.options
//         };

//         // Fecha o modal e retorna os dados
//         this.dialogRef.close(result);
//     }
// }



// v2 - Refatorado com melhorias e correções

// import { Component, inject, Inject, OnInit } from '@angular/core';
// import { MAT_DIALOG_DATA, MatDialogRef, MatDialogActions, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { MatCardModule } from '@angular/material/card';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatTooltipModule } from '@angular/material/tooltip';
// import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// import { MatCheckboxModule } from '@angular/material/checkbox';
// import { CertificationsService, Question, Option } from '../../services/certifications.service';

// /**
//  * DTO de dados que o modal recebe do componente pai.
//  */
// export interface QuestionModalData {
//     question?: Question;
//     isCreation: boolean;
//     isAiGenerated: boolean;
// }

// @Component({
//     selector: 'app-question-details',
//     standalone: true,
//     imports: [
//         MatDialogTitle, MatDialogContent, MatDialogActions, MatButtonModule, 
//         MatIconModule, MatCardModule, MatFormFieldModule, MatInputModule, 
//         MatTooltipModule, ReactiveFormsModule, MatCheckboxModule
//     ],
//     templateUrl: './question-details.html',
//     styleUrl: './question-details.scss',
// })
// export class QuestionDetails implements OnInit {
    
//     // Injeções de Dependência
//     private readonly fb = inject(FormBuilder);
//     // CORREÇÃO: Tornando dialogRef público para acesso no template HTML
//     public readonly dialogRef = inject(MatDialogRef<QuestionDetails>); 
//     private readonly certificationsService = inject(CertificationsService);

//     // Dados da certificação injetados
//     constructor(@Inject(MAT_DIALOG_DATA) public data: QuestionModalData) {}

//     questionForm!: FormGroup;

//     ngOnInit(): void {
//         this.initializeForm();
//         if (this.data.question) {
//             this.loadQuestionData(this.data.question);
//         }
//     }

//     private initializeForm(): void {
//         this.questionForm = this.fb.group({
//             questionText: new FormControl('', Validators.required),
//             validUntil: new FormControl(this.getDefaultValidUntil(), Validators.required),
//             isActive: new FormControl(true),
//             options: this.fb.array([], this.optionsArrayValidator) // Inicializa o FormArray
//         });

//         // Adiciona um conjunto padrão de opções para começar
//         if (this.data.isCreation) {
//             this.addOption();
//             this.addOption();
//         }
//     }

//     get options(): FormArray {
//         return this.questionForm.get('options') as FormArray;
//     }

//     loadQuestionData(question: Question): void {
//         this.questionForm.patchValue({
//             questionText: question.questionText,
//             validUntil: question.validUntil,
//             isActive: question.isActive
//         });

//         // Preenche o FormArray com as opções existentes
//         question.options.forEach(option => {
//             this.options.push(this.createOptionGroup(option));
//         });
//     }

//     addOption(option?: Option): void {
//         this.options.push(this.createOptionGroup(option));
//     }

//     removeOption(index: number): void {
//         this.options.removeAt(index);
//         // Garante que o validador do FormArray seja re-executado
//         this.options.updateValueAndValidity();
//     }

//     private createOptionGroup(option?: Option): FormGroup {
//         return this.fb.group({
//             text: new FormControl(option?.text || '', Validators.required),
//             isCorrect: new FormControl(option?.isCorrect || false),
//         });
//     }
    
//     // Validador Customizado: Garante que pelo menos uma opção correta seja selecionada.
//     optionsArrayValidator(control: FormArray): { [key: string]: any } | null {
//         const options = control.controls.map(group => group.value as Option);
//         const hasCorrectOption = options.some(option => option.isCorrect);
        
//         // Garante que haja pelo menos duas opções no total
//         if (options.length < 2) {
//             return { notEnoughOptions: true };
//         }

//         return hasCorrectOption ? null : { noCorrectOption: true };
//     }

//     private getDefaultValidUntil(): string {
//         const date = new Date();
//         date.setFullYear(date.getFullYear() + 1); // Válida por 1 ano
//         return date.toISOString().split('T')[0];
//     }

//     saveQuestion(): void {
//         // Força a revalidação do FormArray antes de salvar
//         this.options.updateValueAndValidity();

//         if (this.questionForm.invalid) {
//             this.questionForm.markAllAsTouched();
//             console.error('Formulário inválido. Verifique o texto da questão, validade e se há pelo menos uma resposta correta.');
//             return;
//         }

//         const formValue = this.questionForm.value;
//         const result: Partial<Question> = {
//             questionText: formValue.questionText,
//             validUntil: formValue.validUntil,
//             isActive: formValue.isActive,
//             options: formValue.options
//         };

//         // Fecha o modal e retorna os dados
//         this.dialogRef.close(result);
//     }
// }




// v1

// import { Component, Inject, inject } from '@angular/core';
// import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { MatCardModule } from '@angular/material/card';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatRadioModule } from '@angular/material/radio';
// import { MatCheckboxModule } from '@angular/material/checkbox';
// import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// import { MatTooltipModule } from '@angular/material/tooltip';
// import { Question } from '../../services/certifications.service';

// export interface QuestionModalData {
//     question?: Question;
//     isCreation: boolean;
//     isAiGenerated: boolean;
// }

// @Component({
//     selector: 'app-question-details',
//     standalone: true,
//     imports: [
//         MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose,
//         MatButtonModule, MatIconModule, MatCardModule, MatFormFieldModule,
//         MatInputModule, MatRadioModule, MatCheckboxModule, MatTooltipModule,
//         ReactiveFormsModule
//     ],
//     templateUrl: './question-details.html', // Aponta para o HTML externo
//     styleUrl: './question-details.scss'    // Aponta para o SCSS externo
// })
// export class QuestionDetails {
//     private readonly dialogRef = inject(MatDialogRef<QuestionDetails>);

//     questionForm: FormGroup;

//     constructor(@Inject(MAT_DIALOG_DATA) public data: QuestionModalData) {
//         // Valores iniciais ou de edição
//         const initialQuestion = data.question || {
//             questionText: '',
//             options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }],
//             isActive: true,
//             validUntil: new Date().toISOString().split('T')[0] // Data de hoje
//         };

//         this.questionForm = new FormGroup({
//             questionText: new FormControl(initialQuestion.questionText, Validators.required),
//             options: new FormArray(
//                 initialQuestion.options.map(opt => this.createOptionGroup(opt.text, opt.isCorrect)),
//                 Validators.required
//             ),
//             isActive: new FormControl(initialQuestion.isActive),
//             validUntil: new FormControl(initialQuestion.validUntil)
//         });
//     }

//     get optionsFormArray(): FormArray {
//         return this.questionForm.get('options') as FormArray;
//     }

//     private createOptionGroup(text: string, isCorrect: boolean): FormGroup {
//         return new FormGroup({
//             text: new FormControl(text, Validators.required),
//             isCorrect: new FormControl(isCorrect)
//         });
//     }

//     addOption(): void {
//         this.optionsFormArray.push(this.createOptionGroup('', false));
//     }

//     removeOption(index: number): void {
//         this.optionsFormArray.removeAt(index);
//     }

//     saveQuestion(): void {
//         if (this.questionForm.valid) {
//             // Retorna os dados para o componente pai
//             this.dialogRef.close(this.questionForm.value);
//         }
//     }
// }
