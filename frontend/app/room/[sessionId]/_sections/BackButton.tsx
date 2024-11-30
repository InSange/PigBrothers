'use client';
import { StyledLink } from '@/app/_components/common';

type Props = {
  href: string;
};
const BackButton = ({ href }: Props) => {
  return (
    <StyledLink href={href}>
      <button>나가기 버튼</button>
    </StyledLink>
  );
};

export default BackButton;
