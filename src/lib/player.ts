import { Board } from '@lib/board';
import { getColor, getPieceMatrix, ShapeType } from '@lib/shapes';
import { Entity2d, Sprite2d } from '@utils/entity2d';
import { keyTracker } from '@utils/keyTracker';
import { EmptyMaterial2d, SquareMaterial2d } from '@utils/material2d';
import { Vec2 } from 'raxis-core';

export enum Event {
    down,
    right,
    left,
    spinR,
    spinL,
    soft = down,
    hard,
}

export class Player {
    shape: ShapeType;
    matrix: number[][];

    center: Entity2d;

    pivot: Vec2 | null;

    eventQ: [];

    rightKeys: keyTracker;
    leftKeys: keyTracker;
    spinRKeys: keyTracker;
    spinLKeys: keyTracker;
    softDropKeys: keyTracker;
    hardDropKeys: keyTracker;

    constructor(
        root: Sprite2d<EmptyMaterial2d>,
        shape: ShapeType,
        location: Vec2
    ) {
        const { matrix, pivot } = getPieceMatrix(shape);
        this.shape = shape;
        this.matrix = matrix;

        this.eventQ = [];

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

                    this.pivot
                        ? new Vec2((x - pivot.x) * 30, -(y - pivot.y) * 30)
                        : new Vec2(x * 30, -y * 30),
                    new Vec2(31, 31),
                    0
                );

                this.center.add(square);
            });
        });

        root.add(this.center);

        this.rightKeys = new keyTracker('arrowRight', 'd');
        this.leftKeys = new keyTracker('arrowLeft', 'a');
        this.spinRKeys = new keyTracker('arrowUp', 'w');
        this.spinLKeys = new keyTracker('');
        this.softDropKeys = new keyTracker('arrowDown', 's');
        this.hardDropKeys = new keyTracker(' ');
    }

    update(board: Board, clock: number) {
        if (clock % 12 === 0 && this.softDropKeys.isUp) this.moveDown(board);

        if (clock % 3 === 0) {
            if (this.softDropKeys.isDown) this.moveDown(board);
            if (this.rightKeys.isDown) this.moveRight(board);
            if (this.leftKeys.isDown) this.moveLeft(board);
        }
    }

    moveDown(board: Board) {
        const current = board.getMerged(this);

        const position = Vec2.add(this.position, new Vec2(0, -30));

        const future = board.getMerged({ ...this, position });

        if (!board.overlap(current, future)) this.position.y -= 30;
    }

    moveRight(board: Board) {
        const current = board.getMerged(this);

        const position = Vec2.add(this.position, new Vec2(30, 0));

        const future = board.getMerged({ ...this, position });

        if (!board.overlap(current, future)) this.position.x += 30;
    }

    moveLeft(board: Board) {
        const current = board.getMerged(this);

        const position = Vec2.add(this.position, new Vec2(-30, 0));

        const future = board.getMerged({ ...this, position });

        if (!board.overlap(current, future)) this.position.x -= 30;
    }

    rotateRight() {}

    rotateLeft() {}

    get position(): Vec2 {
        return this.center.position;
    }

    terminate() {}
}
