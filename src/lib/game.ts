import { Board } from '@lib/board';
import { Player } from '@lib/player';
import { createQueue, ShapeType } from '@lib/shapes';
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

    cQueue: ShapeType[];
    nQueue: ShapeType[];

    needsRestart: boolean = false;

    constructor(target: HTMLElement) {
        this.score = writable(0);
        this.highScore = writable(0);
        this.pause = writable(false);

        this.renderer = new Renderer2d<CanvasRenderingSystem2d>(
            new CanvasRenderingSystem2d(target, { size: new Vec2(300, 540) }),
            { ups: 60 }
        );

        this.cQueue = [];
        this.nQueue = [];

        this.player = new Player(
            this.renderer.root,
            this.getNextPiece(),
            new Vec2(0 - 15, 270 - 15)
        );

        this.board = new Board(new Vec2(10, 18), this.renderer.root);

        this.renderer.onUpdate(this.update, this);

        this.renderer.start();
    }

    update(clock: number) {
        if (get(this.pause)) return;

        if (this.needsRestart) this.restart();

        const [pScoreChange] = this.player.update(this.board, clock);
        const [needsRespawn, bScoreChange, gameOver] = this.board.update(
            this.player,
            clock
        );

        if (gameOver) {
            this.pause.set(true);
            this.needsRestart = true;
        }

        if (pScoreChange + bScoreChange > 0)
            this.score.update((s) => s + pScoreChange + bScoreChange);

        if (needsRespawn) {
            const [prevState] = this.player.terminate();

            this.player = new Player(
                this.renderer.root,
                this.getNextPiece(),
                new Vec2(0 - 15, 300 - 15),
                prevState
            );
        }
    }

    getNextPiece(): ShapeType {
        if (this.cQueue.length > 0) return this.cQueue.shift();

        this.cQueue = this.nQueue;
        this.nQueue = createQueue();

        return this.getNextPiece();
    }

    UIProps() {
        return {
            score: this.score,
            highscore: this.highScore,
            pause: this.pause,
        };
    }

    restart() {
        this.needsRestart = false;

        this.score.set(0);
        this.board = new Board(new Vec2(10, 18), this.renderer.root);

        this.renderer.root.children.forEach((c) => c.terminate());
        this.renderer.root.children = [];

        this.cQueue = [];
        this.nQueue = [];

        this.player = new Player(
            this.renderer.root,
            this.getNextPiece(),
            new Vec2(0 - 15, 300 - 15)
        );
    }
}
