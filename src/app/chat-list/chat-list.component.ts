import { Component } from "@angular/core";
import { RouterExtensions } from "@nativescript/angular";
import { ChatListService } from '../services/chat-list.service';
import { UserService } from "../services/user.service";

@Component({
  selector: "ns-chat",
  templateUrl: "./chat-list.component.html",
  styleUrls: ["./chat-list.component.scss"]
})
export class ChatListComponent {
  public selectedUser: any;
  usersWithMessageCollection: any[] = [];
  userLength: number;
  isLoading: boolean = false;
  newMessagesCount: { [userId: string]: number } = {};

  constructor(private routerExtensions: RouterExtensions,
    private chatListService: ChatListService,
    private userService: UserService) {
  }
  async ngOnInit() {
    this.isLoading = true;
    try {
      const currentUser = await this.userService.getCurrentUser();
      const currentUserUid = currentUser.user.uid;

      const users = await this.chatListService.getUsersWithMessageCollection(currentUserUid);

      this.usersWithMessageCollection = users.filter(user => user.userUid !== currentUserUid);
      let userLength = this.usersWithMessageCollection.length;
      this.userLength = userLength;

      this.isLoading = false;
    } catch (error) {
      console.error('Error fetching users with the message collection:', error);
      this.isLoading = false;
    }
  }
  async openChat(user: any) {
    this.selectedUser = user;
    const userName = user.name;
    const userId = user.userUid;

    await this.chatListService.markMessagesAsSeen(userId);

    this.newMessagesCount[userId] = 0;

    this.routerExtensions.navigate([`/chat/${userName}/${userId}`]);
  }

  getNewMessageCount(userUid: any) {
    let msg = this.chatListService.lastReceivedMessage
    // console.log(msg.seen);
    // console.log(msg);
    
    // console.log(this.chatListService.newMessagesCount[userUid]);
    return this.chatListService.newMessagesCount[userUid]
  }
  goBack() {
    this.routerExtensions.navigate(["/home"])
  }
}