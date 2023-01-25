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
        console.log(`This document has ${book._pdfInfo.numPages} pages.`);
        const page1 = new Page(book, 60);
        const page2 = new Page(book, 61);
        await page1.loadPage();
        await page2.loadPage();
        this.pages.push(page1);
        this.pages.push(page2);
        scene.add(page1.plane);
        scene.add(page2.plane);
    }
}
