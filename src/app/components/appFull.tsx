"use client";

//REACT IMPORTS

import React from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useState, useEffect, useRef } from 'react';
import { User } from '@supabase/supabase-js';

import { FormEvent, ReactNode, ReactElement } from 'react';

//SYNTAX HIGHLIGHTER THEMES

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';

//HERO ICONS

import { ArrowLongRightIcon } from '@heroicons/react/24/outline';

//COLORS

const colors = [
    '#fad1c0', // LightSalmon
    '#FFDAB9', // PeachPuff
    '#FFE4B5', // Moccasin
    '#FAEBD7', // AntiqueWhite
    '#FFEFD5' // PapayaWhip :)

];

function AppFull() {

    //BACKGROUND COLORS


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

    //GLOBAL STATES

    const [messageId, setMessageId] = useState<string>('');

    const [chatsFetched, setChatsFetched] = useState(false);

    const divRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (divRef.current) {
            divRef.current.scrollTop = divRef.current.scrollHeight;
        }
    };




    //CHAT CONTAINER

    const supabase = createClientComponentClient();

    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {

        async function getUser() {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        }

        getUser();
        //console.log('User:', user?.id);

    }, []);

    useEffect(() => {
        // Fetch chats only when user changes
        if (user) {
            getChats();
        }
    }, [user]); // Only run the effect when user changes

    const getChats = async () => {
        if (!user) {
            console.error('User is null');
            return; // Exit early if user is null
        }

        const user_id = user?.id;

        // Check if user_id is defined before proceeding with the query
        if (user_id) {
            console.log('User ID:', user_id);
            const { data, error } = await supabase.from('chats').select('chat_id').eq('user_id', user_id);

            if (error) {
                console.error('Error fetching chats:', error.message);
                return;
            }

            if (data && data.length > 0) {
                const chat_ids = data.map(chat => chat.chat_id);
                console.log('Chats fetched successfully:', chat_ids);
                setMessageId(chat_ids[chat_ids.length - 1]);
            } else {
                console.log('No chats found for user:', user_id);

                // Only create a new chat if chats haven't been fetched yet
                handleNewChat();

            }
        } else {
            console.error('User ID is undefined');
        }
    };


    //the following function is used to create a new chat in the database, now i need to think of a way to display the chats in the chat window, but also a way to stablish a system that
    //sets the input form to the chat that is selected, so that the user can interact with the chat and everything goes to the right chat in the database
    // ill create a useState that keeps track of the chat id that is selected, then i need to take the answer by the fetch request and send it to the right chat in the database using the chat id that is selected

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

    //INPUT FORM

    type FieldType = {
        id: number;
        type: string;
        value: string;
    };

    const [input, setInput] = useState('');
    const [answer, setAnswer] = useState('');
    const [fields, setFields] = useState<FieldType[]>([]);

    const textareaRef = useRef<HTMLTextAreaElement>(null); // Create a ref for the textarea

    //textarea height
    const [textareaHeight, setTextareaHeight] = useState('auto');

    useEffect(() => {
        // Add a default input field when the component mounts
        setFields([{ id: 1, type: 'input', value: '' }]);
    }, []);

    const handleChange = (id: number, event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const updatedFields = fields.map(field =>
            field.id === id ? { ...field, value: event.target.value } : field
        );
        setFields(updatedFields);

        // Adjust textarea height based on content
        setTextareaHeight('auto');
        const textarea = event.target;
        setTextareaHeight(`${textarea.scrollHeight}px`);
    };

    const handleAddInput = () => {
        const newFieldId = fields.length > 0 ? fields[fields.length - 1].id + 1 : 1;
        setFields([...fields, { id: newFieldId, type: 'input', value: '' }]);
    };

    const handleAddTextarea = () => {
        const newFieldId = fields.length > 0 ? fields[fields.length - 1].id + 1 : 1;
        setFields([...fields, { id: newFieldId, type: 'textarea', value: '' }]);
    };

    const handleDelete = (id: number) => {
        if (id !== 1) { // Exclude deleting the default input field
            const updatedFields = fields.filter(field => field.id !== id);
            setFields(updatedFields);
        }
    };

    const handleSubmitLog = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const concatenated = fields.map(field => field.value).join(' ');
        console.log(concatenated); // Or do whatever you want with the concatenated value
        setInput(concatenated);
    };



    // Function to parse the answer and identify code blocks
    const parseAnswer = (text: string): React.ReactNode[] => {
        // Regular expression to detect code blocks
        const codeBlockRegex = /```(\w+)\n([^`]+)```/gs;
        // Split the text into parts based on code blocks
        const parts = text.split(codeBlockRegex);
        // Map each part to a React node
        return parts.map((part, index) => {
            // Check if the part is a code block
            if (index % 3 === 2) {
                // This i s a code block, extract language and code
                const language = parts[index - 1].trim();
                const code = part.trim();

                // Return a div containing language title and code block
                return (
                    <div className='flex w-full justify-center'>
                        <div className='rounded-lg' key={index} style={{ background: 'var(--custom-background-color)', width: 'fit-content', marginBlock: '15px', borderRadius: '8px' }}>
                            <div style={{ backgroundColor: 'darkgray', color: 'black', padding: '5px', fontSize: '13px' }}>{language}</div>
                            <div className='rounded-lg'>
                                <SyntaxHighlighter language={language} style={a11yDark} wrapLongLines={true}>
                                    {code}
                                </SyntaxHighlighter>
                            </div>
                        </div>
                    </div>
                );
            } else {   // This is plain text, return it as is
                return <span key={index}>{part}</span>;
            }
        });
    };

    //KEYBOARD SHORTCUTS

    const handleUndo = () => {
        if (fields.length > 0) {
            const updatedFields = fields.slice(0, -1); // Remove the last added textarea
            setFields(updatedFields);
        }
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.shiftKey && event.key === 'Enter') {
                // Shift + Enter shortcut
                event.preventDefault();
                console.log('Shift + Enter pressed');
                handleAddTextarea(); // Call the function to add a new textarea
                // Focus on the newly added textarea
                if (textareaRef.current) {
                    textareaRef.current.focus();
                }
            } else if (event.ctrlKey && event.key === 'z') {
                // Ctrl + Z shortcut
                event.preventDefault();
                console.log('Ctrl + Z pressed');
                handleUndo(); // Call the function to undo the last action
            }
        };

        // Add event listener for keydown event
        document.addEventListener('keydown', handleKeyDown);

        // Clean up event listener
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    });
    useEffect(() => {
        // Focus on the newly added textarea
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [fields]); // Trigger the effect whenever the fields state changes

    //CHATS

    interface Message {
        message_id: string;
        chat_id: string;
        created_at: string;
        sender: string;
        text: string;
    }

    const [messages, setMessages] = useState<Message[]>([]);

    const fetchMessages = async () => {
        if (!messageId) {
            console.error('Error fetching messages: messageId is empty');
            return;
        }
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', messageId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching messages:', error.message);
            return;
        }


        if (data) {
            setMessages(data);
            setTimeout(() => {
                scrollToBottom();
            }, 5);
        }


    };

    useEffect(() => {

        fetchMessages();
    }, [messageId]);



    //SUBMIT FORM


    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const concatenated = fields.map(field => field.value).join(' ');
        console.log(concatenated); // Log the input (for debugging purposes)

        const timestamp = new Date().toISOString();
        const chat_id = messageId;
        const sender_user = user?.id;
        const text = concatenated;

        try {
            const { data: supabaseData, error } = await supabase.from('messages').insert([
                { created_at: timestamp, chat_id: chat_id, sender: 'You', text: text }
            ]);

            if (error) {
                console.error('Error inserting message:', error.message);
            } else {
                console.log('Message inserted successfully:', supabaseData);
                // Clear the input fields after submitting
                setFields([{ id: 1, type: 'input', value: '' }]); // Reset to default input field
                setTextareaHeight('auto'); // Reset textarea height
                // Optionally, you can perform additional actions after inserting the message

            }

        } catch (error) {
            console.error('Error inserting message:', error);
        }


        // Send message to database
        try {
            const response = await fetch('http://127.0.0.1:8080/api/process_form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ input: concatenated }),
            });

            if (!response.ok) {
                throw new Error('Failed to process form');
            }

            const responseData = await response.json();
            //await new Promise(resolve => setTimeout(resolve, 1000));
            setAnswer(responseData.answer);

            try {
                const { data: messageData, error } = await supabase.from('messages').insert([
                    { created_at: timestamp, chat_id: chat_id, sender: 'WordCanvas', text: responseData.answer }
                ]);
                if (error) {
                    console.error('Error inserting response:', error.message);
                } else {
                    console.log('Message inserted successfully:', messageData);
                    fetchMessages();
                    scrollToBottom();



                }
            } catch (error) {
                console.error(error);
            }

        } catch (error) {
            console.error(error);
        }
    };





    //RENDERS

    return (


        <main className='flex flex-row justify-end items-center m-0  w-full h-screen'>

            {/*CHATS CONTAINER */}

            <div className="shadow-lg z-10">
                <div className='h-screen w-[270px] flex flex-col py-4 px-4'>
                    <div className='w-full h-full flex flex-col justify-start items-center'>

                        <button
                            className='w-full h-10 border border-black rounded-lg hover:bg-black hover:text-white ease-in-out duration-300'
                            onClick={handleNewChat}
                        >New Chat</button>

                        <span>{messageId}</span>


                    </div>
                </div>
            </div>

            {/*INPUT FORM */}

            <div className="flex w-[55%] h-screen">
                <main className='w-full h-full overflow-auto' style={{ backgroundColor: backgroundColor }}>
                    <div className='px-5 py-3 '>
                        <div
                            className=' bg-white  rounded-md flex flex-col justify-center w-full p-4 border border-gray-800'
                        >

                            {/* Render the answer with parsed code blocks 
                            {answer && (
                                <div style={{ maxWidth: '100%', wordWrap: 'break-word', paddingBlock: '22px' }}>
                                    {parseAnswer(answer)}
                                    <hr />
                                </div>
                            )}*/}
                            <form onSubmit={handleSubmit}>
                                {fields.map((field, index) => (
                                    <div key={field.id}>

                                        {field.type === 'input' ? (
                                            <input
                                                className='p-2 my-1 w-full rounded-lg border border-gray-800 focus:outline-none focus:border-green-500'

                                                type="text"
                                                placeholder='Type Here...'
                                                value={field.value}
                                                onChange={(e) => handleChange(field.id, e)}
                                            />
                                        ) : (
                                            <textarea
                                                rows={1}
                                                ref={textareaRef}
                                                placeholder='Type Here...'
                                                className='p-2 my-1 w-full rounded-lg border border-gray-800 focus:outline-none focus:border-green-500'
                                                value={field.value}
                                                style={{ height: textareaHeight }}
                                                onChange={(e) => handleChange(field.id, e)}
                                            />
                                        )}

                                        {index !== 0 && ( // Render delete button for non-default fields

                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'flex-end',
                                                    marginBlock: '0px',
                                                    padding: '0px',
                                                    fontSize: '14px',
                                                    cursor: 'pointer',
                                                    color: 'red',
                                                    marginTop: '-3px',
                                                    marginBottom: '5px',

                                                }}>
                                                <button
                                                    className='delete-button'
                                                    type="button"
                                                    onClick={() => handleDelete(field.id)}
                                                    style={{
                                                        marginBlock: '0px',
                                                        fontSize: '14px',
                                                        cursor: 'pointer',
                                                        color: 'red',


                                                    }}>
                                                    <span style={{ textDecoration: 'none' }}>Delete</span>
                                                </button>
                                            </div>


                                        )}

                                    </div>
                                ))}
                                <hr />
                                <div className='flex flex-row justify-lef gap-4 text-sm mt-3'>
                                    <button className='hover:underline text-slate-600 hover:text-blue-500' type="button" onClick={handleAddInput}>
                                        + Add Input</button>
                                    <button className='hover:underline text-slate-600 hover:text-blue-500' type="button" onClick={handleAddTextarea}>+ Add Textarea</button>
                                </div>


                                <div className='flex justify-end'>
                                    <button className='flex flex-row items-center justify-between px-14 bg-black text-white  h-auto 
                    hover:px-8 hover:h-auto hover:bg-white hover:border hover:border-black hover:text-black hover:w-48 
                    active:bg-black active:border active:border-black active:text-white active:w-48
                    ease-in-out duration-300 rounded-md w-48' type="submit">
                                        <span>Send</span> <ArrowLongRightIcon className='h-8 w-6' /></button>
                                </div>

                            </form>

                        </div>
                    </div>

                </main>
            </div>

            {/*CHAT WINDOW */}

            <div className="flex flex-col items-center justify-center w-[85%] h-screen">
                <div className='p-8 overflow-y-auto pb-18 h-full' ref={divRef}>
                    <div className='flex items-start'>
                        <ul>
                            {messages.map(message => (
                                <div
                                    className='w-full px-2 py-3 my-4 bg-white rounded-lg border border-gray-800'
                                    key={message.message_id}>
                                        <div className='flex flex-col'>
                                        <strong>{message.sender}</strong>
                                        <p>{parseAnswer(message.text)}</p> 
                                        </div>
                                    
                                </div>
                            ))}
                        </ul>
                    </div>
                </div>
                
            </div>



        </main>
    )
}

export default AppFull