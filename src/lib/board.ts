import { Player } from '@lib/player';
import { ShapeType } from '@lib/shapes';
import { Vec2 } from 'raxis-core';

export class Board {
    matrix: number[][];

    readonly bounds: Vec2;

    constructor(size: Vec2) {
        this.matrix = [];

        for (let y = 0; y < size.y; y++) {
            this.matrix[y] = [];

            for (let x = 0; x < size.x; x++) {
                this.matrix[y][x] = 0;
            }
        }

        this.bounds = Vec2.multiplyScalar(size, 30).divideScalar(2);
        console.log(this.bounds.toString());
    }

    update(player: Player) {
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

    incorporate(player: Player) {
        const matrix = player.matrix;
        const position = this.spatialToMatrix(player.center.position);

        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < matrix[y].length; x++) {
                if (matrix[y][x] === ShapeType.None) continue;

                this.matrix[y + position.y][x + position.x] = matrix[y][x];
            }
        }
    }

    collision(player: Player): boolean {
        const position = this.spatialToMatrix(player.center.position);

        const collisionMatrix = new Array(this.matrix.length + 1)
            .fill(0)
            .map(() => new Array(this.matrix[0].length + 2).fill(0));

        for (let y = 0; y < collisionMatrix.length; y++) {
            for (let x = 0; x < collisionMatrix[0].length; x++) {
                if (x === 0 || x === collisionMatrix[0].length - 1) {
                    collisionMatrix[y][x] = 1;
                } else if (y === collisionMatrix.length - 1) {
                    collisionMatrix[y][x] = 1;
                }
            }
        }

        console.log(collisionMatrix);

        // if (position.y - matrix.length / 2 <= -this.matrix.length / 2 - 1) {
        //     player.center.position.y += 30;

        //     return true;
        // }

        return false;
    }
}
