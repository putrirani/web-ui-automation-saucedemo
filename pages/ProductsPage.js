import { By } from 'selenium-webdriver'; 

// Definisikan elemen-elemen (locators) di halaman Produk
const ProductsPage = {
    // Locator untuk header halaman produk
    headerTitle: By.className('title'),
    // Locator untuk dropdown pengurutan produk
    dropdownSort: By.className('product_sort_container'),
    // Locator untuk semua nama item produk
    itemNames: By.className('inventory_item_name'),

    /**
     * Fungsi untuk mendapatkan teks judul halaman produk.
     * @param {WebDriver} driver - Instance WebDriver yang sedang berjalan.
     * @returns {Promise<string>} - Teks judul halaman.
     */
    async getPageTitle(driver) {
        return await driver.findElement(this.headerTitle).getText();
    },

    /**
     * Fungsi untuk mengurutkan produk.
     * @param {WebDriver} driver - Instance WebDriver yang sedang berjalan.
     * @param {string} order - Opsi pengurutan.
     */
    async sortProducts(driver, order) {
        // Temukan dropdown dan pilih opsi berdasarkan value
        await driver.findElement(this.dropdownSort).findElement(By.css(`option[value="${order}"]`)).click();
    },

    /**
     * Fungsi untuk mendapatkan daftar nama produk yang ditampilkan.
     * @param {WebDriver} driver - Instance WebDriver yang sedang berjalan.
     * @returns {Promise<Array<string>>} - Array berisi nama-nama produk.
     */
    async getItemNames(driver) {
        const elements = await driver.findElements(this.itemNames);
        let names = [];
        for (let element of elements) {
            names.push(await element.getText());
        }
        return names;
    }
};


export default ProductsPage;
