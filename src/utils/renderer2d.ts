import { Entity2d, Sprite2d } from './entity2d';
import { EmptyMaterial2d } from './material2d';
import { RenderSystem2d } from './renderSystem2d';
import { Vec2 } from 'raxis-core';

export class Renderer2d<T extends RenderSystem2d> {
    system: T;

    private _update: ((uc?: number, fc?: number) => void) | null = null;

    private _animator: number | null = null;

    private _ups: number;
    private _prev: number;
    private _lag: number;
    private _times: number[];
    private _fps: number;

    private _fc: number;
    private _uc: number;
    private _uArg: any;

    root: Sprite2d<EmptyMaterial2d>;

    constructor(system: T, options?: { ups?: number }) {
        const { ups } = options;
        this.system = system;

        this.root = new Sprite2d(
            new EmptyMaterial2d(),
            new Vec2(0, 0),
            new Vec2(0, 0),
            0
        );

        this._ups = ups ?? 60;
        this._prev = 0;
        this._lag = 0;
        this._times = [];
        this._fps = 0;

        this._fc = 0;
        this._uc = 0;
        this._uArg = null;
    }

    onUpdate(cb: (uc?: number, fc?: number) => void, thisArg?: any): void {
        this._update = cb;
        this._uArg = thisArg ?? cb;
    }

    get ups(): number {
        return this._ups;
    }

    set ups(value: number) {
        this._ups = value;
    }

    get fps(): number {
        return this._fps;
    }

    start(): void {
        if (this._animator !== null) return;

        this._animator = requestAnimationFrame(this.render.bind(this));
    }

    stop(): void {
        if (this._animator === null) return;

        cancelAnimationFrame(this._animator);
        this._animator = null;
    }

    step(delay: number): void {
        this.start();
        setTimeout(() => {
            this.stop();
        }, delay);
    }

    private getLagOffset(timestamp: number): number {
        const frameDuration = 1000 / this._ups;

        const elapsed =
            timestamp - this._prev > 1000
                ? frameDuration
                : timestamp - this._prev;

        this._lag += elapsed;

        while (this._lag >= frameDuration) {
            this.sp(this.root);

            if (this._update) {
                this._update.call(this._uArg, this._uc, this._fc);
                this._uc++;

                this.up(this.root);
            }

            this._lag -= frameDuration;
        }

        this._prev = timestamp;

        return this._lag / frameDuration;
    }

    private sp(s: Entity2d) {
        s._prev.setFrom(s.position);
        s._prevr = s.rotation;

        if (s.children.length < 1) return;

        for (const child of s.children) this.sp(child);
    }

    private up(s: Entity2d) {
        s.position.add(s.velocity);
        s.rotation += s.rotationVelocity;

        if (s.children.length < 1) return;

        for (const child of s.children) this.up(child);
    }

    private render(timestamp?: number): void {
        this._fc++;
        const lagOffset = this.getLagOffset(timestamp ?? 0);
        const now = performance.now();

        while (this._times.length > 0 && this._times[0] <= now - 1000)
            this._times.shift();

        this._times.push(now);
        this._fps = this._times.length;

        this.system.render(this.root, lagOffset);

        this._animator = requestAnimationFrame(this.render.bind(this));
    }
}
