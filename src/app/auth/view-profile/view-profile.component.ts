import { AfterContentInit, Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { RouterExtensions } from "@nativescript/angular";
import { UserService } from "~/app/services/user.service";

@Component({
  selector: "ns-view-profile",
  templateUrl: "./view-profile.component.html",
  styleUrls: ["./view-profile.component.scss"]
})
export class ViewProfileComponent implements OnInit, AfterContentInit {
  firstName: string = "";
  lastName: string = "";
  email: string = "";
  password: string = "";
  isFormValid: boolean = false;
  isLoading: boolean = false;
  selectedImage: string = "";
  currentUserId: string;
  currentUser: any;
  users: any;
  user: any;
  isEdit: boolean = false;
  title: string = 'View Profile';
  constructor(private routerExtensions: RouterExtensions, private userService: UserService, private route: ActivatedRoute,) {
    this.route.queryParams.subscribe(params => {
      console.log("params", params)
      this.isEdit = params.isEdit;
      this.title = params.isEdit ? 'Edit Profile' : 'View Profile';
    });

  }

  async ngOnInit() {
    this.users = await this.userService.getAllUsers();
    this.currentUser = await this.userService.getCurrentUser();
    this.currentUserId = this.currentUser.user.uid;
    this.user = this.users?.find((res) => res?.userUid === this.currentUserId);
  
  }

  ngAfterContentInit() {
    console.log("title", this.title)
    console.log("this.isEdit", this.isEdit)
  }

  goBack() {
    this.routerExtensions.navigate(["/home"])
  }

  validateForm() {
    this.isFormValid = this.isValidEmail(this.email);
  }

  isValidEmail(email: string): boolean {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email);
  }

  updateProfile() {
    console.log("tap event called....")
    console.log("******", this.firstName, this.lastName, this.email, this.password, this.selectedImage)
    this.isLoading = true;
    try {
      if (this.isFormValid) {
        console.log("sssss")
        if (this.firstName && this.lastName && this.email && this.password && this.selectedImage) {
        }
      }
    } catch (err) {
      console.log(err, "err");
    }
  }

}
