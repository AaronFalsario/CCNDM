export default {
    async fetch(request) {
        const url = new URL(request.url);
        url.protocol = "https:";
        url.hostname = "ccndm.vercel.app"; // your Vercel address
        url.port = "";
        return fetch(new Request(url, request));
    },
};