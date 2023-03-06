export function withTrailingSlash(s: string) {
    if (s.endsWith('/')) {
        return s;
    } else {
        return s + '/';
    }
}

export function withoutTrailingSlash(s: string) {
    while (s.endsWith('/')) {
        s = s.substring(0, s.length-1);
    }
    return s;
}