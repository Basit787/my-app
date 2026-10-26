// Full short URL on the host this page was opened from (localhost, a LAN IP, a domain…); /r/* is proxied to the API
export const shortUrl = (shortPath: string) => `${window.location.origin}${shortPath}`;
