import { Board } from '@lib/board';
import { ClassicGame } from '@lib/game';
import {
    deepCopy,
    getColor,
    getMidIndex,
    getPieceMatrix,
    ShapeType,
} from '@lib/shapes';
import { setPlayer } from '@lib/storage';
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

export interface PreviousPlayerState {
    rightKeys: boolean;
    leftKeys: boolean;
    spinRKeys: boolean;
    spinLKeys: boolean;
    softDropKeys: boolean;
}

export class Player {
    shape: ShapeType;
    matrix: ShapeType[][];

    parent: Entity2d;

    center: Vec2;

    rightKeys: keyTracker;
    leftKeys: keyTracker;
    spinRKeys: keyTracker;
    spinLKeys: keyTracker;
    softDropKeys: keyTracker;
    hardDropKeys: keyTracker;
    holdKeys: keyTracker;

    mrCount: number | null;
    mlCount: number | null;
    mdCount: number | null;
    srCount: number | null;
    slCount: number | null;

    tSLD: number = 0; // time since last downward move

    needsRespawn: boolean;
    modifier: number;

    constructor(
        game: ClassicGame,
        shape: ShapeType,
        position: Vec2,
        prevState?: PreviousPlayerState,
        matrix?: ShapeType[][]
    ) {
        const root = game.renderer.root;
        const board = game.board;

        if (matrix) {
            this.matrix = matrix;
        } else {
            this.matrix = getPieceMatrix(shape);
        }

        this.shape = shape;

        this.center = new Vec2(
            getMidIndex(this.matrix.length),
            getMidIndex(this.matrix[0].length)
        );

        this.modifier = ((this.matrix.length / 2) * 10) % 10 === 0 ? 15 : 0;

        this.parent = new Sprite2d(
            new EmptyMaterial2d(),
            Vec2.add(position, new Vec2(this.modifier, this.modifier)),
            new Vec2(0, 0),
            0
        );

        // const c = new Sprite2d(
        //     new SquareMaterial2d({ color: 'white' }),
        //     new Vec2(0, 0),
        //     new Vec2(10, 10),
        //     0
        // );

        this.matrix.forEach((row, y) => {
            row.forEach((s, x) => {
                if (s === ShapeType.None) return;

                const square = new Sprite2d(
                    new SquareMaterial2d({
                        color: getColor(shape),
                    }),
                    new Vec2(
                        (x - this.center.x) * 30 - this.modifier,
                        -(y - this.center.y) * 30 + this.modifier
                    ),
                    new Vec2(30.1, 30.1),
                    0
                );

                this.parent.add(square);
            });
        });

        // this.parent.add(c);

        root.add(this.parent);

        this.rightKeys = new keyTracker('ArrowRight', 'd');
        this.leftKeys = new keyTracker('ArrowLeft', 'a');
        this.spinRKeys = new keyTracker('ArrowUp', 'w');
        this.spinLKeys = new keyTracker('');
        this.softDropKeys = new keyTracker('ArrowDown', 's');
        this.hardDropKeys = new keyTracker(' ');
        this.holdKeys = new keyTracker('c');

        this.rightKeys.onKeyDown(() => this.moveRight(board));

        this.mdCount = null;
        this.mrCount = null;
        this.mlCount = null;
        this.srCount = null;
        this.slCount = null;

        if (prevState) {
            this.rightKeys.isDown = prevState.rightKeys;
            this.rightKeys.isUp = !prevState.rightKeys;
            this.leftKeys.isDown = prevState.leftKeys;
            this.leftKeys.isUp = !prevState.leftKeys;
            this.spinRKeys.isDown = prevState.spinRKeys;
            this.spinRKeys.isUp = !prevState.spinRKeys;
            this.spinLKeys.isDown = prevState.spinLKeys;
            this.spinLKeys.isUp = !prevState.spinLKeys;
            this.softDropKeys.isDown = prevState.softDropKeys;
            this.softDropKeys.isUp = !prevState.softDropKeys;
            this.mdCount = prevState.softDropKeys ? 1 : null;
            this.mrCount = prevState.rightKeys ? 1 : null;
            this.mlCount = prevState.leftKeys ? 1 : null;
            this.srCount = prevState.spinRKeys ? 1 : null;
            this.slCount = prevState.spinLKeys ? 1 : null;
        }

        this.needsRespawn = false;
    }

