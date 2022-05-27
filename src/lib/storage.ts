import { Board } from '@lib/board';
import { Player } from '@lib/player';
import { ShapeType } from '@lib/shapes';
import MANIFEST from '../../manifest.json';

export interface OldStorageFormat {
    _player: {
        shape: ShapeType[][];
        start_x: number;
        x: number;
        y: number;
    };

    _hscore: number;
    _end: false;
    _score: number;
    _arena: ShapeType[][];
}

export interface StorageFormat {
    converted_from_1_11_1: boolean;
    highScore: number;

    player: {
        shape: ShapeType;
        matrix: ShapeType[][];
        x: number;
        y: number;
    } | null;

    score: number;
    paused: boolean;

    board: ShapeType[][] | null;
}

export function convertToNewFormat() {
    if (typeof localStorage === 'undefined') return;
    if (JSON.parse(localStorage.getItem('converted_from_1_11_1'))) return;

    const hs = localStorage.getItem('_hscore') ?? '0';

    localStorage.clear();

    localStorage.setItem('converted_from_1_11_1', 'true');
    localStorage.setItem('player', '');
    localStorage.setItem('score', '0');
    localStorage.setItem('highScore', hs.toString());
    localStorage.setItem('board', '[[]]');
}

export function getStorage(): StorageFormat {
    if (typeof localStorage === 'undefined') return null;

    const storage: StorageFormat = {
        converted_from_1_11_1: JSON.parse(
            localStorage.getItem('converted_from_1_11_1') ?? 'false'
        ),
        highScore: parseInt(localStorage.getItem('highScore') ?? '0') || 0,

        player: JSON.parse(localStorage.getItem('player') ?? 'null'),
        score: parseInt(localStorage.getItem('score') ?? '0') || 0,
        paused: JSON.parse(localStorage.getItem('paused') ?? 'false'),
        board: JSON.parse(localStorage.getItem('board') ?? 'null'),
    };

    return storage;
}

export function setPlayer(p: Player) {
    if (typeof localStorage === 'undefined') return;

    localStorage.setItem('player', JSON.stringify(p.playerData()));
}

export function setScore(s: number) {
    if (typeof localStorage === 'undefined') return;

    localStorage.setItem('score', s.toString());
}

export function setHighScore(hs: number) {
    if (typeof localStorage === 'undefined') return;

    localStorage.setItem('highScore', hs.toString());
}

export function setPause(p: boolean) {
    if (typeof localStorage === 'undefined') return;

    localStorage.setItem('paused', p.toString());
}

export function setBoard(b: Board) {
    if (typeof localStorage === 'undefined') return;

    localStorage.setItem('board', JSON.stringify(b.matrix));
}
