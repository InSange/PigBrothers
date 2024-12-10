import { RoomModel } from '@/types/Api';

export type ProcessType = 'start' | 'dayTime' | 'vote' | 'night' | 'end' | null;

// 서버 -> 클라이언트
export type Message =
  | {
      type: 'state';
      userID: string;
      speak: boolean;
    }
  | {
      type: 'gameInfo';
      // 현재 발표하고 있는 사람
      current_player: string;
      // 살아있는 사람
      live_player: string[];
      // 죽은 사람
      dead_player: string[];
      // 현재 게임 상태
      process: ProcessType;
      // 늑대 유저
      wolf: string;
      // 늑대 발표 단어
      wolfSubject: string;
      // 돼지 발표 단어
      pigSubject: string;
    }
  | {
      type: 'roomInfo';
      room: RoomModel;
    }
  | {
      type: 'role';
      userID: string;
      role: 'wolf' | 'pig';
      word: string;
    }
  | {
      type: 'process';
      state: ProcessType;
      time: number;
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
export type ProcessMessage = Extract<Message, { type: 'process' }> | null;
export type GameInfoMessage = Extract<Message, { type: 'gameInfo' }>;
