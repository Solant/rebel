export type DiscriminateUnion<T, K extends keyof T, V extends T[K]> = T extends Record<K, V> ? T : never;

export interface EnterExitVisitor<T extends B, B> {
    enter?: (node: T, path: B[]) => any,
    exit?: (node: T, path: B[]) => any,
}
