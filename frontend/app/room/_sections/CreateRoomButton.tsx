'use client';
import React, { useState } from 'react';
import {
  ModalBackDrop,
  ModalContainer,
  CloseButton,
  ModalFooter,
  ModalHeader,
} from '@/app/_components/common';
import { useRouter } from 'next/navigation';

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
      <button onClick={handleOpenModal}>방 개설</button>
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
