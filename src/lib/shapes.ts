export enum ShapeType {
    None = 0,
    LPiece,
    JPiece,
    SPiece,
    ZPiece,
    TPiece,
    OPiece,
    IPiece,
}

export const getColor = (type: ShapeType): string => {
    switch (type) {
        case ShapeType.None:
            return '';
        case ShapeType.LPiece:
            return '#f538ff';
        case ShapeType.JPiece:
            return '#ff8e0d';
        case ShapeType.SPiece:
            return '#ffe138';
        case ShapeType.ZPiece:
            return '#3877ff';
        case ShapeType.TPiece:
            return '#ff0d72';
        case ShapeType.OPiece:
            return '#0dc2ff';
        case ShapeType.IPiece:
            return '#0dff72';
    }
};

export const getPieceMatrix = (
    type: ShapeType
): { matrix: number[][]; pivot: { x: number; y: number } | null } => {
    switch (type) {
        case ShapeType.LPiece:
            return {
                matrix: [
                    [0, 1, 0],
                    [0, 1, 0],
                    [0, 1, 1],
                ],
                pivot: { x: 1, y: 1 },
            };
        case ShapeType.JPiece:
            return {
                matrix: [
                    [0, 2],
                    [0, 2],
                    [2, 2],
                ],
                pivot: { x: 1, y: 1 },
            };
        case ShapeType.SPiece:
            return {
                matrix: [
                    [4, 4, 0],
                    [0, 4, 4],
                ],
                pivot: { x: 1, y: 1 },
            };
        case ShapeType.ZPiece:
            return {
                matrix: [
                    [0, 3, 3],
                    [3, 3, 0],
                ],
                pivot: { x: 1, y: 1 },
            };
        case ShapeType.TPiece:
            return {
                matrix: [
                    [0, 5, 0],
                    [5, 5, 5],
                ],
                pivot: { x: 1, y: 1 },
            };
        case ShapeType.OPiece:
            return {
                matrix: [
                    [6, 6],
                    [6, 6],
                ],
                pivot: null,
            };
        case ShapeType.IPiece:
            return {
                matrix: [[7], [7], [7], [7]],
                pivot: { x: 0, y: 1 },
            };
    }
};
