import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrouverMedecinComponent } from './trouver-medecin.component';

describe('TrouverMedecinComponent', () => {
  let component: TrouverMedecinComponent;
  let fixture: ComponentFixture<TrouverMedecinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrouverMedecinComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TrouverMedecinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
