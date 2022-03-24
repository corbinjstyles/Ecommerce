import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';


import { firstValueFrom, from, lastValueFrom, Observable } from 'rxjs';
import { OktaAuthModule, OktaAuthStateService, OKTA_AUTH } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {

  constructor(@Inject(OKTA_AUTH)public oktaAuth: OktaAuth) { }
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.handleAccess(request, next));
  }
  private async handleAccess(request: HttpRequest<any>, next: HttpHandler): Promise<HttpEvent<any>> {
    const theEndpoint = environment.HCLTechStoreUrl + '/orders';
    const securedEndpoints =[theEndpoint];
    if(securedEndpoints.some(url => request.urlWithParams.includes(url))){
      const accessToken = await this.oktaAuth.getAccessToken();
      console.log(accessToken)
      request = request.clone({
        setHeaders: {
        Authorization: "Bearer " + accessToken

      }
    });
    }
    // return next.handle(request).toPromise();
    const vari = lastValueFrom(next.handle(request));


    return vari;
  }
}
