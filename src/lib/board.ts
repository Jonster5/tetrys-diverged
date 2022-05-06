import { Player } from '@lib/player';
import { deepCopy, ShapeType } from '@lib/shapes';
import { Vec2 } from 'raxis-core';

export class Board {
    matrix: number[][];

    readonly size: Vec2;

    constructor(size: Vec2) {
        this.matrix = [];

        for (let y = 0; y < size.y; y++) {
            this.matrix[y] = [];

            for (let x = 0; x < size.x; x++) {
                this.matrix[y][x] = 0;
            }
        }

        this.size = size.clone();
    }

    update(player: Player, clock: number) {
        player.matrix.forEach((row, y) => {
            row.forEach((s, x) => {
                if (s === 0) return;

                // this.matrix[y + player.pos.y][x + player.pos.x] = s;
            });
        });
    }

    spatialToMatrix(position: Vec2) {
        return Vec2.divideScalar(position, 30).floor();
    }

    matrixToSpatial(position: Vec2) {
        return Vec2.multiplyScalar(position, 30).subtractScalar(15);
    }

    incorporate(props: { matrix: number[][]; position: Vec2; center: Vec2 }) {
        const { matrix, position, center } = props;
        const pos = this.spatialToMatrix(position);

        for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < matrix[r].length; c++) {
                if (matrix[r][c] === ShapeType.None) continue;

                const x = pos.x + this.size.x / 2 + (c - center.x);
                const y = -pos.y + this.size.y / 2 + (r - center.y) - 1;

                if (x < 0 || x > this.size.x || y < 0 || y > this.size.y)
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
        const pos = this.spatialToMatrix(position);

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
