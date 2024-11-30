import Button from '@/app/_components/Button';
import Textfield from '@/app/_components/TextField';

const ChattingInput = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '4px',
        flex: 1,
      }}
    >
      <Textfield type='text' />
      <Button style={{ flexShrink: 0, width: 'fit-content' }}>전송</Button>
    </div>
  );
};

export default ChattingInput;
