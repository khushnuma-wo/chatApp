import { Component, ElementRef, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { RouterExtensions } from "@nativescript/angular";
import { UserService } from "../services/user.service";
import { ChatService } from "../services/chat.service";
import { MessageModel } from "../state/class/message.class";
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
  channelId: string;
  isAndroid: boolean = false;
  currentUserId: any;
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
    this.currentUserId = currentUser.user.uid;
    const receiverId = this.userId;
    this.route.params.subscribe((params) => {
      this.userName = params.userName;
      this.userId = params.userId;
      this.channelId = params.conversationId;
      const channelId = params.conversationId;
      this.messages = [];
      this.store.dispatch(fetchMessages({ channelId }))
    });
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
        .subscribe((messages: any) => {
          const totalMessages = messages.length;
          this.totalMessages = totalMessages;

          const updatedMessages = messages.map((message) => ({
            ...message,
            seen: message.receiverId !== senderId ? true : message.seen,
          }));

          const messageData = updatedMessages.sort((a, b) => {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
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

  addDateSeparators(messages: any[]): ({ dateSeparator: string })[] {
    const result: ({ dateSeparator: string })[] = [];

    let currentDate = "";

    for (const message of messages) {
      const messageDate = new Date(message.createdAt);
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
    this.isLoading = true;
    const currentUser = await this.userService.getCurrentUser();
    const senderId = currentUser.user.uid;
    const message = this.newMessage;
    const messageID = this.editMessageData?.messageId
    const channelId = this.channelId;
    if (!message.trim() && this.selectedImagePaths.length === 0) {
      this.snackBar('Empty message not allowed...!')
      return;
    }
    if (this.isEdited) {
      const updatedMessageObject = {
        ...this.editMessageData,
        text: message,
        isEdited: true
      };
      this.store.dispatch(updateMessage({ channelId, messageID, updatedMessageObject }))
      this.isEdited = false;
      this.snackBar('Message updated successfully...!')
    } else {
      const messages: MessageModel = {
        text: message,
        medias: this.selectedImagePaths,
        creator: {
          id: senderId,
          firstName: '',
          lastName: '',
        },
        createdAt: new Date().toISOString(),
        type: 'MESSAGE',
        messageId: ''
      }
      this.store.dispatch(sendMessage({ channelId, messages }));
    }
    this.newMessage = '';
    this.selectedImagePaths = [];
    this.scrollToBottom();
    this.isLoading = false;
  }

  scrollToBottom() {
    const scrollView: ScrollView = this.myScrollView.nativeElement;

    const scrollHeight = scrollView.scrollableHeight;
    scrollView.scrollToVerticalOffset(scrollHeight, false);
  }

  snackBar(snackMessage) {
    const options: SnackBarOptions = {
      actionText: "Ok",
      actionTextColor: "white",
      snackText: snackMessage,
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

  async updateReceivedMessageAsSeen(senderId: string, receiverId: string) {
    this.messages.forEach((message) => {
      if (message.receiverId === receiverId && !message.seen) {
        message.seen = true;
      }
    });
  }

  getMessageText(message: any): string {
    if (message.createdAt) {
      const messageTime = new Date(message.createdAt);
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
    const messageID = item?.messageId;
    const channelId = this.channelId;

    if (item?.creator?.id === this.currentUserId) {
      Dialogs
        .action({
          message: "Select an action",
          cancelButtonText: "Cancel",
          actions: ["Edit", "Delete"]
        })
        .then((result) => {
          if (result === "Edit") {
            this.newMessage = item?.text;
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
                this.store.dispatch(deleteChatMessage({ channelId, messageID }));
                this.snackBar('Message deleted successfully...!');
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