'use client';
import { Layout } from '../(root)/_related/root.styled';
import PigHeader from '../_components/Header';
import { useGetAllRoomsFirebaseRoomGet } from '../api/room/hooks/useQueryRoom';
import {
  RoomContentContainer,
  RoomListContainer,
  RoomListTitle,
  RoomTitleContainer,
} from './_related/room.styled';
import CreateRoomButton from './_sections/CreateRoomButton';
import RoomList from './_sections/RoomList';

const page = () => {
  const { data: rooms } = useGetAllRoomsFirebaseRoomGet();

  return (
    <Layout>
      <PigHeader />
      <RoomContentContainer>
        <RoomTitleContainer>
          <RoomListTitle>방 리스트</RoomListTitle>
          <CreateRoomButton />
        </RoomTitleContainer>
        <RoomListContainer>
          {rooms?.map((room) => <RoomList key={room.RoomID} room={room} />)}
        </RoomListContainer>
      </RoomContentContainer>
    </Layout>
  );
};

export default page;
