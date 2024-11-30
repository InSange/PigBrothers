import { HeaderStyled, LogoImage } from '../(root)/_related/root.styled';
import { HeaderLogoTitle } from '../home/_related/home.styled';
import BackButton from '../room/[sessionId]/_sections/BackButton';

type Props = {
  href?: string;
};
const PigHeader = ({ href }: Props) => {
  return (
    <HeaderStyled>
      {href && <BackButton href={href} />}
      <LogoImage src={'/logo.svg'} alt='logo' width={40} height={40} />
      <HeaderLogoTitle>PIG BROTHERS</HeaderLogoTitle>
    </HeaderStyled>
  );
};

export default PigHeader;
