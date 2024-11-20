'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/home');
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <>
      <Head>
        <title>로딩 페이지</title>
      </Head>
      <div>여기는 로딩, 시작 페이지</div>
    </>
  );
}
