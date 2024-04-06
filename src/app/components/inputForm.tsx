// inputForm.tsx

"use client";

import { FormEvent, useState, useEffect, ReactNode, ReactElement } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';



const InputForm = () => {

    type FieldType = {
        id: number;
        type: string;
        value: string;
    };

    const [input, setInput] = useState('');
    const [answer, setAnswer] = useState('');
    const [fields, setFields] = useState<FieldType[]>([]);

    useEffect(() => {
        // Add a default input field when the component mounts
        setFields([{ id: 1, type: 'input', value: '' }]);
    }, []);

    const handleChange = (id: number, event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const updatedFields = fields.map(field =>
            field.id === id ? { ...field, value: event.target.value } : field
        );
        setFields(updatedFields);
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
                // This is a code block, extract language and code
                const language = parts[index - 1].trim();
                const code = part.trim();

                // Return a div containing language title and code block
                return (
                    <div key={index} style={{ background: 'var(--custom-background-color)', width: '100%', marginBlock: '15px', borderRadius: '8px' }}>
                        <div style={{ color: 'black', marginLeft: ' 4px', padding: '5px', fontSize: '13px' }}>{language}</div>
                        <div style={{ borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
                            <SyntaxHighlighter language={language} style={a11yDark} wrapLongLines={true}>
                                {code}
                            </SyntaxHighlighter>
                        </div>
                    </div>
                );
            } else {
                // This is plain text, return it as is
                return <span key={index}>{part}</span>;
            }
        });
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const concatenated = fields.map(field => field.value).join(' ');
        console.log(concatenated); // Log the input (for debugging purposes
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

            const data = await response.json();
            setAnswer(data.answer);
        } catch (error) {
            console.error(error);
        }
    };



    return (


        <div 
        className=' bg-white  rounded-md flex flex-col justify-center w-full p-4 shadow-md' 
        >

            {/* Render the answer with parsed code blocks */}
            {answer && (
                <div style={{ maxWidth: '100%', wordWrap: 'break-word', paddingBlock: '22px' }}>
                    {parseAnswer(answer)}
                <hr />
                </div>
            )}
            <form onSubmit={handleSubmit}>
                {fields.map((field, index) => (
                    <div key={field.id}>
                        
                        {field.type === 'input' ? (
                            <input
                            className='p-2 my-1 w-full rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500'
                                
                                type="text"
                                placeholder='Type Here...'
                                value={field.value}
                                onChange={(e) => handleChange(field.id, e)}
                            />
                        ) : (
                            <textarea
                                rows={6}
                                placeholder='Type Here...'
                                className='p-2 my-1 w-full rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500'
                                value={field.value}
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
                                
                                
                            }}> <span style={{ textDecoration: 'none' }}>Delete</span>
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
                    <button className='bg-slate-700 text-white p-2 rounded-md' type="submit">Submit</button>
                </div>
                
            </form>

        </div>


    );
};

export default InputForm;
