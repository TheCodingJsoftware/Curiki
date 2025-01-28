export const trustworthyDomains = [
    'google.com',
    'google.ca',
    'amazon.ca',
    'amazon.ca',
    'teacherspayteachers.com',
    'youtube.com',
    'pinterest.com',
    'khanacademy.org',
    'ed.gov',
    'edu.gov',
    'nasa.gov',
    'britannica.com',
    'wikipedia.org',
    'archive.org',
    'scholastic.com',
    'edx.org',
    'coursera.org',
    'mb.ca',
    'chatgpt.com'
];

export const trustworthySuffixes = [
    '.gov',
    '.edu'
];

export function isTrustworthyResource(resourceLink: string): boolean {
    try {
        const url = new URL(resourceLink);

        if (url.protocol !== 'https:') {
            return false;
        }

        const matchesTrustedDomain = trustworthyDomains.some(domain =>
            url.hostname.includes(domain)
        );

        const matchesTrustedSuffix = trustworthySuffixes.some(suffix =>
            url.hostname.endsWith(suffix)
        );

        const isPdfFile = url.pathname.toLowerCase().endsWith('.pdf');

        return matchesTrustedDomain || matchesTrustedSuffix || isPdfFile;
    } catch (error) {
        return false;
    }
}
