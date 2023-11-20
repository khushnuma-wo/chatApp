import { Component, OnInit } from "@angular/core";
import { RouterExtensions } from "@nativescript/angular";
import { UserService } from "../services/user.service";
import { Feedback, FeedbackType, FeedbackPosition } from "nativescript-feedback";
import { Dialogs } from "@nativescript/core";
import { ChatListService } from "../services/chat-list.service";

@Component({
  selector: "ns-signup",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"]
})
export class HomeComponent implements OnInit {
  private feedback: Feedback;
  public allUsers: any[];
  public selectedUser: any;
  public usersWithMessageCollection: any[] = [];
  userLength: number;
  isLoading: boolean = false;
  constructor(private routerExtensions: RouterExtensions,
    private userService: UserService,
    private chatListService: ChatListService) {
    this.feedback = new Feedback();
  }

  async ngOnInit() {
    this.isLoading = true;
    this.loadAllUsers();
    try {
    const currentUser = await this.userService.getCurrentUser();
    const currentUserUid = currentUser.user.uid;

    const users = await this.chatListService.getUsersWithMessageCollection(currentUserUid);

    this.usersWithMessageCollection = users.filter(user => user.userUid !== currentUserUid);
    let userLength = this.usersWithMessageCollection.length;
    this.userLength = userLength
    }
    catch (error) {
      console.error('Error fetching users:', error);
      this.isLoading = false;
    }
  }
  async loadAllUsers() {
    const currentUser = await this.userService.getCurrentUser();
    this.userService.getAllUsers().then(
      (users) => {
        this.allUsers = users.filter(user => user.userUid !== currentUser.user.uid);
        this.isLoading = false;
        // console.log("Current User:", currentUser.user.uid);
        // console.log("All Users (excluding current user):", this.allUsers);
      }
    ).catch((error) => {
      console.error("Error loading users:", error);
    });
  }
  logout() {
    Dialogs.confirm({
      title: "Confirm Logout",
      message: "Are you sure you want to log out?",
      okButtonText: "Yes",
      cancelButtonText: "Cancel"
    }).then((result) => {
      if (result) {
        this.userService.logout();
        this.feedback.success({
          message: "Logout successful",
          duration: 3000,
          type: FeedbackType.Success,
          position: FeedbackPosition.Top,
        });
        this.routerExtensions.navigate(["/login"]);
      }
    });
  }
  onChat(user: any) {
    this.selectedUser = user;
    const userName = user.name;
    const userId = user.userUid
    this.routerExtensions.navigate([`/chat/${userName}/${userId}`]);
  }

  chatList() {
    this.routerExtensions.navigate(["/chat-list"]);
  }

}