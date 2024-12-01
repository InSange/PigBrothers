'use client';
import { Layout } from '@/app/(root)/_related/root.styled';
import Button from '@/app/_components/Button';
import PigHeader from '@/app/_components/Header';
import {
  useJoinRoomFirebaseRoomRoomIdJoinPut,
  useLeaveRoomFirebaseRoomRoomIdLeavePut,
  useStartGameFirebaseRoomRoomIdStartPut,
} from '@/app/api/room/hooks/useMutationSession';
import { GlobalContext } from '@/app/GlobalContext';
import { useParams, useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { useContext, useEffect } from 'react';
import { SessionContentContainer } from './_related/session.styled';
import Chatting from './_sections/Chatting';
import ChattingInput from './_sections/ChattingInput';
import Users from './_sections/Users';

const Page = () => {
  const { mutateAsync: joinSession } = useJoinRoomFirebaseRoomRoomIdJoinPut();
  const { roomId } = useParams<{ roomId: string }>();
  const { userId } = useContext(GlobalContext);
  const router = useRouter();
  const { mutateAsync: leaveSession } =
    useLeaveRoomFirebaseRoomRoomIdLeavePut();
  const { mutateAsync: startGame } = useStartGameFirebaseRoomRoomIdStartPut();

  useEffect(() => {
    if (!userId) {
      enqueueSnackbar({ variant: 'error', message: '유저 정보가 없습니다.' });
      return router.push('/home');
    }

    joinSession({
      roomId,
      query: {
        user_id: userId,
      },
    });
  }, []);

  const handleGotoBack = () => {
    if (!userId) {
      enqueueSnackbar({ variant: 'error', message: '유저 정보가 없습니다.' });
      return router.push('/home');
    }

    leaveSession({
      roomId,
      query: {
        user_id: userId,
      },
    }).then(() => {
      router.push('/room');
    });
  };

  const handleStartGame = () => {
    startGame({ roomId });
  };

  return (
    <Layout>
      <PigHeader onClick={handleGotoBack} />
      <SessionContentContainer>
        <Users />
        <Button onClick={handleStartGame}>게임 시작</Button>
        <Chatting />
        <ChattingInput />
      </SessionContentContainer>
    </Layout>
  );
};

export default Page;
