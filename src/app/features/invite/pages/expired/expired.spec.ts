import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Expired } from './expired';

describe('Expired', () => {
  let component: Expired;
  let fixture: ComponentFixture<Expired>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Expired]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Expired);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
