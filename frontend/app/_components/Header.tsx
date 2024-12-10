import { useParams } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import { HeaderStyled, LogoImage } from '../(root)/_related/root.styled';
import { useGetRoomStatusFirebaseRoomRoomIdGet } from '../api/room/hooks/useQueryRoom';
import { HeaderLogoTitle } from '../home/_related/home.styled';
import { ChatContext } from '../room/[roomId]/_related/ChatProvider';

type Props = {
  onClick?: () => void;
};
const PigHeader = ({ onClick }: Props) => {
  const { roomId } = useParams<{ roomId: string }>();
  const { data: currentRoom } = useGetRoomStatusFirebaseRoomRoomIdGet({
    roomId,
  });
  const { background } = useContext(ChatContext);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (background?.time) {
      setTimer(background.time); // Set initial time from background
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 0) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [background]);

  return (
    <HeaderStyled>
      {onClick && <button onClick={onClick}>나가기 버튼</button>}
      <LogoImage src={'/logo.svg'} alt='logo' width={40} height={40} />
      <HeaderLogoTitle>PIG BROTHERS</HeaderLogoTitle>
      <HeaderLogoTitle>{' ' + currentRoom?.Name.slice(-4)}</HeaderLogoTitle>
      <div style={{ display: 'flex', flex: 1 }} />
      {timer >= 0 && <HeaderLogoTitle>timer : {timer}</HeaderLogoTitle>}
    </HeaderStyled>
  );
};

export default PigHeader;
