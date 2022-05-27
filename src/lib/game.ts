import { Board } from '@lib/board';
import { Player } from '@lib/player';
import { createQueue, ShapeType } from '@lib/shapes';
import {
    setBoard,
    setHighScore,
    setPause,
    setPlayer,
    setScore,
    StorageFormat,
} from '@lib/storage';
import { Renderer2d } from '@utils/renderer2d';
import { CanvasRenderingSystem2d } from '@utils/renderSystem2d';
import { Vec2 } from 'raxis-core';
import { get, writable, Writable } from 'svelte/store';

export class ClassicGame {
    renderer: Renderer2d<CanvasRenderingSystem2d>;

    score: Writable<number>;
    highScore: Writable<number>;
    pause: Writable<boolean>;

    us: () => void;
    uh: () => void;
    up: () => void;

    board: Board;

    player: Player;

    cQueue: ShapeType[];
    nQueue: ShapeType[];

    needsRestart: boolean = false;

    constructor(target: HTMLElement, storage: StorageFormat) {
        this.score = writable(storage.score);
        this.highScore = writable(storage.highScore);
        this.pause = writable(storage.paused);

        this.us = this.score.subscribe((score) => {
            setScore(score);

            if (score > get(this.highScore)) this.highScore.set(score);
        });
        this.uh = this.highScore.subscribe(setHighScore);
        this.up = this.pause.subscribe(setPause);

        this.renderer = new Renderer2d<CanvasRenderingSystem2d>(
            new CanvasRenderingSystem2d(target, { size: new Vec2(300, 540) }),
            { ups: 60 }
        );

        this.cQueue = [];
        this.nQueue = [];

        if (storage.player) {
            this.player = new Player(
                this,
                storage.player.shape,
                Vec2.fromObject(storage.player),
                {
                    leftKeys: false,
                    rightKeys: false,
                    softDropKeys: false,
                    spinLKeys: false,
                    spinRKeys: false,
                },
                storage.player.matrix
            );
        } else {
            this.player = new Player(
                this,
                this.getNextPiece(),
                new Vec2(0 - 15, 270 - 15)
            );
        }

        this.board = new Board(this.renderer.root, storage.board);

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
                this,
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
        this.pause.set(false);

        this.score.set(0);
        this.board = new Board(this.renderer.root);

        this.renderer.root.children.forEach((c) => c.terminate());
        this.renderer.root.children = [];

        this.cQueue = [];
        this.nQueue = [];

        this.player = new Player(
            this,
            this.getNextPiece(),
            new Vec2(0 - 15, 300 - 15)
        );

        setBoard(this.board);
        setPlayer(this.player);
        setScore(get(this.score));
        setHighScore(get(this.highScore));
        setPause(get(this.pause));
    }

    terminate() {
        this.player.terminate();

        this.us();
        this.uh();
        this.up();
    }
}
