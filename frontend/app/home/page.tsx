'use client';
import { useRouter } from 'next/navigation';
import { useContext, useEffect } from 'react';
import { Layout } from '../(root)/_related/root.styled';
import PigHeader from '../_components/Header';
import { GlobalContext } from '../GlobalContext';
import { HomeContentContainer } from './_related/home.styled';
import Carousel from './_sections/Carousel';
import NameInput from './_sections/NameInput';

const page = () => {
  const { userId } = useContext(GlobalContext);

  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (userId) {
      router.push('/room');
    }
  }, [userId]);

  return (
    <Layout>
      <PigHeader />
      <HomeContentContainer>
        <Carousel />
        <NameInput />
      </HomeContentContainer>
    </Layout>
  );
};

export default page;
