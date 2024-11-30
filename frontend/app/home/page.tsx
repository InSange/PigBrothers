'use client';
import { Layout } from '../(root)/_related/root.styled';
import PigHeader from '../_components/Header';
import { Carousel, HomeContentContainer } from './_related/home.styled';
import JoinRoomButton from './_sections/JoinRoomButton';
import NameInput from './_sections/NameInput';

const page = () => {
  return (
    <Layout>
      <PigHeader />
      <HomeContentContainer>
        <Carousel />
        <NameInput />
        <JoinRoomButton />
      </HomeContentContainer>
    </Layout>
  );
};

export default page;
