"use client";


import ReDct from 'react'
import { useEffect, useState } from 'react'

import InputForm from './inputForm';

const colors = [
    '#fad1c0', // LightSalmon
    '#FFDAB9', // PeachPuff
    '#FFE4B5', // Moccasin
    '#FAEBD7', // AntiqueWhite
    '#FFEFD5' // PapayaWhip :)

];


function DisplayChat() {

    // State to store the background color
    const [backgroundColor, setBackgroundColor] = useState<string>('');

     // Function to select a random background color
     function getRandomColor() {
        const randomIndex = Math.floor(Math.random() * colors.length);
        return colors[randomIndex];
    }

    // Set random background color when component mounts
    useEffect(() => {
        const randomColor = getRandomColor();
        setBackgroundColor(randomColor);
    }, []); // Empty dependency array ensures this effect runs only once on component mount

  return (
    <main className='w-full h-full' style={{ backgroundColor: backgroundColor }}>
        <div className='px-5 py-3 '>
        <InputForm/>
        </div>
        
    </main>
  )
}
export default DisplayChat