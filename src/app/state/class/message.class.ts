export class Message {
  id?: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: string;
  isLoggedIn?: boolean;
  seen: boolean;
  imageUrls?: any
}

