import {parseHtml} from './parse-html';
import {proxyGetText} from './proxy';

export class BasePhotoInfo {
    id: string = '';
    thumb: string = '';
    title: string = '';
    selected: boolean = true;
}

export class PhotoListPage {
    numOfPages: number = 0;
    photos: BasePhotoInfo[] = [];
}

export async function getPhotoListPage(page: number | string) {
    throw new Error("This crawler is out of date and needs to be reworked")
    const url = `https://www.human-anatomy-for-artist.com/photos/search/query//thumb/small/standard/1/premium/1/category-11/Nude/category-34/Man/category-102/Standard%20Photoshoot/page/${page}`;
    const html = await proxyGetText(url);
    const doc = parseHtml(html, url);

    let numOfPages = 1;
    const pages = doc.querySelectorAll('.pagination_area .searchRightHolder a span');
    pages.forEach(item => {
        const text = (item as HTMLSpanElement).innerText;
        if (text) {
            numOfPages = Math.max(Number(text), numOfPages);
        }
    });

    const photos: BasePhotoInfo[] = [];
    const resultItems = doc.querySelectorAll('.resultItemsmall .centerheresmall');
    resultItems.forEach(item => {
        const a = item.querySelector('.screenshot') as HTMLAnchorElement;
        const url = a.href;
        const id = (url.match(/id\/([^\/]+)/) || [])[1] || '';
        const img = a.querySelector('img') as HTMLImageElement;
        const thumb = img.src;
        const title = img.alt;
        const photo = new BasePhotoInfo();
        photo.id = id;
        photo.thumb = thumb;
        photo.title = title;
        photo.selected = !title.toLowerCase().includes('stereoscopic');
        photos.push(photo);
    });

    const ret = new PhotoListPage();
    ret.numOfPages = numOfPages;
    ret.photos = photos;
    return ret;
}

export class PhotoInfo {
    id: string = '';
    url: string = '';
    title: string = '';
}

export async function getPhotoInfo(id: string) {
    const url = `https://www.human-anatomy-for-artist.com/photos/show/id/${id}`;
    const html = await proxyGetText(url);
    const doc = parseHtml(html, url);
    const img = doc.querySelector('#mainImage') as HTMLImageElement;
    const ret = new PhotoInfo();
    ret.id = id;
    ret.url = img.src;
    ret.title = img.alt;
    return ret;
}
