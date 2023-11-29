import { Component, OnInit } from "@angular/core";
import { RouterExtensions } from "@nativescript/angular";
import { UserService } from "../services/user.service";
import { Feedback, FeedbackType, FeedbackPosition } from "nativescript-feedback";
import { Dialogs } from "@nativescript/core";
import { ChatListService } from "../services/chat-list.service";
import { Application } from "@nativescript/core";
import { ChatService } from "../services/chat.service";
import { ChannelModel } from "../state/class/message.class";

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
  randomImagePath: any
  currentUser: any;
  currentUserId: any
  constructor(private routerExtensions: RouterExtensions,
    private userService: UserService,
    private chatService: ChatService,
    private chatListService: ChatListService) {
    this.feedback = new Feedback();
  }
  logOutBtnIcon: string;
  messageBtnIcon: string;
  isDarkMode: boolean
  userId: any;
  conversations: any;

  async ngOnInit() {
    this.currentUser = await this.userService.getCurrentUser();
    this.currentUserId = this.currentUser.user.uid
    this.isLoading = true;

    try {
      const users = await this.chatListService.getUsersWithMessageCollection(this.currentUserId);

      this.usersWithMessageCollection = users.filter(user => user.userUid !== this.currentUserId);
      let userLength = this.usersWithMessageCollection.length;
      this.userLength = userLength
    }
    catch (error) {
      console.error('Error fetching users:', error);
      this.isLoading = false;
    }

    this.chatService.getConversation(this.currentUserId).subscribe((res) => {
      this.conversations = res

    })
    this.loadAllUsers();
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
    try {
      const currentUser = await this.userService.getCurrentUser();
      const users = await this.userService.getAllUsers();
  
      this.allUsers = users
        .filter(user => user.userUid !== currentUser.user.uid);
  
      for (const user of this.allUsers) {
        user.profileImage = this.getRandomImagePath();
        user.latest = await this.getLatestMessageOfUser(user.userUid, currentUser.user.uid);
      }
  
      this.isLoading = false;
    } catch (error) {
      console.error("Error loading users:", error);
    }
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

  async onChat(user: any) {
    this.selectedUser = user;
    const userName = user.name;
    this.userId = user.userUid;
    const { isMembersPresent, conversationId } = this.checkMembers(this.conversations, this.currentUserId, this.userId);
    console.log("conversationId", isMembersPresent, conversationId)
    if (!isMembersPresent) {
      const channelObj: ChannelModel = {
        createdAt: '',
        latest: {
          createdAt: '',
          text: '',
          type: 'MESSAGE',
          messageId: '',
        },
        membersCount: 0,
        members: [this.currentUserId, this.userId]
      };
      this.chatService.createChannel(channelObj)
    }
    await this.routerExtensions.navigate([`/chat/${userName}/${this.userId}/${conversationId}`]);
  }
  
  checkMembers(conversations: any[], senderId: string, receiverId: string): { isMembersPresent: boolean, conversationId?: string } {
    if (conversations) {
      const matchingConversation = conversations.find((conversation) => {
        return (
          conversation.members.includes(senderId) &&
          conversation.members.includes(receiverId)
        );
      });
  
      return {
        isMembersPresent: !!matchingConversation,
        conversationId: matchingConversation ? matchingConversation.id : undefined,
      };
    } else {
      return { isMembersPresent: false };
    }
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

  getLatestMessageOfUser(userId, currentUserId) {
    const matchingConversation = this.conversations?.find((conversation) => (
      conversation.members.includes(userId) &&
      conversation.members.includes(currentUserId)
    ));
    return matchingConversation?.latest;
  }
  
  getMessageText(message: any): string {
    if (message?.createdAt) {
      const messageTime = new Date(message?.createdAt);
      const hours = messageTime.getHours();
      const minutes = messageTime.getMinutes();
      const amPm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = (hours % 12) || 12;
      const formattedTime = `${formattedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${amPm}`;
      return formattedTime;
    }
    return message.message;
  }

}