// src/app/features/certifications/pages/exam-page/exam-page.component.ts
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, Subscription, EMPTY, timer, map, take, of, switchMap } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
// Imports do Material
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Serviços e Modelos
import { ExamService } from '../../services/exam.service';
import { 
  Answer, 
  Exam, 
  ExamQuestion,
  ExamResult, 
  ExamQuestionsResponse 
} from '../../../shared/models/exam.model';

@Component({
  selector: 'app-exam-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink, // Para o "Botão Voltar" funcionar
    MatCardModule,
    MatRadioModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './exam-page.component.html',
  styleUrl: './exam-page.component.scss'
})
export class ExamPageComponent implements OnInit, OnDestroy {
  // --- Injeções ---
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private examService = inject(ExamService);
  private snackBar = inject(MatSnackBar);

  // --- Estado ---
  isLoading = true;
  isSubmitting = false;
  error: string | null = null;
  exam: Exam | null = null; // Armazena o 'Exam' (com ID e startedAt)
  questions: ExamQuestion[] = []; // Armazena as questões
  answersForm!: FormGroup;

  // --- Timer ---
  private timerSubscription: Subscription | null = null;
  private readonly EXAM_DURATION_MINUTES = 20; // MOCKADO
  private examDurationSeconds = this.EXAM_DURATION_MINUTES * 60;
  
  timeRemaining$!: Observable<number>;
  timePercentage$!: Observable<number>;

