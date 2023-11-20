import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { RouterExtensions } from "@nativescript/angular";
import { UserService } from "../services/user.service";
import { ChatService } from "../services/chat.service";
import { Message } from "../state/class/message.class";
import { Dialogs } from "@nativescript/core";
import * as imagePickerPlugin from '@nativescript/imagepicker';
import { SnackBar, SnackBarOptions } from "@nstudio/nativescript-snackbar";


@Component({
  selector: "ns-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.scss"]
})
export class ChatComponent {
  userName: string;
  userId: string;
  newMessage: string = '';
  messages: Message[] = [];
  isLoading: boolean = false;
  totalMessages: number = 0;
  imageAssets = [];
  imageSrc: any;
  isSingleMode: boolean = true;
  thumbSize: number = 80;
  previewSize: number = 300;
  selectedImagePaths: string[] = [];

  selectedImagePath: string;
  constructor(private route: ActivatedRoute,
    private routerExtensions: RouterExtensions,
    private userService: UserService,
    private chatService: ChatService) {

    this.route.params.subscribe(params => {
      this.userName = params.userName;
    });
    this.route.params.subscribe(params => {
      this.userId = params.userId;
    });
  }
  async ngOnInit() {
    this.route.params.subscribe((params) => {
      this.userName = params.userName;
      this.userId = params.userId;

      this.messages = [];
      this.loadChatMessages();
    });
  }

  async loadChatMessages() {
    const currentUser = await this.userService.getCurrentUser();
    const senderId = currentUser.user.uid;
    const receiverId = this.userId;

    this.isLoading = true;

    this.chatService.fetchMessages(senderId, receiverId).subscribe(
      (messages) => {
        const totalMessages = messages.length;
        this.totalMessages = totalMessages;

        messages.forEach((message) => {
          if (message.receiverId !== senderId) {
            message.seen = true;
          }
        });
        this.messages = messages.sort((a, b) => {
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        });
        this.updateReceivedMessageAsSeen(senderId, receiverId);

        // console.log('Total number of messages:', totalMessages);

        this.isLoading = false;
      },
      (error) => {
        console.error("Error fetching messages:", error);
        this.isLoading = false;
      }
    );
  }
  async sendMessage() {
    const currentUser = await this.userService.getCurrentUser();
    const senderId = currentUser.user.uid;
    const receiverId = this.userId;
    const newMessage = this.newMessage;
  
    if (!newMessage.trim() && this.selectedImagePaths.length === 0) {
      const options: SnackBarOptions = {
        actionText: "Ok",
        actionTextColor: "white",
        snackText: "Empty message not allowed...!",
        textColor: "white",
        hideDelay: 3000,
        backgroundColor: "#2f4b7a",
        isRTL: false,
      };
      const snackbar = new SnackBar();
      snackbar.action(options).then((args) => {
        return;
      });
      return;
    }
  
    const messagesCopy = [...this.messages];
  
    const sentMessage: Message = {
      senderId: senderId,
      receiverId: receiverId,
      message: newMessage,
      timestamp: new Date().toISOString(),
      isLoggedIn: true,
      seen: false,
    };
  
    this.chatService.sendMessage(senderId, receiverId, newMessage).subscribe(
      () => {
        messagesCopy.push(sentMessage);
        messagesCopy.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
        if (this.selectedImagePaths.length > 0) {
          const uploadPromises = this.selectedImagePaths.map((imagePath) =>{ 
            console.log('component : ',imagePath);
            this.chatService.uploadImage(imagePath)});
          Promise.all(uploadPromises)
            .then((uploadedImageUrls) => {              
              const messageWithImages: Message = {
                ...sentMessage,
              };
              messagesCopy.push(messageWithImages);
              this.updateMessages(messagesCopy);
            })
            .catch((error) => {
              console.error("Error uploading images:", error);
            });
        } else {
          this.updateMessages(messagesCopy);
        }
      },
      (error) => {
        console.error("Error sending message:", error);
      }
    );
  }
  updateMessages(messages: Message[]) {
    this.messages = messages;
    this.newMessage = '';
    this.totalMessages = this.messages.length;
  }
  // async sendMessage() {
  //   const currentUser = await this.userService.getCurrentUser();
  //   const senderId = currentUser.user.uid;
  //   const receiverId = this.userId;
  //   const newMessage = this.newMessage;
  //   if (!newMessage.trim()) {
  //     const options: SnackBarOptions = {
  //       actionText: "Ok",
  //       actionTextColor: "white",
  //       snackText: "Empty message not allowed...!",
  //       textColor: "white",
  //       hideDelay: 3000,
  //       backgroundColor: "#2f4b7a",
  //       isRTL: false
  //     };
  //     const snackbar = new SnackBar();
  //     snackbar.action(options).then((args) => {
  //       return;
  //     });
  //     return; 
  //   }
  //   const messagesCopy = [...this.messages];

  //   const sentMessage: Message = {
  //     senderId: senderId,
  //     receiverId: receiverId,
  //     message: newMessage,
  //     timestamp: new Date().toISOString(),
  //     isLoggedIn: true,
  //     seen: false,
  //   };

  //   messagesCopy.push(sentMessage);

  //   messagesCopy.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  //   this.chatService.sendMessage(senderId, receiverId, newMessage).subscribe(
  //     () => {
  //       this.messages = messagesCopy;
  //       this.newMessage = '';
  //       this.totalMessages = this.messages.length;
  //     },
  //     (error) => {
  //       console.error("Error sending message:", error);
  //     }
  //   );
  // }

  async updateReceivedMessageAsSeen(senderId: string, receiverId: string) {
    this.messages.forEach((message) => {
      if (message.receiverId === receiverId && !message.seen) {
        message.seen = true;
      }
    });
  }
  getMessageText(message: Message): string {
    if (message.timestamp) {
      const messageTime = new Date(message.timestamp);
      const hours = messageTime.getHours().toString().padStart(2, '0');
      const minutes = messageTime.getMinutes().toString().padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`;
      return `${formattedTime}`;
    }
    return message.message;
  }

  goBack() {
    this.routerExtensions.navigate(["/home"])
  }
  onUploadMedia() {
    const that = this;
    // console.log(that);
    Dialogs
      .action({
        message: "Add media from",
        cancelButtonText: "Cancel",
        actions: ["Image", "Video"]
      })
      .then((result) => {
        if (result === "Image") {
          var context = imagePickerPlugin.create({
            mode: "multiple"
          });

          context
            .authorize()
            .then(function () {
              return context.present();
            })
            .then(function (selection) {
              // console.log("Selection done:");
              selection.forEach(function (selectedImage) {
                that.selectedImagePath = selectedImage.path;
                that.selectedImagePaths.push(selectedImage.path);
                // console.log(" - " + selectedImage.path);
              });
            }).catch(function (e) {
              console.log(e);
            });
        } else if (result === "Video") {
          // Handle video selection if needed
        }
      });
  }
  removeImage(index: number) {
    this.selectedImagePaths.splice(index, 1); 
  }

}