import generateUUID from '@/app/(root)/_related/generateUUID';
import Button from '@/app/_components/Button';
import { useAddUserFirebaseUserPost } from '@/app/api/user/hooks/useMutationSession';
import { GlobalContext } from '@/app/GlobalContext';
import { useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { useContext, useState } from 'react';

const NameInput = () => {
  const { userId: user, handleChangeUser: handleChangeName } =
    useContext(GlobalContext);
  const { mutateAsync: addUser } = useAddUserFirebaseUserPost();
  const router = useRouter();
  const [name, setName] = useState<string>('');

  const handleAddUser = () => {
    if (!name)
      return enqueueSnackbar({
        message: '이름을 입력해주세요.',
        variant: 'error',
      });
    const newId = generateUUID();

    addUser({
      data: { Name: name, UserID: newId },
    }).then(() => {
      handleChangeName(newId);
      router.push('/room');
    });
  };

  return (
    <div style={{ width: '70%' }}>
      <input
        type='text'
        style={{ width: '100%', marginBottom: '16px' }}
        value={name ?? ''}
        placeholder='이름을 입력해주세요.'
        onChange={(e) => setName(e.target.value)}
      />
      <Button onClick={handleAddUser}>채팅하러 가기</Button>
    </div>
  );
};

export default NameInput;
