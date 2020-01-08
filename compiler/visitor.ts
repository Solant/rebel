export type DiscriminateUnion<T, K extends keyof T, V extends T[K]> = T extends Record<K, V> ? T : never;

export interface EnterExitVisitor<T extends B, B, S, R = void> {
    enter?: (node: T, path: B[], scope: S) => R,
    exit?: (node: T, path: B[], scope: S) => R,
}

interface TaggedInterface<E> {
    type: E,
}

// ts-ignore required, as enum can't be described with type system
// @ts-ignore
export type GenericVisitor<Enum, NodeType extends TaggedInterface<Enum>, State, Ret> = { [key in Enum]?: EnterExitVisitor<DiscriminateUnion<NodeType, 'type', key>, NodeType, State, Ret> };

function visitHelper<Enum, NodeType extends TaggedInterface<Enum>, State, Ret>(node: NodeType, visitors: GenericVisitor<Enum, NodeType, State, Ret>[], path: NodeType[], scope: State, fun: 'enter' | 'exit'): Ret | undefined {
    for (let visitor of visitors) {
        const callback = visitor[node.type] as EnterExitVisitor<NodeType, NodeType, State, Ret> | undefined;
        if (callback && callback[fun]) {
            return callback[fun]!(node, path, scope);
        }
    }
}

export function enterNode<Enum, NodeType extends TaggedInterface<Enum>, State, Ret>(node: NodeType, visitors: GenericVisitor<Enum, NodeType, State, Ret>[], path: NodeType[], scope: State): Ret | undefined {
    return visitHelper(node, visitors, path, scope, 'enter');
}

export function exitNode<Enum, NodeType extends TaggedInterface<Enum>, State, Ret>(node: NodeType, visitors: GenericVisitor<Enum, NodeType, State, Ret>[], path: NodeType[], scope: State): Ret | undefined {
    return visitHelper(node, visitors, path, scope, 'exit');
}
