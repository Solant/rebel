export type DiscriminateUnion<T, K extends keyof T, V extends T[K]> = T extends Record<K, V> ? T : never;

export interface EnterExitVisitor<T> {
    enter?: (node: T, path: T[]) => any,
    exit?: (node: T, path: T[]) => any,
}

type VisitType = keyof EnterExitVisitor<any>;

type Visitor<T> = { [key: string]: EnterExitVisitor<T> }

function visit<T extends { type: string }>(node: T, visitors: Visitor<T>[], path: T[], visitType: VisitType) {
    for (let visitor of visitors) {
        const callback = visitor[node.type];
        if (callback && callback[visitType]) {
            callback[visitType]!(node, path);
        }
    }
}
