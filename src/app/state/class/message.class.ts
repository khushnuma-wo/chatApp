export class Message {
  senderId: string;
  receiverId: string;
  message: string;
  timestamp?: string;
  isLoggedIn?: boolean;
  seen: boolean;
}

