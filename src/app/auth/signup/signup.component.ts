import { Component } from "@angular/core";
import { RouterExtensions } from "@nativescript/angular";
import { UserService } from "~/app/services/user.service";
import { Feedback, FeedbackType, FeedbackPosition } from "nativescript-feedback";
import { Page } from "@nativescript/core";

@Component({
  selector: "ns-signup",
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.scss"]
})
export class SignupComponent {
  name: string = "";
  email: string = "";
  password: string = "";
  private feedback: Feedback;
  isFormValid: boolean = false;
  isLoading: boolean = false;

  constructor(private routerExtensions: RouterExtensions, private userService: UserService, private page: Page) {
    this.feedback = new Feedback();
  }

  ngOnInit() {
    this.page.actionBarHidden = true;
  }
  validateForm() {
    this.isFormValid = this.isValidEmail(this.email);
  }

  isValidEmail(email: string): boolean {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email);
  }
  async signup() {
    this.isLoading = true; 
    try {
      if (this.isFormValid) {
        if (this.name && this.email && this.password) {
          await this.userService.signup(
            this.name,
            this.email,
            this.password
          );
          this.feedback.success({
            message: "User Registered successfull",
            duration: 3000,
            type: FeedbackType.Success,
            position: FeedbackPosition.Top,
          });
          setTimeout(() => {
            this.isLoading = false;
            this.routerExtensions.navigate(['/login']);
          }, 200); 
        } else {
          this.feedback.error({
            message: "Please provide name, email, and password.",
            duration: 3000,
            type: FeedbackType.Error,
            position: FeedbackPosition.Top,
          });
        }
      }
    } catch (err) {
      console.log(err, "err");
    }
  }

  async signupWithFacebook() {
    console.log('facebook');

  }

  async signupWithGoogle() {
    await this.userService.signUpWithGoogle();
    // this.feedback.success({
    //   message: "User Registered successfull",
    //   duration: 3000,
    //   type: FeedbackType.Success,
    //   position: FeedbackPosition.Top,
    // });
    // this.routerExtensions.navigate(['/login']);
  }
}
