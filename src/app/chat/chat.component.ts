import { Component, ElementRef, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { RouterExtensions } from "@nativescript/angular";
import { UserService } from "../services/user.service";
import { ChatService } from "../services/chat.service";
import { Message } from "../state/class/message.class";
import { Dialogs, ScrollView, isIOS, isAndroid } from "@nativescript/core";
import * as imagePickerPlugin from '@nativescript/imagepicker';
import { SnackBar, SnackBarOptions } from "@nstudio/nativescript-snackbar";
import { Application } from "@nativescript/core";
import { IConfirmDialog, showDialogConfirm } from '~/shared/models/confirm-dialog.model'
import { Store } from "@ngrx/store";
import { fetchMessages, sendMessage, deleteChatMessage, updateMessage } from "../state/actions/chat.actions";
import { ImagePickerOptions, Mediafilepicker, VideoPickerOptions } from "nativescript-mediafilepicker";

import { selectChatMessages } from '../state/selectors/chat.selector';
import { Subject, takeUntil } from "rxjs";
const moment = require('moment-timezone');
@Component({
  selector: "ns-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.scss"]
})
export class ChatComponent {
  userName: string;
  userId: string;
  newMessage: string = '';
  messages: any[] = [];
  isLoading: boolean = false;
  totalMessages: number = 0;
  imageAssets = [];
  imageSrc: any;
  isSingleMode: boolean = true;
  thumbSize: number = 80;
  previewSize: number = 300;
  selectedImagePaths: { path: string; fileType: string }[] = [];
  closeBtnIcon: string;
  selectedImagePath: string;
  isEdited: boolean = false;
  editMessageData: any;
  isDarkMode: boolean;
  dateSeparator: any = {};
  currentDate = moment(new Date()).format("YYYY-M-DD");
  today = new Date();
  yesterdayDate = moment(new Date(this.today.setDate(this.today.getDate() - 1))).format("YYYY-M-DD");
  weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  isAndroid: boolean = false;
  @ViewChild("myScrollView", { static: false }) myScrollView: ElementRef<ScrollView>;
  private ngUnsubscribe$ = new Subject();
  constructor(private route: ActivatedRoute,
    private routerExtensions: RouterExtensions,
    private userService: UserService,
    private chatService: ChatService,
    private store: Store,) {
    this.isAndroid = isAndroid;

    this.route.params.subscribe(params => {
      this.userName = params.userName;
    });
    this.route.params.subscribe(params => {
      this.userId = params.userId;
    });
  }
  async ngOnInit() {
    const currentUser = await this.userService.getCurrentUser();
    const senderId = currentUser.user.uid;
    const receiverId = this.userId;
    this.route.params.subscribe((params) => {
      this.userName = params.userName;
      this.userId = params.userId;

      this.messages = [];
    });
    this.store.dispatch(fetchMessages({ senderId, receiverId }))
    this.loadChatMessages();
  }

  async ngAfterViewInit() {
    // if (Application.android) {
    //   this.isDarkMode = android.content.res.Configuration.UI_MODE_NIGHT_YES === (Application.android.context.getResources().getConfiguration().uiMode & android.content.res.Configuration.UI_MODE_NIGHT_MASK);
    //   if (!this.isDarkMode) {
    //     this.closeBtnIcon = '~/images/white_close.png';
    //   } else {
    //     this.closeBtnIcon = '~/images/black_close.png';
    //   }
    // } else if (Application.ios) {
    //   this.isDarkMode = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    //   if (this.isDarkMode) {
    //     this.closeBtnIcon = '~/images/white_close.png';
    //   } else {
    //     this.closeBtnIcon = '~/images/black_close.png';
    //   }
    // }
  }

  async loadChatMessages() {
    try {
      const currentUser = await this.userService.getCurrentUser();
      const senderId = currentUser.user.uid;
      const receiverId = this.userId;

      this.isLoading = true;
      this.store.select(selectChatMessages)
        .pipe(takeUntil(this.ngUnsubscribe$))
        .subscribe((messages: Message[]) => {
          const totalMessages = messages.length;
          this.totalMessages = totalMessages;

          const updatedMessages = messages.map((message: Message) => ({
            ...message,
            seen: message.receiverId !== senderId ? true : message.seen,
          }));

          const messageData = updatedMessages.sort((a, b) => {
            return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          });

          this.messages = this.addDateSeparators(messageData);
          this.updateReceivedMessageAsSeen(senderId, receiverId);
          setTimeout(() => {
            this.isLoading = false;
          }, 800)
          this.scrollToBottom();
        });
    } catch (error) {
      console.error('Error loading chat messages:', error);
      this.isLoading = false;
    }
  }

  addDateSeparators(messages: Message[]): (Message | { dateSeparator: string })[] {
    const result: (Message | { dateSeparator: string })[] = [];

    let currentDate = "";

    for (const message of messages) {
      const messageDate = new Date(message.timestamp);
      const today = new Date();

      let formattedDate: string;

      if (messageDate.toDateString() === today.toDateString()) {
        formattedDate = "Today";
      } else {
        formattedDate = messageDate.toDateString();
      }

      if (formattedDate !== currentDate) {
        result.push({ dateSeparator: formattedDate });
        currentDate = formattedDate;
      }

      result.push(message);
    }

    return result;
  }

