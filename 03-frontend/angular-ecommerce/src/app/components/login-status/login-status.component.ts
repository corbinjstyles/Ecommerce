import { TokenizeResult } from '@angular/compiler/src/ml_parser/lexer';
import { Component, Inject, OnInit } from '@angular/core';
import { inject } from '@angular/core/testing';
import { Router } from '@angular/router';
import { OktaAuthModule, OktaAuthStateService, OKTA_AUTH } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';


@Component({
  selector: 'app-login-status',
  templateUrl: './login-status.component.html',
  styleUrls: ['./login-status.component.css']
})
export class LoginStatusComponent implements OnInit {

  isAuthenticated!: string;
  userFullName?: string;

  storage: Storage = sessionStorage;
  storage2: Storage = localStorage;

  constructor( @Inject(OKTA_AUTH)public oktaAuth: OktaAuth) { }

  ngOnInit(): void {



    this.oktaAuth.authStateManager.subscribe(
      (result: any) => {

        this.isAuthenticated= result;
        this.storage.setItem('isAuthenticated', this.oktaAuth.authStateManager._authState?.isAuthenticated!.toString()!)

        console.log(result)
        this.getUserDetails();
      }
    );

  }
  getUserDetails() {

    if(this.isAuthenticated){
      this.oktaAuth.getUser().then(
        (res) => {
          this.userFullName = res.name;
          this.storage2.setItem('name', res.name);
          this.storage2.setItem('group', this.oktaAuth.getAccessToken()!);

          const theEmail = res.email;

          this.storage.setItem('userEmail', JSON.stringify(theEmail));
        }
      );

    }
  }

  logout(){
    this.oktaAuth.signOut();
    this.storage.removeItem('userEmail');


  }

}



