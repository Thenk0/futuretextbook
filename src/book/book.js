import Page from "./page";

/* global pdfjsLib */
export default class Book {
    constructor(url) {
        this.bookUrl = url;
        this.pages = [];
        this.outline = [];
    }

    async loadBook(scene, startPage) {
        // TODO: add memory save page loading
        const bookTask = pdfjsLib.getDocument(this.bookUrl);
        const book = await bookTask.promise;
        this.bookInfo = await this.getBookInfo();
        console.log(`This document has ${book._pdfInfo.numPages} pages.`);
        for (let i = 1; i <= book._pdfInfo.numPages; i++) {
            const page = new Page(book, i);
            await page.loadPage(i >= startPage);
            this.pages.push(page);
        }
        this.pages.forEach((page) => {
            if (!(page.pageNumber in this.bookInfo)) return;
            page.mediaInfo = this.bookInfo[page.pageNumber];
            page.loadMedia();
        });
        this.pages.forEach((page) => {
            scene.add(page.group);
        });
        const outline = await book.getOutline();
        if (!outline) return;

        for (const single of outline) {
            await this.getOutline(book, single, 0);
        }
        console.log(this.outline);
    }

    async getOutline(book, single, depth) {
        let ref = single.dest;
        if (typeof dest === "string") ref = await book.getDestination(single.dest);
        const id = await book.getPageIndex(ref[0]);
        this.outline.push({ title: single.title, pageNumber: parseInt(id) + 1, depth });
        if (single.items.length === 0) return;
        for (const s of single.items) {
            await this.getOutline(book, s, depth + 1);
        }
    }

    _getPage(number) {
        return this.pages.find((page) => page.pageNumber == number);
    }

    playMedia(event) {
        const mediaObject = event.object;
        const page = this._getPage(mediaObject.pageNumber);
        page.playMedia(mediaObject.mediaIndex);
    }

    async getBookInfo() {
        return {
            5: {
                media: [
                    {
                        type: "video",
                        url: "/media/videos/ППБ-32В.mp4",
                        position: {
                            x: 0,
                            y: 125,
                            w: 80,
                            h: 30,
                        },
                    },
                ],
            },
            10: {
                media: [
                    {
                        type: "3d",
                        url: "/media/3d/obj.glb",
                        preview: "/media/3d/3dpreview.png",
                        position: {
                            x: 0,
                            y: 125,
                            w: 80,
                            h: 35,
                        },
                    },
                ],
            },
            11: {
                media: [
                    {
                        type: "panorama",
                        url: "/media/panoramas/wash.jpg",
                        panoramaType: "sphere",
                        position: {
                            x: 0,
                            y: -100,
                            w: 80,
                            h: 30,
                        },
                    },
                ]
            }
        };
    }
}
