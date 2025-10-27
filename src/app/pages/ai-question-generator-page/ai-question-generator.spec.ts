import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiQuestionGenerator } from './ai-question-generator';

describe('AiQuestionGenerator', () => {
  let component: AiQuestionGenerator;
  let fixture: ComponentFixture<AiQuestionGenerator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiQuestionGenerator]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiQuestionGenerator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
