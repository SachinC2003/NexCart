import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericButton } from './generic-button';

describe('GenericButton', () => {
  let component: GenericButton;
  let fixture: ComponentFixture<GenericButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
