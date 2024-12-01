'use client';
import generateUUID from '@/app/(root)/_related/generateUUID';
import Button from '@/app/_components/Button';
import {
  ButtonContainer,
  CloseButton,
  ModalBackDrop,
  ModalContainer,
  ModalFooter,
  ModalHeader,
  ModalHeaderTitle,
  XIcon,
} from '@/app/_components/common';
import Textfield from '@/app/_components/TextField';
import { useAddRoomFirebaseRoomPost } from '@/app/api/room/hooks/useMutationSession';
import { GlobalContext } from '@/app/GlobalContext';
import { useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { useContext, useState } from 'react';
import { CreateRoomButtonContainer } from '../_related/room.styled';

const CreateRoomButton = () => {
  const { userId } = useContext(GlobalContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const { mutateAsync: addRoom } = useAddRoomFirebaseRoomPost();
  const [roomName, setRoomName] = useState('');

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleConfirmAction = () => {
    if (!userId) {
      enqueueSnackbar({ variant: 'error', message: '유저 정보가 없습니다.' });
      return router.push('/home');
    }

    if (!roomName) {
      enqueueSnackbar({ variant: 'error', message: '방 제목을 입력해주세요.' });
      return;
    }

    addRoom({
      query: {
        room_id: generateUUID(),
        room_name: roomName,
        user_id: userId,
      },
    }).then((response) => {
      router.push(`/room/${response.RoomID}`);
      handleCloseModal();
    });
  };

  return (
    <>
      <CreateRoomButtonContainer onClick={handleOpenModal}>
        +
      </CreateRoomButtonContainer>
      {isModalOpen && (
        <ModalBackDrop>
          <ModalContainer>
            <ModalHeader>
              <ModalHeaderTitle>방 개설하기</ModalHeaderTitle>
              <CloseButton onClick={handleCloseModal}>
                <XIcon src={'/x.svg'} />
              </CloseButton>
            </ModalHeader>
            <Textfield
              placeholder='방 제목'
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
            <ModalFooter>
              <ButtonContainer>
                <Button color='secondary' onClick={handleCloseModal}>
                  취소
                </Button>
                <Button onClick={handleConfirmAction}>확인</Button>
              </ButtonContainer>
            </ModalFooter>
          </ModalContainer>
        </ModalBackDrop>
      )}
    </>
  );
};

export default CreateRoomButton;
