import { Vec2 } from 'raxis-core';

type GlobalCompositeOperation =
    | 'source-over'
    | 'source-in'
    | 'source-out'
    | 'source-atop'
    | 'destination-over'
    | 'destination-in'
    | 'destination-out'
    | 'destination-atop'
    | 'lighter'
    | 'copy'
    | 'xor'
    | 'multiply'
    | 'screen'
    | 'overlay'
    | 'darken'
    | 'lighten'
    | 'color-dodge'
    | 'color-burn'
    | 'hard-light'
    | 'soft-light'
    | 'difference'
    | 'exclusion'
    | 'hue'
    | 'saturation'
    | 'color'
    | 'luminosity';

export abstract class Material2d {
    color: string;
    opacity: number;
    blend: GlobalCompositeOperation;
    visible: boolean;

    constructor(
        color: string,
        opacity: number,
        blend: GlobalCompositeOperation,
        visible: boolean
    ) {
        this.color = color;
        this.opacity = opacity;
        this.blend = blend;
        this.visible = visible;
    }

    abstract render(ctx: CanvasRenderingContext2D, size: Vec2): void;
}

export class EmptyMaterial2d extends Material2d {
    constructor() {
        super('#000000', 0, 'source-over', true);
    }

    render(): void {
        // Do nothing
    }
}

export class SquareMaterial2d extends Material2d {
    constructor(options: {
        color?: string;
        opacity?: number;
        blend?: GlobalCompositeOperation;
        visible?: boolean;
    }) {
        const { color, opacity, blend, visible } = options;
        super(
            color ?? 'red',
            opacity ?? 1,
            blend ?? 'source-over',
            visible ?? true
        );
    }

    render(ctx: CanvasRenderingContext2D, size: Vec2): void {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.globalCompositeOperation = this.blend;
        ctx.fillRect(-size.x / 2, -size.y / 2, size.x, size.y);
    }
}
