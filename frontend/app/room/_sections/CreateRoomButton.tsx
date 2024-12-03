'use client';
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
import { useContext, useState } from 'react';
import { ChatContext } from '../[roomId]/_related/ChatProvider';
import { CreateRoomButtonContainer } from '../_related/room.styled';

const CreateRoomButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { mutateAsync: addRoom } = useAddRoomFirebaseRoomPost();
  const [roomName, setRoomName] = useState('');
  const { handleConfirmAction } = useContext(ChatContext);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
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
                <Button
                  onClick={() =>
                    handleConfirmAction({ handleCloseModal, roomName })
                  }
                >
                  확인
                </Button>
              </ButtonContainer>
            </ModalFooter>
          </ModalContainer>
        </ModalBackDrop>
      )}
    </>
  );
};

export default CreateRoomButton;
