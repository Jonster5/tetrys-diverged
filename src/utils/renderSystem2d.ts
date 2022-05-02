import { Entity2d } from './entity2d';
import { Vec2 } from 'raxis-core';

export abstract class RenderSystem2d {
    abstract render(stage: Entity2d, lagOffset: number): void;

    abstract get width(): number;
    abstract get height(): number;
}

export class CanvasRenderingSystem2d extends RenderSystem2d {
    element: HTMLCanvasElement;
    context: CanvasRenderingContext2D;

    private _dpr: number;
    private _width: number;
    private _height: number;

    constructor(target: HTMLElement, options?: { size?: Vec2 }) {
        super();

        this.element = document.createElement('canvas');

        this.element.setAttribute('style', `width: 100%; height: 100%;`);

        target.appendChild(this.element);

        this.context = this.element.getContext(
            '2d'
        ) as CanvasRenderingContext2D;

        this._dpr = window.devicePixelRatio ?? 1;

        const rect = this.element.getBoundingClientRect();

        this.element.width = (options.size.x ?? rect.width) * this._dpr;
        this.element.height = (options.size.y ?? rect.height) * this._dpr;

        this._width = this.element.width;
        this._height = this.element.height;

        this.context.transform(
            this._dpr,
            0,
            0,
            -this._dpr,
            this.element.width / 2,
            this.element.height / 2
        );
    }

    render(stage: Entity2d, lagOffset: number): void {
        this.context.save();

        // clear the canvas
        this.context.clearRect(
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height
        );

        // render the children
        const dimensions = new Vec2(this.width, this.height).divideScalar(2);

        for (const child of stage.children) {
            child.render(this.context, dimensions, lagOffset);
        }

        this.context.restore();
    }

    get width(): number {
        return this._width / this._dpr;
    }

    get height(): number {
        return this._height / this._dpr;
    }
}
