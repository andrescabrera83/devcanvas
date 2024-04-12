


import InputForm from "./components/inputForm";

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from 'next/headers';
import Link from "next/link";
import { useEffect, useState } from "react";

import AppFull from "./components/appFull";

import DisplayChat from "./components/displayChat";
import WelcomeModule from "./components/welcomeModule";

import ChatsContainer from "./components/chatsContainer";

const colors = [
  '#fad1c0', // LightSalmon
  '#FFDAB9', // PeachPuff
  '#FFE4B5', // Moccasin
  '#FAEBD7', // AntiqueWhite
  '#FFEFD5' // PapayaWhip :)

];



export default async function Home() {




  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const { data: { user } } = await supabase.auth.getUser();



  if (!user) {
    return <WelcomeModule />
  } else {
    return (
      <AppFull/>
    );
  }


}
