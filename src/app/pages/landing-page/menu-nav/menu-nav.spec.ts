import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuNav } from './menu-nav';

describe('MenuNav', () => {
  let component: MenuNav;
  let fixture: ComponentFixture<MenuNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuNav]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuNav);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
