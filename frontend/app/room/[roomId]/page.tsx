'use client';
import { Layout } from '@/app/(root)/_related/root.styled';
import Button from '@/app/_components/Button';
import PigHeader from '@/app/_components/Header';
import { useStartGameFirebaseRoomRoomIdStartPut } from '@/app/api/room/hooks/useMutationSession';
import { GlobalContext } from '@/app/GlobalContext';
import { useParams, useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { useContext, useEffect } from 'react';
import { ChatContext } from './_related/ChatProvider';
import { SessionContentContainer } from './_related/session.styled';
import Chatting from './_sections/Chatting';
import ChattingInput from './_sections/ChattingInput';
import Users from './_sections/Users';

const Page = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { userId } = useContext(GlobalContext);
  const { handleLeaveRoom, roomInfo } = useContext(ChatContext);
  const router = useRouter();
  const { mutateAsync: startGame } = useStartGameFirebaseRoomRoomIdStartPut();

  useEffect(() => {
    if (!userId) {
      enqueueSnackbar({ variant: 'error', message: '유저 정보가 없습니다.' });
      return router.push('/home');
    }
  }, []);

  if (!roomId) return;

  const handleGotoBack = () => {
    if (!userId) {
      enqueueSnackbar({ variant: 'error', message: '유저 정보가 없습니다.' });
      return router.push('/home');
    }

    handleLeaveRoom();
    router.push('/room');
  };

  const handleStartGame = () => {
    startGame({ roomId });
  };

  return (
    <Layout style={{ height: '100vh' }}>
      <PigHeader onClick={handleGotoBack} />
      <SessionContentContainer>
        <Users />
        {roomInfo?.RoomHostID === userId && roomInfo?.RoomState === false && (
          <Button onClick={handleStartGame}>게임 시작</Button>
        )}
        <Chatting />
        <ChattingInput />
      </SessionContentContainer>
    </Layout>
  );
};

export default Page;
