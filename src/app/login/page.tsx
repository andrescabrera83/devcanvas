'use client';

import {createClientComponentClient} from '@supabase/auth-helpers-nextjs'
import { get } from 'https';
import { useRouter } from 'next/navigation';
import {User} from '@supabase/supabase-js';
import {  useEffect, useState } from 'react';

export default function LoginPage() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);



    const supabase = createClientComponentClient();

    useEffect(() => {
        
        async function getUser() {
            const {data: {user}} = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        }

        getUser();
        
    }, []);

    const handleSignUp = async () => {
        const res = await supabase.auth.signUp({ 
            email, 
            password, 
            options: { 
                emailRedirectTo: '${location.origin}/auth/callback',
            } 
        });
        setUser(res.data.user)
        router.refresh();
        setEmail('');
        setPassword('');
    }

    const handleSignIn = async () => {
        const res = await supabase.auth.signInWithPassword({ 
            email, 
            password, 
        });
        setUser(res.data.user);
        router.refresh();
        setEmail('');
        setPassword('');
    }

    console.log(loading,user);

    if(loading) return (
        <main className='h-screen flex items-center justify-center bg-gray-800 p-6'>
            <div
            className='bg-gray-900 p-8 rounded-lg shadow-md w-96'>
            <h1 className='text-white text-2xl mb-4'>Loading...</h1>
            </div>
            
        </main>
    )

    if(user) return ( 
        <main className='h-screen flex items-center justify-center bg-gray-800 p-6'>
            <div
            className='bg-gray-900 p-8 rounded-lg shadow-md w-96'>
            <h1 className='text-white text-2xl mb-4'>Welcome {user.email}</h1>
            <button 
            onClick={async () => {
                await supabase.auth.signOut();
                router.refresh();
                setUser(null);
            }}
            className='w-full mb-2 p-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none'>Sign Out</button>
            </div>
            
        </main>
    )

    return (
        <main className='h-screen flex items-center justify-center bg-gray-800 p-6'>
            <div
            className='bg-gray-900 p-8 rounded-lg shadow-md w-96'>
            <input 
            type="email"
            name='email'
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='mb-4 w-full p-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:border-blue-500' 
            />
            <input 
            type="password"
            name='password'
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='mb-4 w-full p-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:border-blue-500'
             />
             <button 
             onClick={handleSignUp}
             className='w-full mb-2 p-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none'>Sign Up</button>
             
             <button 
             onClick={handleSignIn}
             className='w-full mb-2 p-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none'
             >Sign In</button>
            </div>
            
        </main>
    )

}