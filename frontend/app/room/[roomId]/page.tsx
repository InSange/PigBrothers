'use client';
import { Layout } from '@/app/(root)/_related/root.styled';
import Button from '@/app/_components/Button';
import { ModalContainer } from '@/app/_components/common';
import PigHeader from '@/app/_components/Header';
import { useStartGameFirebaseRoomRoomIdStartPut } from '@/app/api/room/hooks/useMutationSession';
import { GlobalContext } from '@/app/GlobalContext';
import Knife from '@/public/knife.json';
import Night from '@/public/night-morning.json';
import Vote from '@/public/vote.json';
import { useParams, useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { useContext, useEffect, useState } from 'react';
import Lottie from 'react-lottie-player';
import { ChatContext } from './_related/ChatProvider';
import { SessionContentContainer } from './_related/session.styled';
import Chatting from './_sections/Chatting';
import ChattingInput from './_sections/ChattingInput';
import Users from './_sections/Users';

const Page = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { userId } = useContext(GlobalContext);
  const { handleLeaveRoom, roomInfo, background, gameInfo } =
    useContext(ChatContext);
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

  const handleLottieJson = () => {
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (!background?.state) return;
    handleLottieJson();
  }, [background?.state]);

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
            backgroundColor: 'transparent',
            position: 'absolute',
          }}
        >
          {background?.state === 'dayTime' ? (
            <Lottie
              animationData={Night}
              segments={[500, 60]} // 1초(60프레임)에서 10초(600프레임) 구간 재생
              play
              direction={-1}
              onComplete={() => setIsModalOpen(false)}
            />
          ) : background?.state === 'vote' ? (
            <Lottie
              animationData={Vote}
              segments={[100, 600]} // 1초(60프레임)에서 10초(600프레임) 구간 재생
              play
              onComplete={() => setIsModalOpen(false)}
            />
          ) : (
            background?.state === 'night' &&
            (isMeLiar ? (
              <Lottie
                animationData={Knife}
                segments={[100, 600]} // 1초(60프레임)에서 10초(600프레임) 구간 재생
                play
                onComplete={() => setIsModalOpen(false)}
              />
            ) : (
              <Lottie
                animationData={Night}
                segments={[100, 600]} // 1초(60프레임)에서 10초(600프레임) 구간 재생
                play
                onComplete={() => setIsModalOpen(false)}
              />
            ))
          )}
        </ModalContainer>
      )}
    </Layout>
  );
};

export default Page;
