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
      setTimer(0); // Reset timer
      const interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(interval); // Cleanup on unmount or background change
    }
  }, [background]);

  return (
    <HeaderStyled>
      {onClick && <button onClick={onClick}>나가기 버튼</button>}
      <LogoImage src={'/logo.svg'} alt='logo' width={40} height={40} />
      <HeaderLogoTitle>PIG BROTHERS</HeaderLogoTitle>
      <HeaderLogoTitle>{' ' + currentRoom?.Name.slice(-4)}</HeaderLogoTitle>
      <div>Timer: {timer} seconds</div>
    </HeaderStyled>
  );
};

export default PigHeader;
