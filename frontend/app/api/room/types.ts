export type ApiAddRoomFirebaseRoomPostParams = {
  query: {
    room_name: string;
    room_id: string;
    user_id: string;
  };
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
