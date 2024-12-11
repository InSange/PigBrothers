'use client';
import { useRouter } from 'next/navigation';
import { useContext, useEffect } from 'react';
import { Layout, LogoImage } from '../(root)/_related/root.styled';
import PigHeader from '../_components/Header';
import { GlobalContext } from '../GlobalContext';
import { HomeContentContainer } from './_related/home.styled';
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
        <LogoImage src={'/logo.svg'} alt='logo' width={300} height={300} />
        <NameInput />
      </HomeContentContainer>
    </Layout>
  );
};

export default page;
