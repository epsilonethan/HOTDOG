import fetch from "node-fetch";
import * as cheerio from "cheerio";

function getSearchURL(term, sort, pageNum){
    return new URL(`https://knowyourmeme.com/search/page/${pageNum}?q=${term}&sort=${sort}&context=images`).toString()
}

async function makeRequest(url) {
    const response =  await fetch(url);
    return response.text()
}

function getImageLinksFromBody(body) {
    let imageLinks = []
    const $ = cheerio.load(body)
    $(`img[data-entry-name]`).each((index, element) => {
        imageLinks.push($(element).attr('src'))
    })

    return imageLinks
}

export async function retrieveImages(searchTerm, maxPages = 10) {
    const pageNum = Math.floor(Math.random() * maxPages)
    const url = getSearchURL(searchTerm, 'relevance', pageNum);
    const body = await makeRequest(url);
    return getImageLinksFromBody(body);
}