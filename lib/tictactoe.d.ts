export declare class TicTacToe {
    /* X PlayerName */
    playerX: string;
    /* Y PlayerName */
    playerY: string;
    /* true => turno de X, false => turno de Y */
    _currentTurn: boolean;
    _x: number;
    _y: number;
    _turns: number;
    constructor(playerX: string, playerY: string);
    get board(): number;
    turn(player: number, index: number): -3 | -2 | -1 | 0 | 1;
    turn(player: number, x: number, y: number): -3 | -2 | -1 | 0 | 1;
    render(): (('X' | 'Y') | number)[];
    static render(boardX?: number, boardY?: number): (('X' | 'Y') | number)[];
    get winner(): string | false;
}
