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
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CreateRoomButtonContainer } from '../_related/room.styled';

const CreateRoomButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomName, setRoomName] = useState('');
  const router = useRouter();

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
                  onClick={() => {
                    router.push(`/room/${generateUUID()}`);
                    handleCloseModal();
                  }}
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
