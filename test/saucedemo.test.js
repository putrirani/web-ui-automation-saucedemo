import { Builder, By } from 'selenium-webdriver'; 
import assert from 'assert'; 
import fs from 'fs'; 
import path from 'path'; 
import pixelmatch from 'pixelmatch'; 
import { PNG } from 'pngjs'; 
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Definisikan path untuk menyimpan screenshot
const screenshotDir = path.resolve(__dirname, '../screenshots');
const baselinePath = path.join(screenshotDir, 'login_baseline.png');
const currentPath = path.join(screenshotDir, 'login_current.png');
const diffPath = path.join(screenshotDir, 'login_diff.png');

// Import Page Objects yang sudah di buat sebelumnya
import LoginPage from '../pages/LoginPage.js'; 
import ProductsPage from '../pages/ProductsPage.js'; 
describe('Otomatisasi Pengujian Aplikasi Web Sauce Demo (Gaya Lebih Santai)', function() {
    this.timeout(40000); // 40 detik untuk setiap test.

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

    // Test case untuk memastikan login berhasil dengan data yang benar.
    it('Memastikan login berhasil dengan kredensial yang valid', async function() { 
        await LoginPage.login(driver, 'standard_user', 'secret_sauce');
        const headerProduk = await ProductsPage.getPageTitle(driver);
        assert.strictEqual(headerProduk, 'Products', 'Verifikasi: Judul halaman harus "Products" setelah login sukses.');
    });

    // Test case untuk memastikan muncul pesan error kalau username dikosongkan.
    it('Validasi pesan error saat username dikosongkan', async function() { 
        await LoginPage.login(driver, '', 'secret_sauce');
        const pesanError = await LoginPage.getErrorMessage(driver);
        assert.strictEqual(pesanError, 'Epic sadface: Username is required', 'Verifikasi: Pesan error "Username is required" seharusnya muncul.');
    });

    // --- Skenario Test Pengurutan Produk Z-A ---

    // Test case untuk mengecek apakah produk bisa diurutkan dari Z ke A.
    it('Memverifikasi produk terurut dari Z ke A', async function() { 
        await LoginPage.login(driver, 'standard_user', 'secret_sauce');

        const headerProduk = await ProductsPage.getPageTitle(driver);
        assert.strictEqual(headerProduk, 'Products', 'Verifikasi: Kita harusnya sudah di halaman Products setelah login.');

        await ProductsPage.sortProducts(driver, 'za'); // 'za' itu kodenya untuk Z ke A.

        const namaProdukAktual = await ProductsPage.getItemNames(driver);

        // Ini daftar nama produk yang kita harapkan setelah diurutkan Z-A.
        const namaProdukYangDiharapkan = [
            "Test.allTheThings() T-Shirt (Red)",
            "Sauce Labs Fleece Jacket",
            "Sauce Labs Bolt T-Shirt",
            "Sauce Labs Backpack",
            "Sauce Labs Bike Light",
            "Sauce Labs Onesie"
        ].sort((a, b) => b.localeCompare(a)); 

        assert.deepStrictEqual(namaProdukAktual, namaProdukYangDiharapkan, 'Verifikasi: Produk harusnya sudah terurut dari Z ke A dengan benar.');
    });

    // --- Skenario Test Visual ---

    it('Memverifikasi tampilan halaman login secara visual', async function() {
        const currentScreenshot = await driver.takeScreenshot();
        fs.writeFileSync(currentPath, currentScreenshot, 'base64');

        if (!fs.existsSync(baselinePath)) {
            console.log('Baseline image tidak ditemukan. Membuat baseline baru.');
            fs.writeFileSync(baselinePath, currentScreenshot, 'base64');
            return; 
        }

        // Baca baseline dan current image
        const img1 = PNG.sync.read(fs.readFileSync(baselinePath));
        const img2 = PNG.sync.read(fs.readFileSync(currentPath));

        // Pastikan ukuran gambar sama
        assert.strictEqual(img1.width, img2.width, 'Lebar gambar baseline dan current harus sama.');
        assert.strictEqual(img1.height, img2.height, 'Tinggi gambar baseline dan current harus sama.');

        // Buat objek diff image
        const diff = new PNG({ width: img1.width, height: img1.height });

        // Bandingkan gambar dan hitung perbedaan piksel
        const numDiffPixels = pixelmatch(
            img1.data, img2.data, diff.data, img1.width, img1.height,
            { threshold: 0.1 } // Ambang batas toleransi perbedaan piksel (0.1 = 10% toleransi)
        );

        // Jika ada perbedaan, simpan gambar diff
        if (numDiffPixels > 0) {
            fs.writeFileSync(diffPath, PNG.sync.write(diff));
            console.log(`Ditemukan ${numDiffPixels} perbedaan piksel. Lihat ${diffPath}`);
        }

        // Assert bahwa tidak ada perbedaan piksel yang signifikan
        assert.strictEqual(numDiffPixels, 0, `Verifikasi Visual: Ditemukan ${numDiffPixels} perbedaan piksel pada halaman login.`);
    });
});
