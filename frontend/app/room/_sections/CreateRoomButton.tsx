'use client';
import {
  CloseButton,
  ModalBackDrop,
  ModalContainer,
  ModalFooter,
  ModalHeader,
} from '@/app/_components/common';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CreateRoomButtonContainer } from '../_related/room.styled';

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
              <div>방 개설하기</div>
              <CloseButton onClick={handleCloseModal}>X</CloseButton>
            </ModalHeader>
            <p>방 이름을 설정해주세요</p>
            <input type='text' />
            <ModalFooter>
              <button onClick={handleCloseModal}>취소</button>
              <button onClick={handleConfirmAction}>확인</button>
            </ModalFooter>
          </ModalContainer>
        </ModalBackDrop>
      )}
    </>
  );
};

export default CreateRoomButton;
