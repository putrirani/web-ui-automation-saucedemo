const { Builder, By, Key } = require('selenium-webdriver');
const assert = require('assert');
describe('Otomatisasi Pengujian Aplikasi Web Sauce Demo', function() {
    this.timeout(40000); 
    let driver;

    beforeEach(async function() {
        driver = await new Builder().forBrowser('chrome').build();
        await driver.manage().window().maximize(); 
        await driver.get('https://www.saucedemo.com/'); 
    });
    afterEach(async function() {
        await driver.quit(); 
    });

    // --- Skenario Test Login ---

    // Ini adalah test case untuk skenario login yang sukses.
    it('Memastikan login berhasil dengan kredensial yang valid', async function() {
        // Temukan field username berdasarkan ID-nya, lalu ketik 'standard_user'.
        await driver.findElement(By.id('user-name')).sendKeys('standard_user');
        // Temukan field password, lalu ketik 'secret_sauce'.
        await driver.findElement(By.id('password')).sendKeys('secret_sauce');
        // Temukan tombol login, lalu klik.
        await driver.findElement(By.id('login-button')).click();

        
        // cek teks 'Products' di header halaman.
        const headerProduk = await driver.findElement(By.className('title')).getText();
        // Gunakan assertion untuk membandingkan teks yang di dapat dengan yang seharusnya.
        assert.strictEqual(headerProduk, 'Products', 'Verifikasi: Teks "Products" harus muncul di halaman setelah login berhasil.');
    });

    // Ini adalah test case untuk skenario login gagal karena username kosong.
    it('Validasi pesan error saat username dikosongkan', async function() {
        // mengisi password, sengaja mengosongkan username.
        await driver.findElement(By.id('password')).sendKeys('secret_sauce');
        // Klik tombol login.
        await driver.findElement(By.id('login-button')).click();
        const pesanError = await driver.findElement(By.css('[data-test="error"]')).getText();
        assert.strictEqual(pesanError, 'Epic sadface: Username is required', 'Verifikasi: Pesan error "Username is required" seharusnya muncul.');
    });

    // --- Skenario Test Pengurutan Produk Z-A ---

    it('Memverifikasi produk terurut dari Z ke A', async function() {
        // Untuk bisa mengurutkan produk, harus login dulu ke halaman produk.
        await driver.findElement(By.id('user-name')).sendKeys('standard_user');
        await driver.findElement(By.id('password')).sendKeys('secret_sauce');
        await driver.findElement(By.id('login-button')).click();

        // Setelah login, verifikasi lagi bahwa memang sudah di halaman 'Products'.
        const headerProduk = await driver.findElement(By.className('title')).getText();
        assert.strictEqual(headerProduk, 'Products', 'Verifikasi: Harus berada di halaman Products setelah login.');

        // Temukan elemen dropdown untuk pengurutan produk.
        const dropdownPengurutan = await driver.findElement(By.className('product_sort_container'));

        // Pilih opsi "Name (Z to A)" dari dropdown. cari berdasarkan atribut 'value="za"'.
        await dropdownPengurutan.findElement(By.css('option[value="za"]')).click();

        // --- Verifikasi Urutan Produk ---
        // Sekarang, ambil semua nama produk yang ditampilkan di halaman.
        const elemenNamaProduk = await driver.findElements(By.className('inventory_item_name'));
        let namaProdukAktual = [];
        for (let elemen of elemenNamaProduk) {
            namaProdukAktual.push(await elemen.getText());
        }
        const namaProdukYangDiharapkan = [
            "Test.allTheThings() T-Shirt (Red)",
            "Sauce Labs Fleece Jacket",
            "Sauce Labs Bolt T-Shirt",
            "Sauce Labs Backpack",
            "Sauce Labs Bike Light",
            "Sauce Labs Onesie"
        ].sort((a, b) => b.localeCompare(a)); // Ini adalah cara JavaScript mengurutkan array dari Z-A.

        assert.deepStrictEqual(namaProdukAktual, namaProdukYangDiharapkan, 'Verifikasi: Produk seharusnya sudah terurut dari Z ke A.');
    });
});
