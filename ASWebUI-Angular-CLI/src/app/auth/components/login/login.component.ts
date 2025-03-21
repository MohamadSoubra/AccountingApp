import {
  Component,
  OnInit,
  AfterContentInit,
  AfterViewInit,
} from "@angular/core";
import { ApiHelperService } from "src/app/services/ApiHelper.service";
import { User } from "src/app/models/User.model";
import { authUser } from "src/app/models/authUser.model";
import { FormBuilder, NgForm, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { HomeComponent } from "src/app/Components/home/home.component";
import { AuthService } from "../../auth.service";
 
//declare var $:JQueryStatic;

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  //Users: User;
  user: authUser;
  error: string = null;
  isloading = false;
  // email: string;
  // password: string;
  returnUrl: string;
  passwordVisible:boolean = false;

  loginForm = this.fb.group({
    emailAddress: [,[Validators.required,Validators.email]],
    password: [,Validators.required]
  })
  //loggedin = false;
  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {}
  //declare var $:any;

  get emailAddress() { return this.loginForm.get('emailAddress'); }
  get password() { return this.loginForm.get('password'); }

  ngOnInit(): void {
    //this.user.username = "mhmd@email.com",
    //this.user.password = "pwd12345."
    //this.http.getUsers().subscribe(users => console.log(users));
    //this.apihelper.getProducts().subscribe(producs=>{
    // console.log(producs);
    // });
    this.returnUrl = this.route.snapshot.queryParams["returnUrl"] || "/";
  }

  checktoken() {
    console.log(this.authService.isTokenValid(localStorage.getItem("token")));
  }

  login() {
    //this.user.username = "mhmd@email.com";
    //this.user.password = "Pwd12345.";
    //this.authService.loginUser(this.user).subscribe(token => console.log(token));
    console.log("Submitted");
  }

  onSubmit() {
    //this.user = form.value
    //console.log(this.user);
    //console.log(form);
    if (!this.loginForm.valid) {
      return;
    }
    this.isloading = true;
    this.authService.loginUser(this.loginForm.value.emailAddress, this.loginForm.value.password).subscribe(
      (loggedin) => {
        if (loggedin) {
          // this.loginForm.resetForm();
          this.router.navigate([this.returnUrl]);
          console.log("Loggedin");
          this.error = null;
          this.isloading = false;
          //this.loggedin = true ;
        }
      },
      (errorMessage) => {
        console.log(errorMessage);
        this.error = errorMessage;
        this.isloading = false;
        //this.loggedin = false;
      }
    );
  }
}
