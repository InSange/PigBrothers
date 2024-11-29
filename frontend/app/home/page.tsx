'use client';
import React from 'react';
import JoinRoomButton from './_sections/JoinRoomButton';
import { Header, Layout, LogoImage } from '../(root)/_related/root.styled';
import {
  Carousel,
  ContentContainer,
  HeaderLogoTitle,
} from './_related/home.styled';

const page = () => {
  return (
    <Layout>
      <Header>
        <LogoImage src={'/logo.svg'} alt='logo' width={40} height={40} />
        <HeaderLogoTitle>PIG BROTHERS</HeaderLogoTitle>
      </Header>
      <ContentContainer>
        <Carousel />
        <input type='text' />
        <JoinRoomButton />
      </ContentContainer>
    </Layout>
  );
};

export default page;
