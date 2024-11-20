import Link from 'next/link';
import styled from 'styled-components';

export const AlignCenterRowStack = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const StyledLink = styled(Link)`
  text-decoration: 'none';
`;

export const ModalBackDrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const ModalContainer = styled.div`
  background-color: #fff;
  padding: 20px;
  border-radius: 5px;
  width: 400px;
  max-width: 80%;
`;

export const ModalHeader = styled(AlignCenterRowStack)`
  justify-content: space-between;
`;

export const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
`;

export const CloseButton = styled.span`
  cursor: pointer;
`;