  ngOnInit(): void {
    const enrollmentId = this.route.snapshot.paramMap.get('enrollmentId');
    if (!enrollmentId) {
      this.error = 'ID da matrícula não encontrado.';
      this.isLoading = false;
      return;
    }

    // ************ NOVA LÓGICA DE CARREGAMENTO ************
    // 1. Busca TODOS os exames do usuário
    this.examService.getUserExams().pipe(
      switchMap((allExams) => {
        // 2. Tenta achar um em progresso para esta matrícula
        const inProgressExam = allExams.find(
          e => e.enrollmentId === enrollmentId && e.status === 'in_progress'
        );

        if (inProgressExam) {
          // 3a. ACHOU! Retorna o exame existente
          console.log('[ExamPage] Exame em progresso encontrado. Resumindo...');
          return of(inProgressExam);
        } else {
          // 3b. NÃO ACHOU. Cria um novo.
          console.log('[ExamPage] Nenhum exame em progresso. Criando novo...');
          return this.examService.startExam(enrollmentId);
        }
      }),
      // 4. Agora temos um 'Exam' (novo ou existente).
      // Mas ele não tem as questões. Precisamos buscá-las.
      switchMap((examData) => {
        if (!examData) {
          throw new Error("Não foi possível obter os dados do exame.");
        }
        this.exam = examData; // Guarda o 'Exam' (para o ID e o timer)
        console.log(`[ExamPage] Carregando questões para o Exame ID: ${this.exam.id}`);
        // 5. Busca as questões
        return this.examService.getExamQuestions(this.exam.id);
      }),
      // 6. O pipe todo deu erro?
      catchError(err => {
        console.error('Erro ao carregar/iniciar exame:', err);
        // Este é o erro que você estava vendo
        this.error = 'Não foi possível carregar o exame. Pode já haver um em andamento ou o serviço falhou.';
        this.isLoading = false;
        return EMPTY;
      })
    ).subscribe((questionsResponse) => {
      // 7. SUCESSO! Temos as questões.
      console.log(`[ExamPage] Questões carregadas: ${questionsResponse.questions.length}`);
      try {
        this.questions = questionsResponse.questions;
        this.buildForm(this.questions);
        this.startTimer(this.exam!); // Passa o 'Exam' com 'startedAt'
        this.isLoading = false; // DESLIGA O SPINNER
      } catch (e) {
        console.error("Erro fatal ao processar dados do exame (provavelmente data):", e);
        this.error = "Erro ao processar dados do exame. Verifique o console.";
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.timerSubscription?.unsubscribe();
  }

  // BuildForm agora usa a variável 'questions' do componente
  private buildForm(questions: ExamQuestion[]): void {
    const group: { [key: string]: FormControl } = {};
    questions.forEach(q => {
      group[q.id] = new FormControl(null, Validators.required);
    });
    this.answersForm = this.fb.group(group);
  }

  // O Timer (com a correção da data que fizemos antes)
  private startTimer(examData: Exam): void {
    if (!examData || !examData.startedAt) {
      throw new Error("examData.startedAt não pode ser nulo.");
    }
    const totalSeconds = this.examDurationSeconds;

    // Converte a data do banco (que pode estar "suja")
    const timeString = examData.startedAt; 
    const isoString = timeString.includes('T') ? timeString : timeString.replace(' ', 'T') + 'Z';
    const startTime = new Date(isoString).getTime();

    if (isNaN(startTime)) {
      throw new Error(`Falha ao converter a data: ${timeString}`);
    }

    const now = new Date().getTime();
    const elapsedSeconds = Math.round((now - startTime) / 1000);
    let remainingSeconds = totalSeconds - elapsedSeconds;

    if (remainingSeconds <= 0) {
      this.submitExam(true);
      remainingSeconds = 0;
    }

    this.timeRemaining$ = timer(0, 1000).pipe(
      map(i => remainingSeconds - i),
      take(remainingSeconds + 1),
      tap(timeLeft => {
        if (timeLeft === 0) {
          this.submitExam(true);
        }
      })
    );

    this.timePercentage$ = this.timeRemaining$.pipe(
      map(timeLeft => (timeLeft / totalSeconds) * 100)
    );
  }

  // Envia o formulário
  submitExam(isAutoSubmit: boolean = false): void {
    if (this.isSubmitting || !this.exam) return;

    if (!this.answersForm.valid && !isAutoSubmit) {
      this.snackBar.open('Por favor, responda todas as questões.', 'Fechar', { duration: 3000 });
      return;
    }

    const examId = this.exam.id;
    const certificationId = this.exam.certificationId;

    this.isSubmitting = true;
    this.timerSubscription?.unsubscribe();

    const formValues = this.answersForm.value;
    const answers: Answer[] = Object.keys(formValues).map(questionId => ({
      questionId: questionId,
      userAnswer: formValues[questionId]
    }));
    
    const payload = { answers };

    if (isAutoSubmit) {
       this.snackBar.open('Tempo esgotado! Enviando prova...', 'Fechar', { duration: 5000 });
    }

    this.examService.submitExam(this.exam.id, payload).pipe(
      // 1. Após o POST /submit ser bem-sucedido...
        switchMap(() => {
          console.log('[ExamPage] Prova enviada. Buscando resultado...');
          this.snackBar.open('Prova enviada! Verificando resultado...', 'OK', { duration: 2000 });
          // 2. ...chama o GET /result
          return this.examService.getExamResult(examId);
        }),
      
      finalize(() => this.isSubmitting = false),
      catchError(err => {
        console.error('Erro ao enviar exame ou buscar resultado do exame:', err);
        this.snackBar.open('Erro ao enviar. Tente novamente.', 'Fechar', { duration: 3000 });
        return EMPTY;
      })
    ).subscribe((result: ExamResult) => {
      // 3. Recebe o resultado e navega para a rota correta
      console.log('[ExamPage] Resultado recebido:', result);
      if (result.passed === true) {
          // Navega para a página de APROVADO
          // Passamos o ID do Exame (para mostrar a nota) e o ID do Certificado (para gerar o PDF)
          this.router.navigate(['/app/exam-result/passed', certificationId, examId]);
        } 
        else if (result.passed === false) {
          // Navega para a página de REPROVADO
          // Passamos o ID do Exame (para a nota) e o ID do Certificado (para o botão "Tentar Novamente")
          this.router.navigate(['/app/exam-result/failed', certificationId, examId]);
        }
        else {
          // Fallback (se 'passed' vier como nulo ou indefinido, o que seria um erro)
          this.snackBar.open('Seu exame foi salvo, mas o resultado é inconclusivo.', 'OK', { duration: 5000 });
          this.router.navigate(['/app/available-certifications']);
        }
    });
  }
}