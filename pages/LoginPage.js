import { By } from 'selenium-webdriver'; 

// Definisikan elemen-elemen (locators) di halaman Login
const LoginPage = {
    // Locator untuk field username
    inputUsername: By.id('user-name'),
    // Locator untuk field password
    inputPassword: By.id('password'),
    // Locator untuk tombol login
    buttonLogin: By.id('login-button'),
    // Locator untuk elemen pesan error
    errorMessage: By.css('[data-test="error"]'),

    /**
     * Fungsi untuk melakukan aksi login.
     * @param {WebDriver} driver - Instance WebDriver yang sedang berjalan.
     * @param {string} username - Username untuk login.
     * @param {string} password - Password untuk login.
     */
    async login(driver, username, password) {
        await driver.findElement(this.inputUsername).sendKeys(username);
        await driver.findElement(this.inputPassword).sendKeys(password);
        await driver.findElement(this.buttonLogin).click();
    },

    /**
     * Fungsi untuk mendapatkan teks pesan error.
     * @param {WebDriver} driver - Instance WebDriver yang sedang berjalan.
     * @returns {Promise<string>} - Teks pesan error.
     */
    async getErrorMessage(driver) {
        return await driver.findElement(this.errorMessage).getText();
    }
};

export default LoginPage;
