const parseNullableToNonNullable = <T>(t: T | null | void) => {
    if (t === null || t === undefined) {
        throw new Error(`t: ${t} queried cannot be null`);
    }
    return t;
};

type DeepNonNullable<T> = {
    [K in keyof T]-?: T[K] extends undefined
        ? undefined
        : T[K] extends Function
        ? T[K]
        : DeepNonNullable<NonNullable<T[K]>>;
};

type DeepReadonly<T> = T extends (infer R)[]
    ? ReadonlyArray<DeepReadonly<R>>
    : T extends Function
    ? T
    : T extends object
    ? DeepReadonlyObject<T>
    : T;

type DeepReadonlyObject<T> = {
    readonly [P in keyof T]: DeepReadonly<T[P]>;
};

export { DeepReadonly, DeepNonNullable, parseNullableToNonNullable };
