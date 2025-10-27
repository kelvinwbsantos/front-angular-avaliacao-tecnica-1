import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Invite } from './invite';

describe('Invite', () => {
  let component: Invite;
  let fixture: ComponentFixture<Invite>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Invite]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Invite);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
