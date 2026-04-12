import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericToast } from './generic-toast';

describe('GenericToast', () => {
  let component: GenericToast;
  let fixture: ComponentFixture<GenericToast>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericToast]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericToast);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
