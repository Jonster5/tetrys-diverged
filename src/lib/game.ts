import { Board } from '@lib/board';
import { Player } from '@lib/player';
import { ShapeType } from '@lib/shapes';
import { Sprite2d } from '@utils/entity2d';
import { SquareMaterial2d } from '@utils/material2d';
import { Renderer2d } from '@utils/renderer2d';
import { CanvasRenderingSystem2d } from '@utils/renderSystem2d';
import { Vec2 } from 'raxis-core';
import { get, writable, Writable } from 'svelte/store';

export class ClassicGame {
    renderer: Renderer2d<CanvasRenderingSystem2d>;

    score: Writable<number>;
    highScore: Writable<number>;
    pause: Writable<boolean>;

    board: Board;

    player: Player;

    counter: number;

    constructor(target: HTMLElement) {
        this.score = writable(0);
        this.highScore = writable(0);
        this.pause = writable(false);

        this.renderer = new Renderer2d<CanvasRenderingSystem2d>(
            new CanvasRenderingSystem2d(target, { size: new Vec2(300, 540) }),
            { ups: 30 }
        );

        this.player = new Player(
            this.renderer.root,
            ShapeType.TPiece,
            new Vec2(0 - 15, 270 - 15)
        );

        this.board = new Board(new Vec2(10, 18));

        this.counter = 0;

        this.renderer.onUpdate(this.update.bind(this));

        this.renderer.start();

        window.addEventListener('keydown', (e) => {
            if (e.key === ' ') {
                this.player.center.setRotation(
                    this.player.center.rotation + Math.PI / 2
                );
            }
        });

        this.board.incorporate(this.player);

        this.board.collision(this.player);
    }

    update(): void {
        if (get(this.pause)) return;

        this.counter++;
        if (this.counter >= 12) {
            this.counter = 0;
            this.player.center.position.y -= 30;
        }

        // if (this.board.collision(this.player) === true) {
        // this.pause.set(true);
        // }
    }

    UIProps() {
        return {
            score: this.score,
            highscore: this.highScore,
            pause: this.pause,
        };
    }

    restart() {
        this.score.set(0);
        this.board = new Board(new Vec2(10, 18));

        this.renderer.root.children = [];

        this.player = new Player(
            this.renderer.root,
            ShapeType.TPiece,
            new Vec2(0 - 15, 270 - 15)
        );
    }
}
