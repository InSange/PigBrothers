import Button from '@/app/_components/Button';
import Textfield from '@/app/_components/TextField';
import { GlobalContext } from '@/app/GlobalContext';
import { useContext, useState } from 'react';
import { ChatContext } from '../_related/ChatProvider';

const ChattingInput = () => {
  const { sendMessage } = useContext(ChatContext);
  const { userId } = useContext(GlobalContext);
  const [text, setText] = useState<string>('');

  if (!userId) return null;

  const handleSend = () => {
    if (text.trim() === '') return; // 빈 메시지는 전송하지 않음
    sendMessage({ userID: userId, text, type: 'chat' });
    setText('');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '4px',
      }}
    >
      <Textfield
        type='text'
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault(); // 폼 제출 등의 기본 동작 방지
            handleSend();
          }
        }}
      />
      <Button
        style={{ flexShrink: 0, width: 'fit-content' }}
        onClick={handleSend}
      >
        전송
      </Button>
    </div>
  );
};

export default ChattingInput;
