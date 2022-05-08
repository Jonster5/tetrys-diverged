import { Material2d } from './material2d';
import { Vec2 } from 'raxis-core';

export abstract class Entity2d {
    size: Vec2;
    position: Vec2;
    rotation: number;

    velocity: Vec2;
    rotationVelocity: number;

    _prev: Vec2;
    _prevr: number;

    abstract material: Material2d;

    private _parent: Entity2d | null;
    children: Entity2d[];

    constructor(position: Vec2, size: Vec2, rotation: number) {
        this.size = size.clone();
        this.position = position.clone();
        this.rotation = rotation;

        this.velocity = new Vec2(0, 0);
        this.rotationVelocity = 0;

        this._prev = this.position.clone();
        this._prevr = this.rotation;

        this._parent = null;
        this.children = [];
    }

    get parent(): Entity2d | null {
        return this._parent;
    }

    set parent(parent: Entity2d | null) {
        if (this.parent) this.parent.remove(this);

        this._parent = parent;

        if (this._parent) this.parent.add(this);
    }

    abstract render(
        ctx: CanvasRenderingContext2D,
        dim: Vec2,
        lagOffset: number
    ): void;

    add(...entities: Entity2d[]): void {
        for (const entity of entities) {
            if (entity._parent) entity._parent.remove(entity);

            entity._parent = this;
            this.children.push(entity);
        }
    }

    remove(...entities: Entity2d[]): void {
        for (const entity of entities) {
            if (entity._parent !== this)
                throw new Error('Entity is not a child of this entity');

            entity._parent = null;
            this.children.splice(this.children.indexOf(entity), 1);
        }
    }

    setPosition(position: Vec2): void {
        this.position.setFrom(position);
        this._prev.setFrom(position);
    }

    setRotation(rotation: number): void {
        this.rotation = rotation;
        this._prevr = rotation;
    }

    globalPosition(): Vec2 {
        if (this._parent) {
            return Vec2.add(this._parent.globalPosition(), this.position);
        } else {
            return this.position.clone();
        }
    }

    halfSize(): Vec2 {
        return Vec2.divideScalar(this.size, 2);
    }

    terminate() {
        if (this._parent) this._parent.remove(this);
    }
}

export class Sprite2d<T extends Material2d> extends Entity2d {
    material: T;

    constructor(material: T, position: Vec2, size: Vec2, rotation?: number) {
        super(position, size, rotation ?? 0);

        this.material = material;
    }

    render(ctx: CanvasRenderingContext2D, dim: Vec2, lagOffset: number): void {
        // return if not visible
        if (!this.material.visible) return;

        // return if sprite position is outside of dimensions
        const gp = this.globalPosition();
        const hs = this.halfSize();

        // if (
        //     gp.x + hs.x < -dim.x ||
        //     gp.x - hs.x > dim.x ||
        //     gp.y + hs.y < -dim.y ||
        //     gp.y - hs.y > dim.y
        // )
        //     return;

        // save context
        ctx.save();

        // set context to sprite position
        const ipos = Vec2.lerp(this._prev, this.position, lagOffset);
        ctx.translate(ipos.x, ipos.y);

        // set context to sprite rotation
        const irot = (this.rotation - this._prevr) * lagOffset + this._prevr;
        ctx.rotate(irot);

        // render sprite
        this.material.render(ctx, this.size);

        // render children
        for (const child of this.children) {
            child.render(ctx, dim, lagOffset);
        }

        // restore context
        ctx.restore();
    }
}
