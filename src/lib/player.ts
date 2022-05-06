import { Board } from '@lib/board';
import {
    deepCopy,
    getColor,
    getMidIndex,
    getPieceMatrix,
    ShapeType,
} from '@lib/shapes';
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

    parent: Entity2d;

    center: Vec2;

    rightKeys: keyTracker;
    leftKeys: keyTracker;
    spinRKeys: keyTracker;
    spinLKeys: keyTracker;
    softDropKeys: keyTracker;
    hardDropKeys: keyTracker;

    mrCount: number | null;
    mlCount: number | null;
    mdCount: number | null;
    srCount: number | null;
    slCount: number | null;

    constructor(
        root: Sprite2d<EmptyMaterial2d>,
        shape: ShapeType,
        location: Vec2
    ) {
        const matrix = getPieceMatrix(shape);
        this.shape = shape;
        this.matrix = matrix;

        this.center = new Vec2(
            getMidIndex(matrix.length),
            getMidIndex(matrix[0].length)
        );

        const modifier = ((matrix.length / 2) * 10) % 10 === 0 ? 15 : 0;

        this.parent = new Sprite2d(
            new EmptyMaterial2d(),
            Vec2.add(location, new Vec2(modifier, modifier)),
            new Vec2(0, 0),
            0
        );

        const c = new Sprite2d(
            new SquareMaterial2d({ color: 'white' }),
            new Vec2(0, 0),
            new Vec2(10, 10),
            0
        );

        this.matrix.forEach((row, y) => {
            row.forEach((s, x) => {
                if (s === ShapeType.None) return;

                const square = new Sprite2d(
                    new SquareMaterial2d({
                        color: getColor(shape),
                    }),
                    new Vec2(
                        (x - this.center.x) * 30 - modifier,
                        -(y - this.center.y) * 30 + modifier
                    ),
                    new Vec2(30.1, 30.1),
                    0
                );

                this.parent.add(square);
            });
        });

        this.parent.add(c);

        root.add(this.parent);

        this.rightKeys = new keyTracker('arrowRight', 'd');
        this.leftKeys = new keyTracker('arrowLeft', 'a');
        this.spinRKeys = new keyTracker('arrowUp', 'w');
        this.spinLKeys = new keyTracker('');
        this.softDropKeys = new keyTracker('arrowDown', 's');
        this.hardDropKeys = new keyTracker(' ');

        this.mdCount = null;
        this.mrCount = null;
        this.mlCount = null;
        this.srCount = null;
        this.slCount = null;
    }

    update(board: Board, clock: number) {
        if (clock % 22 === 0 && this.softDropKeys.isUp) this.moveDown(board);

        if (!this.mdCount && this.softDropKeys.isDown) this.mdCount = clock % 6;
        if (this.mdCount && this.softDropKeys.isUp) this.mdCount = null;

        if (
            this.softDropKeys.isDown &&
            this.mdCount &&
            (clock % 6) - this.mdCount === 0
        )
            this.moveDown(board);

        if (!this.mrCount && this.rightKeys.isDown) this.mrCount = clock % 6;
        if (this.mrCount && this.rightKeys.isUp) this.mrCount = null;

        if (
            this.rightKeys.isDown &&
            this.mrCount &&
            (clock % 6) - this.mrCount === 0
        )
            this.moveRight(board);

        if (!this.mlCount && this.leftKeys.isDown) this.mlCount = clock % 6;
        if (this.mlCount && this.leftKeys.isUp) this.mlCount = null;

        if (
            this.leftKeys.isDown &&
            this.mlCount &&
            (clock % 6) - this.mlCount === 0
        )
            this.moveLeft(board);

        if (!this.srCount && this.spinRKeys.isDown) this.srCount = clock % 6;
        if (this.srCount && this.spinRKeys.isUp) this.srCount = null;

        if (
            this.spinRKeys.isDown &&
            this.srCount &&
            (clock % 6) - this.srCount === 0
        )
            this.rotateRight(board);
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

    rotateRight(board: Board) {
        const current = board.getMerged(this);

        const cm = deepCopy(this.matrix).reverse();

        const matrix = Array.from(Array(this.matrix.length), () =>
            Array(this.matrix[0].length).fill(0)
        ).map((row, y) => row.map((_, x) => cm[x][y]));

        console.log(cm, matrix);

        const future = board.getMerged({
            center: this.center,
            position: this.position,
            matrix,
        });

        console.log(current, future);

        if (!board.overlap(current, future)) {
            this.matrix = matrix;
            this.parent.setRotation(this.parent.rotation - Math.PI / 2);
        }
    }

    rotateLeft() {}

    get position(): Vec2 {
        return this.parent.position;
    }

    terminate() {}
}