    update(board: Board, clock: number): [number] {
        let pScoreChange = 0;

        if (clock % 22 === 0 && this.softDropKeys.isUp) this.moveDown(board);

        if (!this.mdCount && this.softDropKeys.isDown) this.mdCount = clock % 4;
        if (this.mdCount && this.softDropKeys.isUp) this.mdCount = null;

        if (
            this.softDropKeys.isDown &&
            this.mdCount &&
            (clock % 4) - this.mdCount === 0
        ) {
            const [psc] = this.softDrop(board);
            pScoreChange += psc;
        }

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

        if (this.tSLD > 30) {
            this.needsRespawn = true;
        }

        return [pScoreChange];
    }

    moveDown(board: Board) {
        const current = board.getMerged(this);

        const position = Vec2.add(this.position, new Vec2(0, -30));

        const future = board.getMerged({ ...this, position });

        const overlap = !board.overlap(current, future);

        setPlayer(this);

        if (overlap) {
            this.position.y -= 30;
            this.tSLD = 0;
        } else this.tSLD += 22;
    }

    softDrop(board: Board): [number] {
        const current = board.getMerged(this);

        const position = Vec2.add(this.position, new Vec2(0, -30));

        const future = board.getMerged({ ...this, position });


        if (!board.overlap(current, future)) {
            this.position.y -= 30;
            setPlayer(this);
            return [1];
        } else {
            this.tSLD += 6;
            return [0];
        }
    }

    moveRight(board: Board) {
        const current = board.getMerged(this);

        const position = Vec2.add(this.position, new Vec2(30, 0));

        const future = board.getMerged({ ...this, position });

        if (!board.overlap(current, future)) {
            setPlayer(this);
            this.position.x += 30;
        }
    }

    moveLeft(board: Board) {
        const current = board.getMerged(this);

        const position = Vec2.add(this.position, new Vec2(-30, 0));

        const future = board.getMerged({ ...this, position });

        setPlayer(this);

        if (!board.overlap(current, future)) {
            setPlayer(this);
            this.position.x -= 30;
        }
    }

    rotateRight(board: Board) {
        const current = board.getMerged(this);

        const cm = deepCopy(this.matrix).reverse();

        const matrix = Array.from(Array(this.matrix.length), () =>
            Array(this.matrix[0].length).fill(0)
        ).map((row, y) => row.map((_, x) => cm[x][y]));

        const future = board.getMerged({
            center: this.center,
            position: this.position,
            matrix,
        });

        if (!board.overlap(current, future)) {
            setPlayer(this);
            this.matrix = matrix;
            this.parent.setRotation(this.parent.rotation - Math.PI / 2);
        }
    }

    rotateLeft() {}

    get position(): Vec2 {
        return this.parent.position;
    }

    playerData() {
        return {
            shape: this.shape,
            matrix: this.matrix,
            ...Vec2.subtractScalar(this.position, this.modifier),
        };
    }

    terminate(): [PreviousPlayerState] {
        this.parent.children.forEach((c) => c.terminate());
        this.parent.terminate();

        const prevState: PreviousPlayerState = {
            rightKeys: this.rightKeys.isDown,
            leftKeys: this.leftKeys.isDown,
            spinRKeys: this.spinRKeys.isDown,
            spinLKeys: this.spinLKeys.isDown,
            softDropKeys: this.softDropKeys.isDown,
        };

        this.rightKeys.terminate();
        this.leftKeys.terminate();
        this.spinRKeys.terminate();
        this.spinLKeys.terminate();
        this.softDropKeys.terminate();
        this.hardDropKeys.terminate();
        this.holdKeys.terminate();

        return [prevState];
    }
}
