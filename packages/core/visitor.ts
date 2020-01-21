export type DiscriminateUnion<T, K extends keyof T, V extends T[K]> = T extends Record<K, V> ? T : never;

export interface EnterExitVisitor<T extends B, B, S, R = void> {
    enter?: (node: T, path: B[], scope: S) => R,
    exit?: (node: T, path: B[], scope: S) => R,
}

interface TaggedInterface<E> {
    type: E,
}

// https://github.com/microsoft/TypeScript/issues/30611#issuecomment-565384924
export type GenericVisitor<Enum extends string | number, NodeType extends TaggedInterface<Enum>, State, Ret> = { [key in Enum]?: EnterExitVisitor<DiscriminateUnion<NodeType, 'type', key>, NodeType, State, Ret> };

function visitHelper<Enum extends string | number, NodeType extends TaggedInterface<Enum>, State, Ret>(node: NodeType, visitors: GenericVisitor<Enum, NodeType, State, Ret>[], path: NodeType[], scope: State, fun: 'enter' | 'exit'): Ret | undefined {
    for (let visitor of visitors) {
        const callback = visitor[node.type] as EnterExitVisitor<NodeType, NodeType, State, Ret> | undefined;
        if (callback && callback[fun]) {
            return callback[fun]!(node, path, scope);
        }
    }
}

export function enterNode<Enum extends string | number, NodeType extends TaggedInterface<Enum>, State, Ret>(node: NodeType, visitors: GenericVisitor<Enum, NodeType, State, Ret>[], path: NodeType[], scope: State): Ret | undefined {
    return visitHelper(node, visitors, path, scope, 'enter');
}

export function exitNode<Enum extends string | number, NodeType extends TaggedInterface<Enum>, State, Ret>(node: NodeType, visitors: GenericVisitor<Enum, NodeType, State, Ret>[], path: NodeType[], scope: State): Ret | undefined {
    return visitHelper(node, visitors, path, scope, 'exit');
}
