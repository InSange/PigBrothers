import { RoomModel } from '@/types/Api';

export type ApiAddRoomFirebaseRoomPostParams = {
  data: RoomModel;
};

export type ApiStartGameFirebaseRoomIdStartPutParams = {
  roomId: string;
};

export type ApiEndGameFirebaseRoomRoomIdEndPutParams = {
  roomId: string;
};

export type ApiLeaveRoomFirebaseRoomRoomIdLeavePutParams = {
  roomId: string;
  query: {
    user_id: string;
  };
};

export type ApiJoinRoomFirebaseRoomRoomIdJoinPutParams = {
  roomId: string;
  query: {
    user_id: string;
  };
};
