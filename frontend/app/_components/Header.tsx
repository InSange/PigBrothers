import { useContext, useEffect, useState } from 'react';
import { HeaderStyled, LogoImage } from '../(root)/_related/root.styled';
import { HeaderLogoTitle } from '../home/_related/home.styled';
import { ChatContext } from '../room/[roomId]/_related/ChatProvider';
import Button from './Button';

type Props = {
  onClick?: () => void;
};
const PigHeader = ({ onClick }: Props) => {
  const { background, gameInfo, roomInfo } = useContext(ChatContext);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (background?.time) {
      setTimer(background.time); // Set initial time from background
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev < 0) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [background, gameInfo?.current_player]); // Add gameInfo?.current_player to dependencies

  return (
    <HeaderStyled>
      {onClick && (
        <Button style={{ width: 'fit-content' }} onClick={onClick}>
          {'<'}
        </Button>
      )}
      <LogoImage src={'/logo.svg'} alt='logo' width={40} height={40} />
      <HeaderLogoTitle>PIG BROTHERS</HeaderLogoTitle>
      <div style={{ display: 'flex', flex: 1 }} />
      {roomInfo?.RoomState === true && (
        <HeaderLogoTitle>timer : {timer}</HeaderLogoTitle>
      )}
    </HeaderStyled>
  );
};

export default PigHeader;
