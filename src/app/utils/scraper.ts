import axios from "axios" ;
import * as cheerio from "cheerio" ;

export const urlPattern=/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z]{1,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g



export async function scrapeUrl(url: string) {
    const response = await axios.get(url) ;
    const $= cheerio.load(response.data);
console.log("response data" , response.data)
const title= $("title").text();
    console.log($)
}