describe("Catalog testplane", () => {
    it("список товаров рендерится", async ({browser}) => {
        // await browser.url("http://localhost:3000/hw/store/catalog?bug_id=1");
        await browser.url("http://localhost:3000/hw/store/catalog");
        
        const product = await browser.$(".ProductItem-Name")
        const text = await browser.getElementText(product.elementId);

        expect(text).not.toBe("");
    });

    it("отображается детальная информация о товаре", async ({browser}) => {
        // await browser.url("http://localhost:3000/hw/store/catalog/1?bug_id=3");
        await browser.url("http://localhost:3000/hw/store/catalog/1");

        await expect(browser.$$(".ProductDetails")).toBeTruthy();
        await expect(browser.$$(".ProductDetails")).toBeExisting();
    });
});
