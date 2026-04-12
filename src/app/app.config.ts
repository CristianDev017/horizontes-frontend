import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { HttpRequest, HttpHandlerFn } from '@angular/common/http';

const credentialsInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  return next(req.clone({ withCredentials: true }));
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([credentialsInterceptor]))
  ]
};