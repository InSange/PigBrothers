// 서버 -> 클라이언트
export type Message =
  | {
      type: 'state';
      userID: string;
      speak: boolean;
    }
  | {
      type: 'role';
      userID: string;
      role: 'wolf' | 'pig';
      word: string;
    }
  | {
      type: 'process';
      state: 'start' | 'dayTime' | 'vote' | 'night' | 'end';
    }
  | {
      type: 'chat';
      userID: string;
      text: string;
    }
  | {
      type: 'alert';
      text: string;
    }
  | {
      type: 'leave';
      userID: string;
    }
  | {
      type: 'vote';
      userID: string;
    }
  | {
      type: 'kill';
      userID: string;
    };
export type ChatOrAlertMessage = Extract<Message, { type: 'chat' | 'alert' }>;
export type ChatMessage = Extract<ChatOrAlertMessage, { type: 'chat' }>;
export type AlertMessage = Extract<ChatOrAlertMessage, { type: 'alert' }>;
