import { Component } from "@angular/core";
import { Store } from "@ngrx/store";
import { sendPasswordResetLink } from "~/app/state/actions/user.action";
import { selectSendPasswordResetLinkStatus } from '../../state/selectors/user.selector';
import { UserService } from "~/app/services/user.service";
import { finalize, take, withLatestFrom } from "rxjs";
import { Feedback, FeedbackPosition, FeedbackType } from "nativescript-feedback";
import { RouterExtensions } from "@nativescript/angular";

@Component({
  selector: "ns-forgot-password",
  templateUrl: "./forgot-password.component.html",
  styleUrls: ["./forgot-password.component.scss"]
})
export class ForgotPasswordComponent {
  email: string;
  isFormValid: boolean = false;
  private feedback: Feedback;
  isLoading: boolean = false;
  constructor(private routerExtensions: RouterExtensions,private store: Store) {
    this.feedback = new Feedback();
   }

  isValidEmail(email: string): boolean {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email);
  }
  validateForm() {
    this.isFormValid = this.isValidEmail(this.email);
  }
  forgotPassword() {
    this.isLoading = true; 
    this.store.dispatch(sendPasswordResetLink({ email: this.email }));
  
    this.store.select(selectSendPasswordResetLinkStatus).pipe(
      take(1),
      finalize(() => {
      })
      ).subscribe((status) => {
        if (status.isSending) {
          this.feedback.success({
            message: "Password reset mail send successful",
            duration: 3000,
            type: FeedbackType.Success,
            position: FeedbackPosition.Top,
          });
          
          setTimeout(() => {
          this.isLoading = false;
          this.routerExtensions.navigate(['/login']);
        }, 200); 
      } else {
      }
    });
  }
  
}
