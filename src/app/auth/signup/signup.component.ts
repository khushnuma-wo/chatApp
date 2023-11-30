import { Component } from "@angular/core";
import { RouterExtensions } from "@nativescript/angular";
import { UserService } from "~/app/services/user.service";
import { Feedback, FeedbackType, FeedbackPosition } from "nativescript-feedback";
import { Page } from "@nativescript/core";
import * as imagePickerPlugin from '@nativescript/imagepicker';

@Component({
  selector: "ns-signup",
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.scss"]
})
export class SignupComponent {
  firstName: string = "";
  lastName: string = "";
  email: string = "";
  password: string = "";
  private feedback: Feedback;
  isFormValid: boolean = false;
  isLoading: boolean = false;
  selectedImage: string = "";
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
        if (this.firstName && this.lastName && this.email && this.password && this.selectedImage) {
          await this.userService.signup(
            this.firstName,
            this.lastName,
            this.email,
            this.password,
            this.selectedImage
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
            message: "Please fill in the required fields: Name, Email, Password, and Profile Image.",
            duration: 3000,
            type: FeedbackType.Error,
            position: FeedbackPosition.Top,
          });
          this.isLoading = false;
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

  onUploadMedia() {
    var context = imagePickerPlugin.create({
      mode: "single"
    });
  
    context
      .authorize()
      .then(() => {
        return context.present();
      })
      .then((selection) => {
        selection.forEach((selectedImage) => {
          this.selectedImage = selectedImage?.path;
        });
      })
      .catch((e) => {
        console.log(e);
      });
  }
}
