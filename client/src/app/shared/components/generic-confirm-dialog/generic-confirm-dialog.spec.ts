import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericConfirmDialog } from './generic-confirm-dialog';

describe('GenericConfirmDialog', () => {
  let component: GenericConfirmDialog;
  let fixture: ComponentFixture<GenericConfirmDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericConfirmDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericConfirmDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
