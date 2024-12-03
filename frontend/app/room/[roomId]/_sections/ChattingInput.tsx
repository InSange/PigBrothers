import Button from '@/app/_components/Button';
import Textfield from '@/app/_components/TextField';
import { GlobalContext } from '@/app/GlobalContext';
import { useContext, useState } from 'react';
import { ChatContext } from '../_related/ChatProvider';

const ChattingInput = () => {
  const { sendMessage } = useContext(ChatContext);
  const { userId } = useContext(GlobalContext);
  const [text, setText] = useState<string>('');

  if (!userId) return;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '4px',
        flex: 1,
      }}
    >
      <Textfield
        type='text'
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <Button
        style={{ flexShrink: 0, width: 'fit-content' }}
        onClick={() => sendMessage({ sender: userId, text, type: 'lobby' })}
      >
        전송
      </Button>
    </div>
  );
};

export default ChattingInput;

[
  { sender: '#!@#!#!@#', text: 'ㅎㅇ' },
  { sender: '123123131', text: '응 ㅎㅇ' },
  { sender: 'manager', text: '돼지 먹어치워라' },
];
