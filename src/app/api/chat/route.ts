// TODO: Implement the chat API with Groq and web scraping with Cheerio and Puppeteer:done
// Refer to the Next.js Docs on how to read the Request body: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
// Refer to the Groq SDK here on how to use an LLM: https://www.npmjs.com/package/groq-sdk
// Refer to the Cheerio docs here on how to parse HTML: https://cheerio.js.org/docs/basics/loading
// Refer to Puppeteer docs here: https://pptr.dev/guides/what-is-puppeteer


import chromium  from "@sparticuz/chromium-min";
import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import { getGroqResponse } from "@/app/utils/groqClient";
import { urlPattern } from "@/app/utils/scraper";



chromium.setHeadlessMode = true;
chromium.setGraphicsMode = false;




export async function POST(req: Request) {
//   await chromium.font(
//     "https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf"
//   );
  
//  const isLocal=!!process.env.CHROME_EXECUTABLE_PATH ;


//     const browser = await puppeteer.launch({
//       args: isLocal ? puppeteer.defaultArgs():[...chromium.args, '-hide-scrollbars', '-incognito','—-no-sandbox'],
//       defaultViewport: chromium.defaultViewport,
//       executablePath: process.env.CHROME_EXECUTABLE_PATH || await chromium.executablePath(),
//       headless: chromium.headless,
//       ignoreHTTPSErrors:true
//     });
  
//     const page = await browser.newPage();
//     await page.goto("https://missuniverseindia.glamanand.com");
//     const pageTitle = await page.title();
    

    
//     await browser.close();
  


  try {
    // return Response.json({
    //   //test:true
    //   pageTitle 
    // })

    const {message}=await req.json()

    const url=message.match(urlPattern);
    if(url){
      console.log("url found:" , url)
    }

    const response = await getGroqResponse(message);
    return NextResponse.json({message:response})

  }
   catch (error) {

    return NextResponse.json({message:Error})

  }
}
