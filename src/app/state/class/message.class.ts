// export class Message {
//   id?: string;
//   senderId: string;
//   receiverId: string;
//   message: string;
//   timestamp: string;
//   isLoggedIn?: boolean;
//   seen: boolean;
//   imageUrls?: any
// }

export interface ChannelModel {
  members: Array<string>;
  membersCount: number;
  latest?: MessageModel;
  createdAt: string;
  updatedAt?: string;
}

export interface CreatorModel {
  id: string;
  firstName: string;
  lastName: string;
}

export interface MessageModel {
  text?: string;
  medias?: any;
  creator?: CreatorModel;
  createdAt?: string;
  updatedAt?: string;
  isRemoved?: boolean;
  messageId: string;
  type?: string;
}