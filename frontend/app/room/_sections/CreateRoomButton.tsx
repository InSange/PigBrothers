'use client';
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
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CreateRoomButtonContainer } from '../_related/room.styled';
import Textfield from '@/app/_components/TextField';
import Button from '@/app/_components/Button';

const CreateRoomButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleConfirmAction = () => {
    router.push('/room/1');
    handleCloseModal();
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
            <Textfield placeholder='방 제목' />
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
