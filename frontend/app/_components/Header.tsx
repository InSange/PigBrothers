import { HeaderStyled, LogoImage } from '../(root)/_related/root.styled';
import { HeaderLogoTitle } from '../home/_related/home.styled';

type Props = {
  onClick?: () => void;
};
const PigHeader = ({ onClick }: Props) => {
  return (
    <HeaderStyled>
      {onClick && <button onClick={onClick}>나가기 버튼</button>}
      <LogoImage src={'/logo.svg'} alt='logo' width={40} height={40} />
      <HeaderLogoTitle>PIG BROTHERS</HeaderLogoTitle>
    </HeaderStyled>
  );
};

export default PigHeader;
