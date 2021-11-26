import {loadImage} from './image';

export async function proxyGetText(url: string) {
    const res = await fetch('./proxy/' + url);
    return await res.text();
}

export async function proxyGetImage(url: string) {
    const res = await fetch('./proxy-arraybuffer/' + url);
    const blob = await res.blob();
    const objUrl = URL.createObjectURL(blob);
    return await loadImage(objUrl);
}