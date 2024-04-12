"use client";

import React from 'react'
import { useEffect, useState } from 'react'
import {createClientComponentClient} from '@supabase/auth-helpers-nextjs'
import { get } from 'https';
import { useRouter } from 'next/navigation';
import {User} from '@supabase/supabase-js';



import "../globals.css"

import camomila from '../images/camomila.jpg'
import dandelion from '../images/dandelion.jpg'
import purpleLight from '../images/purple-light.jpg'
import redFlowers from '../images/red-flowers.jpg'
import myGoogleLogo from '../images/google-logo.png'

import Image from 'next/image';

import { ArrowLeftCircleIcon } from '@heroicons/react/24/outline';


const imageFiles = [
    camomila,
    dandelion,
    purpleLight,
    redFlowers

]

const colors = [
    '#fad1c0', // LightSalmon
    '#FFDAB9', // PeachPuff
    '#FFE4B5', // Moccasin
    '#FAEBD7', // AntiqueWhite
    '#FFEFD5' // PapayaWhip :)

];



function WelcomeModule() {

    // State to store the background image URL
    const [backgroundImage, setBackgroundImage] = useState<string>('');

    // State to store the background color
    const [backgroundColor, setBackgroundColor] = useState<string>('');

    // Function to select a random background image URL
    function getRandomImageURL() {
        const randomIndex = Math.floor(Math.random() * imageFiles.length);
        return imageFiles[randomIndex].src; // Use .default to get the actual file path from require
    }

    // Function to select a random background color
    function getRandomColor() {
        const randomIndex = Math.floor(Math.random() * colors.length);
        return colors[randomIndex];
    }

    // Set random background image URL when component mounts
    useEffect(() => {
        const randomImageURL = getRandomImageURL();
        setBackgroundImage(randomImageURL);
    }, []); // Empty dependency array ensures this effect runs only once on component mount

    // Set random background color when component mounts
    useEffect(() => {
        const randomColor = getRandomColor();
        setBackgroundColor(randomColor);
    }, []); // Empty dependency array ensures this effect runs only once on component mount

    //OTHER CONDITIONS

    const [loginDiv, setLoginDiv] = useState<number>(0)


    //function to toggle setLoginDiv
    const toggleLoginDiv = (valueToggle: number) => {
        setLoginDiv(valueToggle);
    }

    //AUTHENTICATION

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

    const handleSignInWithProvider = async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google'
          })
          if (data && 'user' in data) {
            setUser(data.user as User);
        }else{
            setUser(null); // Set the user state to null
            console.warn('User data not available');
        }

        router.refresh();
        setEmail('');
        setPassword('');
    }


    return (
        <main className='flex  justify-center items-center py-24 px-56   w-full h-screen bg-zinc-200' style={{ backgroundColor: backgroundColor }}>

            <div className="flex flex-row w-full h-full border border-black rounded-xl">

                <div className="w-[65%] h-full rounded-l-xl relative" style={{ backgroundImage: `url(${backgroundImage})`, boxShadow: 'inset -10px 0px 20px rgba(0,0,0,0.2)' }}> <p className='absolute bottom-0 right-0 p-4 text-white'>by Eugene Golovesov</p></div>

                <div className="w-[35%] h-full bg-white rounded-r-xl">

                    <div className="flex flex-col justify-center items-center h-full w-full px-8">
                        <h1 className="text-4xl font-bold mb-6 text-center">Welcome to WordCanvas</h1>
                        <p className="text-lg mb-6 text-center">Begin your own word research through the power of AI.</p>


                        {
                            loginDiv === 1 ? (


                                <div className='flex flex-col justify-center items-center w-full mt-7 px-24 '>


                                    <div className='flex w-full justify-start my-2'>
                                        <ArrowLeftCircleIcon className='h-8 w-8 text-gray-500 hover:text-gray-900 ease-in-out duration-300 cursor-pointer' onClick={() => toggleLoginDiv(0)} />
                                    </div>



                                    <input type="email" placeholder="Email" className="w-full border border-black rounded p-2 mb-4" />
                                    <input type="password" placeholder="Password" className="w-full border border-black rounded p-2 mb-4" />
                                    <button className="bg-black text-white hover:bg-white hover:text-black ease-in-out duration-500 border border-black w-full py-2 px-4 rounded" onClick={() => console.log('Login clicked')}>Login</button>

                                </div>

                            ) : loginDiv === 0 ? (


                                <div className='logsContainer flex flex-col justify-center items-center w-full px-24 mt-7'>

                                    <input 
                                    type="email" 
                                    name='email' 
                                    placeholder="Email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)} 
                                    className="w-full border border-black rounded p-2 mb-4" />

                                    <input 
                                    type="password"
                                    name='password'
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)} 
                                    placeholder="Password" 
                                    className="w-full border border-black rounded p-2 mb-4" />

                                    

                                    <button className="bg-black text-white hover:bg-white hover:text-black ease-in-out duration-500 border border-black w-full py-2 px-4 rounded" onClick={handleSignIn}>Login</button>

                                    <button 
                                    className='flex flex-row w-full h-10 border border-black rounded justify-center items-center my-6 hover:bg-blue-500 hover:border-blue-500 hover:text-white ease-in-out duration-200'
                                    onClick={handleSignInWithProvider}
                                    ><Image src={myGoogleLogo} alt='google-logo' height={32} width={32}/><span className='align-middle'>Sign In With Google</span></button>

                                    <button className='hover:underline hover:text-blue-500 ease-in-out duration-150'  onClick={() => toggleLoginDiv(2)}>Sign Up</button>
                                

                                </div>

                            ) : loginDiv === 2 ? (
                                <div className='flex flex-col justify-center items-center w-full mt-7 px-24 '>


                                    <div className='flex w-full justify-start my-2'>
                                        <ArrowLeftCircleIcon className='h-8 w-8 text-gray-900 hover:text-gray-400 ease-in-out duration-150 cursor-pointer' onClick={() => toggleLoginDiv(0)} />
                                    </div>

                                    <input 
                                    type="email"
                                    name='email' 
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)} 
                                    className="w-full border border-black rounded p-2 mb-4" />
                                    
                                    <input 
                                    type="password"
                                    name='password' 
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)} 
                                    className="w-full border border-black rounded p-2 mb-4" />

                                    <button 
                                    className="bg-black text-white hover:bg-white hover:text-black ease-in-out duration-500 border border-black w-full py-2 px-4 rounded" 
                                    onClick={handleSignUp}>Sign Up</button>
                                </div>

                            ) : null}


                    </div>

                </div>

            </div>

        </main>
    )
}

export default WelcomeModule