'use client';
import { Layout } from '../(root)/_related/root.styled';
import PigHeader from '../_components/Header';
import {
  RoomContentContainer,
  RoomListContainer,
  RoomListTitle,
  RoomTitleContainer,
} from './_related/room.styled';
import CreateRoomButton from './_sections/CreateRoomButton';
import RoomList from './_sections/RoomList';

const page = () => {
  const rooms = [
    {
      id: 1,
      name: '방 들어오실 분1?',
    },
    {
      id: 2,
      name: '방 들어오실 분2?',
    },
    {
      id: 3,
      name: '방 들어오실 분3?',
    },
    {
      id: 4,
      name: '방 들어오실 분4?',
    },
    {
      id: 5,
      name: '방 들어오실 분5?',
    },
    {
      id: 6,
      name: '방 들어오실 분6?',
    },
    {
      id: 7,
      name: '방 들어오실 분7?',
    },
    {
      id: 8,
      name: '방 들어오실 분8?',
    },
    {
      id: 9,
      name: '방 들어오실 분9?',
    },
    {
      id: 10,
      name: '방 들어오실 분10?',
    },
  ];
  return (
    <Layout>
      <PigHeader />
      <RoomContentContainer>
        <RoomTitleContainer>
          <RoomListTitle>방 리스트</RoomListTitle>
          <CreateRoomButton />
        </RoomTitleContainer>
        <RoomListContainer>
          {rooms.map((room) => (
            <RoomList key={room.id} room={room} />
          ))}
        </RoomListContainer>
      </RoomContentContainer>
    </Layout>
  );
};

export default page;
