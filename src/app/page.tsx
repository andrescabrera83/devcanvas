

import InputForm from "./components/inputForm";

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import {cookies } from 'next/headers';
import Link from "next/link";

export default async function Home() {

  const cookieStore = cookies();
  const supabase = createServerComponentClient({cookies: () => cookieStore});

  const {data: {user}} = await supabase.auth.getUser();

  if(!user){
    return (
      <main className='flex flex-col justify-center items-center px-3   w-full h-screen bg-zinc-200'>
        <Link href='/login'>
           You are not logged in. Click here to login
        </Link>
      </main>
    )
  }

  return (
    <main className='flex flex-col justify-end items-center px-3   w-full h-screen bg-zinc-200'>
      
      <div className="flex sm:w-full md: w-8/12 mb-3 overflow-y">
      <InputForm />
      </div>
      
      

    </main>
  );
}
