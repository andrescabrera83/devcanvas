"use client";

import React from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';

function ChatsContainer() {

const supabase = createClientComponentClient();

const [user, setUser] = useState<User | null>(null);

useEffect(() => {
        
    async function getUser() {
        const {data: {user}} = await supabase.auth.getUser();
        setUser(user);
    }

    getUser();
    
}, []);

const handleNewChat = async () => {
    const timestamp = new Date().toISOString();
    const title = 'New Chat';
    const user_id = user?.id;
    try {
        const { data, error } = await supabase.from('chats').insert([
            { created_at: timestamp, title: title, user_id: user_id }
        ]);

        if (error) {
            console.error('Error inserting chat:', error.message);
        } else {
            console.log('Chat inserted successfully:', data);
            // Optionally, you can perform additional actions after inserting the chat
        }
    } catch (error) {
        console.error('Error inserting chat:', error);
    }
}

  return (
    <main className='h-screen w-[270px] flex flex-col py-4 px-4'>
        <div className='w-full h-full flex justify-center items-start'>
            
            <button 
            className='w-full h-10 border border-black rounded-lg hover:bg-black hover:text-white ease-in-out duration-300'
            onClick={handleNewChat}
            >New Chat</button>
            </div>
    </main>
  )
}

export default ChatsContainer