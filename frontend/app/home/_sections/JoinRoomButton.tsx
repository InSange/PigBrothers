'use client';
import generateUUID from '@/app/(root)/_related/generateUUID';
import Button from '@/app/_components/Button';
import { useAddUserFirebaseUserPost } from '@/app/api/user/hooks/useMutationSession';
import { GlobalContext } from '@/app/GlobalContext';
import { useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { useContext } from 'react';

const JoinRoomButton = () => {
  const { name } = useContext(GlobalContext);
  const { mutateAsync: addUser } = useAddUserFirebaseUserPost();
  const router = useRouter();

  const handleAddUser = () => {
    if (!name)
      return enqueueSnackbar({
        message: '이름을 입력해주세요.',
        variant: 'error',
      });
    addUser({ data: { Name: name, RoomID: '', UserID: generateUUID() } }).then(
      () => {
        router.push('/room');
      }
    );
  };

  return <Button onClick={handleAddUser}>게임하러 가기</Button>;
};

export default JoinRoomButton;
