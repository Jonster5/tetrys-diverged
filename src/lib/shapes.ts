export enum ShapeType {
    None = 0,
    IPiece,
    JPiece,
    LPiece,
    OPiece,
    ZPiece,
    TPiece,
    SPiece,
}

export const getMidIndex = (x: number) => (x + (x % 2)) / 2 - 1;

export const deepCopy = (m: number[][]) => JSON.parse(JSON.stringify(m));

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
