class CookieManager {
    public get(key: string): string {
        for (const cookie of document.cookie.split(';')) {
            const cookieParts: string[] = cookie.trim().split('=');
            if (cookieParts[0] === key) return cookieParts[1];
        }
        return '';
    }

    public set(key: string, value: string, expirationSeconds: number) {
        const d = new Date();
        // One month expiration for cookie
        d.setTime(d.getTime() + expirationSeconds * 1000);
        document.cookie = key + '=' + value + ';expires=' + d.toUTCString() + ';samesite=strict';
    }
}

export default new CookieManager();
