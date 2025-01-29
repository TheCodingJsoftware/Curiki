const getMetaData = require('metadata-scraper')

export async function fetchPageTitle(url: string) {
	const data = await getMetaData(url)
	console.log(data)
    return data.title
}