import { HeaderStyled, LogoImage } from '../(root)/_related/root.styled';
import { HeaderLogoTitle } from '../home/_related/home.styled';

const PigHeader = () => {
  return (
    <HeaderStyled>
      <LogoImage src={'/logo.svg'} alt='logo' width={40} height={40} />
      <HeaderLogoTitle>PIG BROTHERS</HeaderLogoTitle>
    </HeaderStyled>
  );
};

export default PigHeader;
