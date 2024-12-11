import { HeaderStyled, LogoImage } from '../(root)/_related/root.styled';
import { HeaderLogoTitle } from '../home/_related/home.styled';
import Button from './Button';

type Props = {
  onClick?: () => void;
};
const PigHeader = ({ onClick }: Props) => {
  return (
    <HeaderStyled>
      {onClick && (
        <Button style={{ width: 'fit-content' }} onClick={onClick}>
          {'<'}
        </Button>
      )}
      <LogoImage src={'/logo.svg'} alt='logo' width={40} height={40} />
      <HeaderLogoTitle>PIG CHATS</HeaderLogoTitle>
    </HeaderStyled>
  );
};

export default PigHeader;
