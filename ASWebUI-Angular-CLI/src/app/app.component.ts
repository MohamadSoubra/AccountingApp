import { Component, OnInit, OnDestroy } from "@angular/core";
import { AuthService } from "./auth/auth.service";
import { Subscription, Observable } from "rxjs";
import { take } from "rxjs/operators";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit {
  private timer: Subscription;
  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.autologin();
  }
}
