import { Component } from "@angular/core";
import { RouterExtensions } from "@nativescript/angular";
import { Feedback, FeedbackType, FeedbackPosition } from "nativescript-feedback";
import { UserService } from "~/app/services/user.service";

@Component({
  selector: "ns-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"]
})
export class LoginComponent {
  email: string;
  password: string;
  isFormValid: boolean = false;
  private feedback: Feedback;
  isLoading: boolean = false;

  constructor(private routerExtensions: RouterExtensions, private userService: UserService) {
    this.feedback = new Feedback();
  }

  validateForm() {
    this.isFormValid = this.isValidEmail(this.email);
  }

  isValidEmail(email: string): boolean {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email);
  }

  async login() {
    this.isLoading = true; 
    try {
      const success = await this.userService.login(this.email, this.password);
      if (success) {
        this.feedback.success({
          message: "Login successful",
          duration: 3000,
          type: FeedbackType.Success,
          position: FeedbackPosition.Top,
        });

        setTimeout(() => {
          this.isLoading = false;
          this.routerExtensions.navigate(['/home']);
        }, 200); 
      }
    } catch (error) {
      console.log('Login failed:', error);
      this.isLoading = false; 
    }
  }

  async loginWithFacebook() {
    console.log('facebook');
  }

  async loginWithGoogle() {
    console.log('google');
  }
  GoToForgotPassworPage(){
    this.routerExtensions.navigate(['/forgot-password']);
  }
}
