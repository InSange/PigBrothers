import { NextRequest } from 'next/server';

export async function GET(Request: NextRequest) {
  return new Response('This is a new API route');
}

export async function POST(request: NextRequest) {
  const data = await request.json();

  // cookie 등 확인해서 서버에서 사용자를 로그인 시켜준다.
  // const cookies = request.cookies.get("");
  console.log('log the user in!');

  return Response.json(data);
}