  async sendMessage() {
    const currentUser = await this.userService.getCurrentUser();
    const senderId = currentUser.user.uid;
    const userId = currentUser.user.uid;
    const receiverId = this.userId;
    const message = this.newMessage;
    const imageUrls = this.selectedImagePaths;
    const messageID = this.editMessageData?.id
    if (this.isEdited) {
      const updatedMessageObject = {
        ...this.editMessageData,
        message: message,
        isEdited: true
      };
      this.store.dispatch(updateMessage({ userId, messageID, updatedMessageObject }))
      const options: SnackBarOptions = {
        actionText: "Ok",
        actionTextColor: "white",
        snackText: "Message updated successfully...!",
        textColor: "white",
        hideDelay: 3000,
        backgroundColor: "#2f4b7a",
        isRTL: false,
      };
      const snackbar = new SnackBar();
      snackbar.action(options).then((args) => {
        return;
      });
      this.isEdited = false;
    } else {
      if (!message.trim() && this.selectedImagePaths.length === 0) {
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
      this.store.dispatch(sendMessage({ senderId, receiverId, message, timestamp: new Date().toISOString(), isLoggedIn: true, imageUrls }));
      this.store.dispatch(fetchMessages({ senderId, receiverId }));
    }
    this.newMessage = '';
    this.selectedImagePaths = [];
    this.scrollToBottom();
  }

  scrollToBottom() {
    const scrollView: ScrollView = this.myScrollView.nativeElement;

    const scrollHeight = scrollView.scrollableHeight;
    scrollView.scrollToVerticalOffset(scrollHeight, false);
  }

  updateMessages(messages: Message[]) {
    this.messages = messages;
    this.newMessage = '';
    this.totalMessages = this.messages.length;
  }

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
      const hours = messageTime.getHours();
      const minutes = messageTime.getMinutes();
      const amPm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = (hours % 12) || 12;
      const formattedTime = `${formattedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${amPm}`;
      return formattedTime;
    }
    return message.message;
  }

  goBack() {
    this.routerExtensions.navigate(["/home"])
  }

  onUploadMedia() {
    const that = this;
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
              selection.forEach(function (selectedImage) {
                const imageData = {
                  path: selectedImage.path,
                  fileType: 'png'
                }
                that.selectedImagePath = selectedImage.path;
                that.selectedImagePaths.push(imageData);
              });
            }).catch(function (e) {
              console.log(e);
            });
        } else if (result === "Video") {
          console.log("video")
          this.selectVideoFromPhotoLibrary();
        }
      });
  }

  selectVideoFromPhotoLibrary(capture: boolean = false) {
    let allowedVideoQualities = [];

    if (isIOS) {
      allowedVideoQualities = [AVCaptureSessionPreset1920x1080, AVCaptureSessionPresetHigh];
    }

    let options: VideoPickerOptions = {
      android: {
        isCaptureMood: false,
        isNeedCamera: true,
        maxNumberFiles: 2,
        isNeedFolderList: true,
        maxDuration: 20,

      },
      ios: {
        isCaptureMood: false,
        videoMaximumDuration: 10,
        allowedVideoQualities: allowedVideoQualities
      }
    };
    let mediafilepicker = new Mediafilepicker();
    mediafilepicker.openVideoPicker(options);

    mediafilepicker.on("getFiles", function (res) {
      let results = res.object.get('results');
      console.log(results);
    });
    mediafilepicker.on("error", function (res) {
      let error = res.object.get('msg');
      console.error(error);
    });
  }

  removeImage(index: number) {
    this.selectedImagePaths.splice(index, 1);
  }

  async onLongPress(args: UILongPressGestureRecognizer, item: any) {
    const currentUser = await this.userService.getCurrentUser();
    const userId = currentUser.user.uid;
    const messageID = item?.id;

    if (item?.isLoggedIn) {
      Dialogs
        .action({
          message: "Select an action",
          cancelButtonText: "Cancel",
          actions: ["Edit", "Delete"]
        })
        .then((result) => {
          if (result === "Edit") {
            this.newMessage = item?.message;
            this.editMessageData = item;
            this.isEdited = true
          } else if (result === "Delete") {
            const dialog: IConfirmDialog = {
              title: "Confirm",
              message: "Are you sure you want to delete this message?",
              okButtonText: "Delete",
              cancelButtonText: "Cancel"
            };
            showDialogConfirm(dialog).then((res) => {
              if (res) {
                this.store.dispatch(deleteChatMessage({ userId, messageID }));
                const options: SnackBarOptions = {
                  actionText: "Ok",
                  actionTextColor: "white",
                  snackText: "Message deleted successfully...!",
                  textColor: "white",
                  hideDelay: 3000,
                  backgroundColor: "#2f4b7a",
                  isRTL: false,
                };
                const snackbar = new SnackBar();
                snackbar.action(options).then((args) => {
                  return;
                });
              }
            })
          }
        });
    }
  }

  cancelEditedMessage() {
    this.newMessage = '';
    this.isEdited = false;
  }
}