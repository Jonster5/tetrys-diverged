import { getColor, getPieceMatrix, ShapeType } from '@lib/shapes';
import { Entity2d, Sprite2d } from '@utils/entity2d';
import { EmptyMaterial2d, SquareMaterial2d } from '@utils/material2d';
import { Vec2 } from 'raxis-core';

export class Player {
    shape: ShapeType;
    matrix: number[][];

    center: Entity2d;

    pivot: Vec2 | null;

    constructor(
        root: Sprite2d<EmptyMaterial2d>,
        shape: ShapeType,
        location: Vec2
    ) {
        const { matrix, pivot } = getPieceMatrix(shape);
        this.shape = shape;

        this.matrix = matrix;

        if (pivot) this.pivot = Vec2.fromObject(pivot);
        else this.pivot = null;

        this.center = new Sprite2d(
            new EmptyMaterial2d(),
            location,
            new Vec2(0, 0),
            0
        );

        this.matrix.forEach((row, y) => {
            row.forEach((s, x) => {
                if (s === ShapeType.None) return;

                const square = new Sprite2d(
                    new SquareMaterial2d({
                        color: getColor(shape),
                    }),

                    new Vec2((x - pivot.x) * 30, (y - pivot.y) * 30),
                    new Vec2(31, 31),
                    0
                );

                this.center.add(square);
            });
        });

        root.add(this.center);
    }
}
