import { Component, OnInit } from "@angular/core";
import { RouterExtensions } from "@nativescript/angular";
import { UserService } from "../services/user.service";
import { Feedback, FeedbackType, FeedbackPosition } from "nativescript-feedback";
import { Dialogs } from "@nativescript/core";
import { ChatListService } from "../services/chat-list.service";
import { Application } from "@nativescript/core";

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
  randomImagePath:any
  constructor(private routerExtensions: RouterExtensions,
    private userService: UserService,
    private chatListService: ChatListService) {
    this.feedback = new Feedback();
  }
  logOutBtnIcon: string;
  messageBtnIcon: string;
  isDarkMode: boolean
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
  ngAfterViewInit() {
    // if (Application.android) {
    //   this.isDarkMode = android.content.res.Configuration.UI_MODE_NIGHT_YES === (Application.android.context.getResources().getConfiguration().uiMode & android.content.res.Configuration.UI_MODE_NIGHT_MASK);

    //   if (this.isDarkMode) {
    //     this.logOutBtnIcon = '~/images/white_logout.png';
    //     this.messageBtnIcon = '~/images/white_message.png';
    //   } else {
    //     this.logOutBtnIcon = '~/images/black_logout.png';
    //     this.messageBtnIcon = '~/images/black_message.png';
    //   }
    // } else if (Application.ios) {
    //   this.isDarkMode = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

    //   if (this.isDarkMode) {
    //     this.logOutBtnIcon = '~/images/white_logout.png';
    //     this.messageBtnIcon = '~/images/white_message.png';
    //   } else {
    //     this.logOutBtnIcon = '~/images/black_logout.png';
    //     this.messageBtnIcon = '~/images/black_message.png';
    //   }
    // }
  }
  async loadAllUsers() {
    const currentUser = await this.userService.getCurrentUser();
    this.userService.getAllUsers().then(
        (users) => {
            this.allUsers = users.filter(user => user.userUid !== currentUser.user.uid);
            this.allUsers.forEach(user => {
                user.profileImage = this.getRandomImagePath();
            });
            this.isLoading = false;
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
  getRandomImagePath(): string {
    const imagePaths = [
      "~/images/man1.png",
      "~/images/man2.png",
      "~/images/man3.png",
    ];
    const randomIndex = Math.floor(Math.random() * imagePaths.length);
    return imagePaths[randomIndex];
  }

}