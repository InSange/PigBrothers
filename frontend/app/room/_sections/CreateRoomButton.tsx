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
import { GlobalContext } from '@/app/GlobalContext';
import { useRouter } from 'next/navigation';
import { useContext, useState } from 'react';
import { CreateRoomButtonContainer } from '../_related/room.styled';

const CreateRoomButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomName, setRoomName] = useState('');
  const router = useRouter();
  const { handleChangeRoomName } = useContext(GlobalContext);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setRoomName('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setRoomName('');
    handleChangeRoomName(roomName);
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
                <Button
                  style={{ width: 'fit-content' }}
                  color='secondary'
                  onClick={handleCloseModal}
                >
                  취소
                </Button>
                <Button
                  style={{ width: 'fit-content' }}
                  onClick={() => {
                    handleCloseModal();
                    setTimeout(() => {
                      router.push(`/room/${generateUUID()}`);
                    }, 300);
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
