'use client';
import { Layout } from '@/app/(root)/_related/root.styled';
import Button from '@/app/_components/Button';
import PigHeader from '@/app/_components/Header';
import { SessionContentContainer } from './_related/session.styled';
import Chatting from './_sections/Chatting';
import ChattingInput from './_sections/ChattingInput';
import Users from './_sections/Users';

const page = () => {
  return (
    <Layout>
      <PigHeader href={'/room'} />
      <SessionContentContainer>
        <Users />
        <Button>게임 시작</Button>
        <Chatting />
        <ChattingInput />
      </SessionContentContainer>
    </Layout>
  );
};

export default page;
