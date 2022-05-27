import { size } from '@lib/constants';
import { Vec2 } from 'raxis-core';

export enum ShapeType {
    Removed = -1,
    None,
    IPiece,
    JPiece,
    LPiece,
    OPiece,
    ZPiece,
    TPiece,
    SPiece,
}

export let createQueue = () =>
    Array.from(new Array(14), (_, i) => ((i + 1) % 7) + 1).sort(
        () => Math.random() - 0.5
    );

export const getMidIndex = (x: number) => (x + (x % 2)) / 2 - 1;

export const deepCopy = (m: ShapeType[][]) => JSON.parse(JSON.stringify(m));

export function spatialToMatrix(position: Vec2, length: number): Vec2 {
    return Vec2.subtract(
        position,
        new Vec2(((length + 1) % 2) * 15, ((length + 1) % 2) * -15)
    )
        .divideScalar(30)
        .floor();
}

export function matrixToSpatial(position: Vec2) {
    return (
        Vec2.subtract(position, new Vec2(size.x / 2, size.y / 2))
            .multiply(new Vec2(30, -30))
            // .add(new Vec2(((length + 1) % 2) * 15, ((length + 1) % 2) * 15))
            .add(new Vec2(15, -15))
    );
}

export const getColor = (type: ShapeType): string => {
    switch (type) {
        case ShapeType.None:
            return '';
        case ShapeType.IPiece:
            return '#0dff72';
        case ShapeType.JPiece:
            return '#ff8e0d';
        case ShapeType.LPiece:
            return '#f538ff';
        case ShapeType.OPiece:
            return '#0dc2ff';
        case ShapeType.ZPiece:
            return '#3877ff';
        case ShapeType.TPiece:
            return '#ff0d72';
        case ShapeType.SPiece:
            return '#ffe138';
    }
};

export const getPieceMatrix = (type: ShapeType): number[][] => {
    switch (type) {
        case ShapeType.IPiece:
            return [
                [0, 0, 1, 0],
                [0, 0, 1, 0],
                [0, 0, 1, 0],
                [0, 0, 1, 0],
            ];

        case ShapeType.JPiece:
            return [
                [0, 2, 0],
                [0, 2, 0],
                [2, 2, 0],
            ];

        case ShapeType.LPiece:
            return [
                [0, 3, 0],
                [0, 3, 0],
                [0, 3, 3],
            ];

        case ShapeType.OPiece:
            return [
                [4, 4],
                [4, 4],
            ];

        case ShapeType.ZPiece:
            return [
                [0, 5, 5],
                [5, 5, 0],
                [0, 0, 0],
            ];
        case ShapeType.TPiece:
            return [
                [0, 0, 0],
                [6, 6, 6],
                [0, 6, 0],
            ];
        case ShapeType.SPiece:
            return [
                [7, 7, 0],
                [0, 7, 7],
                [0, 0, 0],
            ];
    }
};
