import { Player } from '@lib/player';
import {
    deepCopy,
    getColor,
    matrixToSpatial,
    ShapeType,
    spatialToMatrix,
} from '@lib/shapes';
import { setBoard } from '@lib/storage';
import { Entity2d, Sprite2d } from '@utils/entity2d';
import { SquareMaterial2d } from '@utils/material2d';
import { Vec2 } from 'raxis-core';

export class Board {
    root: Entity2d;

    matrix: ShapeType[][];
    blocks: Sprite2d<SquareMaterial2d>[][];

    readonly size: Vec2;

    constructor(root: Entity2d, matrix?: ShapeType[][]) {
        this.size = new Vec2(10, 18);
        this.root = root;

        if (matrix) {
            this.matrix = deepCopy(matrix);

            this.blocks = new Array(this.size.y)
                .fill(0)
                .map((row) => new Array(this.size.x).fill(null));

            for (let r = 0; r < this.matrix.length; r++) {
                for (let c = 0; c < this.matrix[r].length; c++) {
                    if (this.matrix[r][c] > 0) {
                        this.blocks[r][c] = new Sprite2d(
                            new SquareMaterial2d({
                                color: getColor(this.matrix[r][c]),
                            }),
                            matrixToSpatial(new Vec2(c, r)),
                            new Vec2(30.1, 30.1)
                        );

                        this.root.add(this.blocks[r][c]);
                    }
                }
            }
        } else {
            this.matrix = new Array(this.size.y)
                .fill(0)
                .map(() => new Array(this.size.x).fill(0));

            this.blocks = new Array(this.size.y)
                .fill(0)
                .map(() => new Array(this.size.x).fill(null));
        }

        this.size = this.size.clone();
    }

    update(player: Player, clock: number): [boolean, number, boolean] {
        let bScoreChange = 0;

        if (player.needsRespawn) {
            this.incorporate(player);
            this.updateRenderMatrix(player);
            bScoreChange += 10;
        }

        let nc = 0;
        for (let r = 0; r < this.matrix.length; r++) {
            const isComplete = this.matrix[r].every((val) => val !== 0);

            if (isComplete) {
                this.matrix[r] = new Array(this.size.x).fill(-1);

                this.updateRenderMatrix(player);

                nc++;
            }
        }

        bScoreChange +=
            nc === 1
                ? 100 // 85
                : nc === 2
                ? 300 // 235
                : nc === 3
                ? 500 // 635
                : nc === 4
                ? 800 // 1135
                : 0;

        let gameOver = false;
        if (!this.matrix[2].every((val) => val === 0)) gameOver = true;

        setBoard(this);

        return [player.needsRespawn, bScoreChange, gameOver];
    }

    updateRenderMatrix(player: Player) {
        let cStart = 0;
        let cEnd = 0;

        for (let r = 0; r < this.matrix.length; r++) {
            if (this.matrix[r].every((val) => val === ShapeType.Removed)) {
                cStart = r;
                break;
            }
        }

        for (let r = this.matrix.length - 1; r >= 0; r--) {
            if (this.matrix[r].every((val) => val === ShapeType.Removed)) {
                cEnd = r + 1;
                break;
            }
        }

        const cRange = cEnd - cStart;

        for (let r = 0; r < this.matrix.length; r++) {
            for (let c = 0; c < this.matrix[r].length; c++) {
                // remove block if destroyed
                if (this.matrix[r][c] === ShapeType.Removed) {
                    if (this.blocks[r][c]) this.blocks[r][c].terminate();
                    this.blocks[r][c] = null;
                }

                // make blocks fall
                if (cRange > 0 && r < cStart && this.blocks[r][c]) {
                    this.blocks[r][c].position.y -= 30 * cRange;
                }

                // add block if created
                if (this.matrix[r][c] > 0 && !this.blocks[r][c]) {
                    this.blocks[r][c] = new Sprite2d(
                        new SquareMaterial2d({
                            color: getColor(this.matrix[r][c]),
                        }),
                        matrixToSpatial(new Vec2(c, r)),
                        new Vec2(30.1, 30.1)
                    );

                    this.root.add(this.blocks[r][c]);
                }
            }
        }

        for (let r = 0; r < this.matrix.length; r++) {
            if (this.matrix[r].every((v) => v !== ShapeType.Removed)) continue;

            this.matrix.splice(r, 1);
            this.blocks.splice(r, 1);

            this.matrix.unshift(new Array(this.size.x).fill(ShapeType.None));
            this.blocks.unshift(new Array(this.size.x).fill(null));
        }
    }

    incorporate(props: { matrix: number[][]; position: Vec2; center: Vec2 }) {
        const { matrix, position, center } = props;
        const pos = spatialToMatrix(position, matrix.length);

        for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < matrix[r].length; c++) {
                if (matrix[r][c] === ShapeType.None) continue;

                const x = pos.x + this.size.x / 2 + (c - center.x);
                const y = -pos.y + this.size.y / 2 + (r - center.y) - 1;

                if (
                    x < 0 ||
                    x > this.size.x - 1 ||
                    y < 0 ||
                    y > this.size.y - 1
                )
                    continue;

                this.matrix[y][x] = matrix[r][c];
            }
        }
    }

    getMerged(props: {
        matrix: number[][];
        position: Vec2;
        center: Vec2;
    }): number[][] {
        const { matrix, position, center } = props;
        const pos = spatialToMatrix(position, matrix.length);

        const merged = deepCopy(this.matrix);

        for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < matrix[r].length; c++) {
                if (matrix[r][c] === ShapeType.None) continue;

                const x = pos.x + this.size.x / 2 + (c - center.x);
                const y = -pos.y + this.size.y / 2 + (r - center.y) - 1;

                if (
                    x < 0 ||
                    x > this.size.x - 1 ||
                    y < 0 ||
                    y > this.size.y - 1
                )
                    continue;

                merged[y][x] = matrix[r][c];
            }
        }

        return merged;
    }

    overlap(current: number[][], future: number[][]): boolean {
        const cc = current.reduce((acc, row) => {
            return (
                acc +
                row.reduce((acc, val) => {
                    return acc + (val !== 0 ? 1 : 0);
                }, 0)
            );
        }, 0);

        const fc = future.reduce((acc, row) => {
            return (
                acc +
                row.reduce((acc, val) => {
                    return acc + (val !== 0 ? 1 : 0);
                }, 0)
            );
        }, 0);

        return cc > fc;
    }
}
