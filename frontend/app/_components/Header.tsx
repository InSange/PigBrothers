import { useParams } from 'next/navigation';
import { HeaderStyled, LogoImage } from '../(root)/_related/root.styled';
import { useGetRoomStatusFirebaseRoomRoomIdGet } from '../api/room/hooks/useQueryRoom';
import { HeaderLogoTitle } from '../home/_related/home.styled';

type Props = {
  onClick?: () => void;
};
const PigHeader = ({ onClick }: Props) => {
  const { roomId } = useParams<{ roomId: string }>();
  const { data: currentRoom } = useGetRoomStatusFirebaseRoomRoomIdGet({
    roomId,
  });

  return (
    <HeaderStyled>
      {onClick && <button onClick={onClick}>나가기 버튼</button>}
      <LogoImage src={'/logo.svg'} alt='logo' width={40} height={40} />
      <HeaderLogoTitle>PIG BROTHERS</HeaderLogoTitle>
      <HeaderLogoTitle>{' ' + currentRoom?.Name.slice(-4)}</HeaderLogoTitle>
    </HeaderStyled>
  );
};

export default PigHeader;
