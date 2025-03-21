import { Component, OnInit, OnDestroy } from "@angular/core";
import { AuthService } from "src/app/auth/auth.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit, OnDestroy {
  private userSub: Subscription;

  constructor(private authService: AuthService) {}
  loggedInUser = null;
  isLoggedIn = false;

  onlogout() {
    this.authService.logout();
  }

  ngOnInit() {
    this.userSub = this.authService.user.subscribe((user) => {
      console.log("user in header", user);
      this.isLoggedIn = !!user;
      this.loggedInUser = user ? user.username : null;
    });
  }
  ngOnDestroy() {
    this.userSub.unsubscribe();
  }
}
