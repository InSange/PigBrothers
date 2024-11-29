'use client';
import { useRouter } from 'next/navigation';
import { Layout, LogoImage, LogoTitle } from './_related/root.styled';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/home');
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <Layout
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <LogoImage src={'/logo.svg'} alt='logo' width={300} height={300} />
      <LogoTitle>PIG BROTHERS에 접속 중 . . </LogoTitle>
    </Layout>
  );
}
