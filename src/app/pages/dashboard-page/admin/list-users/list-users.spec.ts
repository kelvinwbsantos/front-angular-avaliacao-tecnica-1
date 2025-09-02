import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListUsers } from './list-users';

describe('ListUsers', () => {
  let component: ListUsers;
  let fixture: ComponentFixture<ListUsers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListUsers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListUsers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
