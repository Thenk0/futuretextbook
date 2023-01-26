import Page from "./page";

/* global pdfjsLib */
export default class Book {
    constructor(url) {
        this.bookUrl = url;
        this.pages = [];
    }

    async loadBook(scene) {
        const bookTask = pdfjsLib.getDocument("book.pdf");
        const book = await bookTask.promise;
        this.bookInfo = await this.getBookInfo();
        console.log(`This document has ${book._pdfInfo.numPages} pages.`);
        const page1 = new Page(book, 50);
        const page2 = new Page(book, 60);
        await page1.loadPage();
        await page2.loadPage();
        this.pages.push(page1);
        this.pages.push(page2);
        this.pages.forEach((page) => {
            if (!(page.pageNumber in this.bookInfo)) return;
            page.mediaInfo = this.bookInfo[page.pageNumber];
            page.loadMedia();
        });
        scene.add(page1.group);
        scene.add(page2.group);
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
            60: {
                media: [
                    {
                        type: "video",
                        url: "/video.mp4",
                        position: {
                            x: 0,
                            y: 200,
                            w: 200,
                            h: 50,
                        },
                    },
                    {
                        type: "video",
                        url: "/мачин в кабинете.mp4",
                        position: {
                            x: 0,
                            y: -200,
                            w: 200,
                            h: 50,
                        },
                    },
                ],
            },
            61: {
                media: [
                    {
                        type: "3d",
                        url: "/obj.obj",
                        position: {
                            x: 10,
                            y: 100,
                            w: 100,
                            h: 50,
                        },
                    },
                    {
                        type: "panorama",
                        url: "/panorama.jpg",
                        panoramaType: "sphere",
                        position: {
                            x: 10,
                            y: 300,
                            w: 100,
                            h: 50,
                        },
                    },
                ],
            },
        };
    }
}
