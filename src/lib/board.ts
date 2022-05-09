import { Player } from '@lib/player';
import { deepCopy, getColor, ShapeType } from '@lib/shapes';
import { Entity2d, Sprite2d } from '@utils/entity2d';
import { SquareMaterial2d } from '@utils/material2d';
import { Vec2 } from 'raxis-core';

export class Board {
    root: Entity2d;

    matrix: ShapeType[][];
    blocks: Sprite2d<SquareMaterial2d>[][];

    readonly size: Vec2;

    constructor(size: Vec2, root: Entity2d) {
        this.root = root;

        this.matrix = new Array(size.y)
            .fill(0)
            .map((row) => new Array(size.x).fill(0));

        this.blocks = new Array(size.y)
            .fill(0)
            .map((row) => new Array(size.x).fill(null));

        this.size = size.clone();
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
                        this.matrixToSpatial(
                            new Vec2(c, r),
                            player.matrix.length
                        ),
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

    spatialToMatrix(position: Vec2, length: number): Vec2 {
        return Vec2.subtract(
            position,
            new Vec2(((length + 1) % 2) * 15, ((length + 1) % 2) * -15)
        )
            .divideScalar(30)
            .floor();
    }

    matrixToSpatial(position: Vec2, length: number) {
        return (
            Vec2.subtract(position, new Vec2(this.size.x / 2, this.size.y / 2))
                .multiply(new Vec2(30, -30))
                // .add(new Vec2(((length + 1) % 2) * 15, ((length + 1) % 2) * 15))
                .add(new Vec2(15, -15))
        );
    }

    incorporate(props: { matrix: number[][]; position: Vec2; center: Vec2 }) {
        const { matrix, position, center } = props;
        const pos = this.spatialToMatrix(position, matrix.length);

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
        const pos = this.spatialToMatrix(position, matrix.length);

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
