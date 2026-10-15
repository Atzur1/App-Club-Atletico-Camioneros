import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { CoordinadorMedicalPage } from './coordinador-medical-page';

describe('CoordinadorMedicalPage', () => {
  it('declares the coordinator medical experience as read-only', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideHttpClient()] });
    const page = TestBed.runInInjectionContext(() => new CoordinadorMedicalPage());
    expect(page.readOnly).toBeTrue();
  });
});
