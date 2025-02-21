import fetch from "node-fetch";

function getSearchURL(term, offset) {
    const url = new URL(`https://knowyourmeme.com/search?context=images&sort=&q=${term}&offset=${offset}`).toString()
    return url
}

async function makeRequest(url) {
    const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'Referer': 'knowyourmeme.com/search?context=images&sort=&q=hotdogs&offset',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0'
            }
        }
    );
    
    return response.json()
}

function getImageList(searchJson) {
    const imageLinks = []
    searchJson.groups.forEach(group => {
        group.items.forEach(item => {
            imageLinks.push(item.image);
        });
    });
    
    return imageLinks

}

export async function retrieveImages(searchTerm) {
    const url = getSearchURL(searchTerm, 0)
    const searchJson = await makeRequest(url)
    const total_results = searchJson.total_results
    const pages = Math.ceil(total_results / 16)
    let imageList = []

    for (let i = 0; i < pages; i++) {
        const url = getSearchURL(searchTerm, 16 * i)
        const searchJson = await makeRequest(url)
        imageList.push(...getImageList(searchJson))
    }

    return imageList
}