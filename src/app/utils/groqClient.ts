import Groq from "groq-sdk"

const groq = new Groq({
    apiKey: process. env. GROQ_API_KEY,});


    interface ChatMessage {
        role:"system" | "user" | "assistant" ;
        content:string;
    }



    export async function getGroqResponse(message:string){
        const messages:ChatMessage[]= [{
            role:"system" ,
            content:"You are an acadamic expert, you always cite your sources and base your repsonses on the context that you have been provided"
        
        },
    {
        role:"user",
        content:message
    },
];

const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant" ,
    messages
})
return response.choices[0].message.content;

    }
    