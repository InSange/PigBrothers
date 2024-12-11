'use client';
import { Layout } from '@/app/(root)/_related/root.styled';
import PigHeader from '@/app/_components/Header';
import { useStartGameFirebaseRoomRoomIdStartPut } from '@/app/api/room/hooks/useMutationSession';
import { GlobalContext } from '@/app/GlobalContext';
import { useParams, useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { useContext, useEffect, useState } from 'react';
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!userId) {
      enqueueSnackbar({ variant: 'error', message: '유저 정보가 없습니다.' });
      return router.push('/home');
    }
  }, [userId]);

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
    <Layout style={{ height: '100vh', padding: '0px 0px 48px 0px' }}>
      <PigHeader onClick={handleGotoBack} />
      <SessionContentContainer>
        <Users />
        <Chatting />
        <ChattingInput />
      </SessionContentContainer>
    </Layout>
  );
};

export default Page;
