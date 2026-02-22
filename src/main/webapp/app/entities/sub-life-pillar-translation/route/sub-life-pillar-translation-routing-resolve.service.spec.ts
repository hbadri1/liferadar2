import { TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { ActivatedRoute, ActivatedRouteSnapshot, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';

import { ISubLifePillarTranslation } from '../sub-life-pillar-translation.model';
import { SubLifePillarTranslationService } from '../service/sub-life-pillar-translation.service';

import subLifePillarTranslationResolve from './sub-life-pillar-translation-routing-resolve.service';

describe('SubLifePillarTranslation routing resolve service', () => {
  let mockRouter: Router;
  let mockActivatedRouteSnapshot: ActivatedRouteSnapshot;
  let service: SubLifePillarTranslationService;
  let resultSubLifePillarTranslation: ISubLifePillarTranslation | null | undefined;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({}),
            },
          },
        },
      ],
    });
    mockRouter = TestBed.inject(Router);
    jest.spyOn(mockRouter, 'navigate').mockImplementation(() => Promise.resolve(true));
    mockActivatedRouteSnapshot = TestBed.inject(ActivatedRoute).snapshot;
    service = TestBed.inject(SubLifePillarTranslationService);
    resultSubLifePillarTranslation = undefined;
  });

  describe('resolve', () => {
    it('should return ISubLifePillarTranslation returned by find', () => {
      // GIVEN
      service.find = jest.fn(id => of(new HttpResponse({ body: { id } })));
      mockActivatedRouteSnapshot.params = { id: 123 };

      // WHEN
      TestBed.runInInjectionContext(() => {
        subLifePillarTranslationResolve(mockActivatedRouteSnapshot).subscribe({
          next(result) {
            resultSubLifePillarTranslation = result;
          },
        });
      });

      // THEN
      expect(service.find).toHaveBeenCalledWith(123);
      expect(resultSubLifePillarTranslation).toEqual({ id: 123 });
    });

    it('should return null if id is not provided', () => {
      // GIVEN
      service.find = jest.fn();
      mockActivatedRouteSnapshot.params = {};

      // WHEN
      TestBed.runInInjectionContext(() => {
        subLifePillarTranslationResolve(mockActivatedRouteSnapshot).subscribe({
          next(result) {
            resultSubLifePillarTranslation = result;
          },
        });
      });

      // THEN
      expect(service.find).not.toHaveBeenCalled();
      expect(resultSubLifePillarTranslation).toEqual(null);
    });

    it('should route to 404 page if data not found in server', () => {
      // GIVEN
      jest.spyOn(service, 'find').mockReturnValue(of(new HttpResponse<ISubLifePillarTranslation>({ body: null })));
      mockActivatedRouteSnapshot.params = { id: 123 };

      // WHEN
      TestBed.runInInjectionContext(() => {
        subLifePillarTranslationResolve(mockActivatedRouteSnapshot).subscribe({
          next(result) {
            resultSubLifePillarTranslation = result;
          },
        });
      });

      // THEN
      expect(service.find).toHaveBeenCalledWith(123);
      expect(resultSubLifePillarTranslation).toEqual(undefined);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['404']);
    });
  });
});
