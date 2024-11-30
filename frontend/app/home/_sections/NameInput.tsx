import { GlobalContext } from '@/app/GlobalContext';
import { useContext } from 'react';

const NameInput = () => {
  const { name, handleChangeName } = useContext(GlobalContext);

  return (
    <input
      type='text'
      style={{ width: '100%' }}
      value={name}
      placeholder='이름을 입력해주세요.'
      onChange={(e) => handleChangeName(e.target.value)}
    />
  );
};

export default NameInput;
