export type DiscriminateUnion<T, K extends keyof T, V extends T[K]> = T extends Record<K, V> ? T : never;

export interface EnterExitVisitor<T extends B, B, S> {
    enter?: (node: T, path: B[], scope: S) => any,
    exit?: (node: T, path: B[], scope: S) => any,
}
