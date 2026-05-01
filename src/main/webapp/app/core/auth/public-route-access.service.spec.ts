import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { Account } from './account.model';
import { AccountService } from './account.service';
import { PublicRouteAccessService } from './public-route-access.service';

describe('PublicRouteAccessService', () => {
  let accountService: AccountService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });

    accountService = TestBed.inject(AccountService);
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  it('allows anonymous users', done => {
    accountService.authenticate(null);

    TestBed.runInInjectionContext(() => {
      const result$ = PublicRouteAccessService({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot) as Observable<boolean>;
      result$.subscribe((result: boolean) => {
        expect(result).toBe(true);
        expect(router.navigate).not.toHaveBeenCalled();
        done();
      });
    });
  });

  it('redirects authenticated users to home', done => {
    const account: Account = {
      activated: true,
      authorities: ['ROLE_USER'],
      email: 'john.doe@example.com',
      firstName: 'John',
      langKey: 'en',
      lastName: 'Doe',
      login: 'john.doe',
      imageUrl: '',
    };
    accountService.authenticate(account);

    TestBed.runInInjectionContext(() => {
      const result$ = PublicRouteAccessService({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot) as Observable<boolean>;
      result$.subscribe((result: boolean) => {
        expect(result).toBe(false);
        expect(router.navigate).toHaveBeenCalledWith(['']);
        done();
      });
    });
  });
});
