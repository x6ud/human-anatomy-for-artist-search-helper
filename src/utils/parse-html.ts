export function parseHtml(html: string, baseUri: string) {
    const doc = (new DOMParser).parseFromString(html, 'text/html');
    const base = doc.createElement('base');
    base.href = baseUri;
    doc.head.appendChild(base);
    return doc;
}