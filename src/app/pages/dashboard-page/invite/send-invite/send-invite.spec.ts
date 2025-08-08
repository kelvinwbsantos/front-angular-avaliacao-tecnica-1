import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendInvite } from './send-invite';

describe('SendInvite', () => {
  let component: SendInvite;
  let fixture: ComponentFixture<SendInvite>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SendInvite]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SendInvite);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
