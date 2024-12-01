import { InputHTMLAttributes, memo } from 'react';
import styled from 'styled-components';

// Input 속성 타입 정의
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean; // 에러 상태 여부
}

// Input 컴포넌트
const Textfield = memo(({ ...rest }: InputProps) => {
  return <InputStyled {...rest} />;
});

export default Textfield;

// 스타일 정의
const InputStyled = styled.input<{ error?: boolean }>`
  width: 100%;
  padding: 8px 8px;
  border: 1px solid
    ${({ error, theme }) => (error ? theme.colors.error : '#939393')};
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  background-color: #fff;
  color: #000;
  transition:
    border-color 0.3s,
    box-shadow 0.3s;

  // 기본 상태
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 4px ${({ theme }) => theme.colors.primary};
  }

  // 비활성화 상태
  &:disabled {
    background-color: ${({ theme }) => theme.colors.disabledBackground};
    color: ${({ theme }) => theme.colors.disabledText};
    cursor: not-allowed;
  }

  // 에러 상태
  ${({ error, theme }) =>
    error &&
    `
    border-color: ${theme.colors.error};
    box-shadow: 0 0 4px ${theme.colors.error};
  `}
`;
