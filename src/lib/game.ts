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

    constructor(target: HTMLElement) {
        this.score = writable(0);
        this.highScore = writable(0);
        this.pause = writable(false);

        this.renderer = new Renderer2d<CanvasRenderingSystem2d>(
            new CanvasRenderingSystem2d(target, { size: new Vec2(300, 540) }),
            { ups: 60 }
        );

        this.player = new Player(
            this.renderer.root,
            ShapeType.IPiece,
            new Vec2(0 - 15, 270 - 15)
        );

        this.board = new Board(new Vec2(10, 18));

        this.renderer.onUpdate(this.update, this);

        this.renderer.start();
    }

    update(clock: number) {
        if (get(this.pause)) return;

        this.player.update(this.board, clock);
        this.board.update(this.player, clock);

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
            new Vec2(0 - 15, 300 - 15)
        );
    }
}
