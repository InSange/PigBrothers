'use client';
import { Layout } from '@/app/(root)/_related/root.styled';
import Button from '@/app/_components/Button';
import { ModalContainer } from '@/app/_components/common';
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
  const { handleLeaveRoom, roomInfo, gameInfo } = useContext(ChatContext);
  const router = useRouter();
  const { mutateAsync: startGame } = useStartGameFirebaseRoomRoomIdStartPut();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isMeLiar = gameInfo?.wolf === userId;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!userId) {
      enqueueSnackbar({ variant: 'error', message: '유저 정보가 없습니다.' });
      return router.push('/home');
    }
  }, [userId]);

  useEffect(() => {
    if (gameInfo?.pigSubject) {
      setIsModalOpen(true);

      const timer = setTimeout(() => {
        setIsModalOpen(false);
      }, 7000);

      return () => clearTimeout(timer);
    }
  }, [gameInfo?.pigSubject]);

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
        {roomInfo?.RoomHostID === userId && roomInfo?.RoomState === false && (
          <Button onClick={handleStartGame}>게임 시작</Button>
        )}
        <Chatting />
        <ChattingInput />
      </SessionContentContainer>
      {isModalOpen && (
        <ModalContainer
          style={{
            left: '50%',
            top: '60%',
            transform: 'translate(-50%, -50%)',
            position: 'absolute',
            boxShadow: '1px 1px 1px 1px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            padding: '10px',
            height: '100px',
            backgroundColor: 'white',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          제시어 : {isMeLiar ? gameInfo?.wolfSubject : gameInfo?.pigSubject}
        </ModalContainer>
      )}
    </Layout>
  );
};

export default Page;
