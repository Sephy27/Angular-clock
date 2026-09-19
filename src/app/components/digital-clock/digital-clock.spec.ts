import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DigitalClock } from './digital-clock';

describe('DigitalClock', () => {
  let component: DigitalClock;
  let fixture: ComponentFixture<DigitalClock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DigitalClock],
    }).compileComponents();

    fixture = TestBed.createComponent(DigitalClock);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
