const nonNullableNumber = (i: number | undefined) => {
    if (!i) {
        throw new Error('i cannot be undefined');
    }
    return i;
};

export default nonNullableNumber;
