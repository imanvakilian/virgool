export function createSlug(str: string) {
    return str.replace(/[،ًًًٌٍُِ\.\+\-_)(*&^%$#@!~'";:?><«»`ء]+/g, '')?.replace(/[\s]+/g, '-');
}
export function randomId() {
    return Math.random().toString(36).substring(2);
}