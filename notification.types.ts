export interface Notification {
  id: string;
  userId?: string;
  title: string;
  body: string;
  message?: string;
  type?: 'system' | 'reminder' | 'message' | 'comment' | 'reaction' | string;
  createdAt: string;
  read?: boolean;
  readBy?: string[];
}
