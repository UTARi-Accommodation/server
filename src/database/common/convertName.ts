const camelCaseToUnderScore = (s: string) =>
    s
        .replace(/\.?([A-Z]+)/g, (_, y) => `_${y.toLowerCase()}`)
        .replace(/^_/, '');

const underScoreToCamelCase = (s: string) =>
    s.replace(/_([a-z])/g, ([_, k]) => {
        if (!k) {
            throw new Error(`K is undefined`);
        }
        return k.toUpperCase();
    });

export { underScoreToCamelCase, camelCaseToUnderScore };
