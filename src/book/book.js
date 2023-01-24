/* global pdfjsLib */
export default class Book {
    constructor(url) {
        this.bookUrl = url;
    }

    async loadBook() {
        const bookTask = pdfjsLib.getDocument("book.pdf");
        const book = await bookTask.promise;
        console.log(`This document has ${book._pdfInfo.numPages} pages.`);
        const page = await book.getPage(1);
        console.log(page);
        const viewport = page.getViewport({ scale: 1 });
        // Support HiDPI-screens.
        var outputScale = window.devicePixelRatio || 1;

        var canvas = document.getElementById("app");
        var context = canvas.getContext("2d");

        var transform =
            outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

        var renderContext = {
            canvasContext: context,
            transform: transform,
            viewport: viewport,
        };
        page.render(renderContext);
    }
}
