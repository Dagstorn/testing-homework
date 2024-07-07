describe("Cart testplane", () => {
    it("процесс чекаут", async ({browser}) => {
        await browser.url("http://localhost:3000/hw/store/catalog/1");
        
        await (await browser.$(".ProductDetails-AddToCart")).click();
        
        // await browser.url("http://localhost:3000/hw/store/cart?bug_id=5");
        // await browser.url("http://localhost:3000/hw/store/cart?bug_id=8");
        await browser.url("http://localhost:3000/hw/store/cart");

        await browser.$("#f-name").setValue("Alex");
        await browser.$("#f-phone").setValue(87776665544);
        await browser.$("#f-address").setValue("City");

        await (await browser.$(".Form-Submit")).click();
        
        await expect(browser.$$(".Cart-SuccessMessage")).toBeTruthy();
        await expect(browser.$$(".Cart-SuccessMessage")).toBeDisplayed();
        await expect(browser.$$(".alert-success")).toBeDisplayed();

    });

    it("add to cart", async ({browser}) => {
        // await browser.url("http://localhost:3000/hw/store/catalog/1?bug_id=7");
        await browser.url("http://localhost:3000/hw/store/catalog/1");
        
        await (await browser.$(".ProductDetails-AddToCart")).click();
        
        await browser.url("http://localhost:3000/hw/store/cart");

        await expect(browser.$(".Cart-Table")).toBeDisplayed();
    });


});
