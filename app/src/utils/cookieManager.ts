export default class CookieManager {
    static getCookie(name: string): string | null {
        const cookies = document.cookie.split(';');
        const cookie = cookies.find(c => c.trim().startsWith(`${name}=`));
        return cookie ? cookie.split('=')[1] : null;
    }

    static setCookie(name: string, value: string, path: string = '/'): void {
        document.cookie = `${name}=${value}; path=${path}`;
        console.log(document.cookie);
    }

    static deleteCookie(name: string, path: string = '/'): void {
        document.cookie = `${name}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
    }
}
