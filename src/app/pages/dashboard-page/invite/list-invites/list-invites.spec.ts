import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListInvites } from './list-invites';

describe('ListInvites', () => {
  let component: ListInvites;
  let fixture: ComponentFixture<ListInvites>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListInvites]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListInvites);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
