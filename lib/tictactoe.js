class TicTacToe {
    constructor(playerX = 'x', playerY = 'o') {
        this.playerX = playerX
        this.playerY = playerY
        // _currentTurn: true => turno de X, false => turno de Y
        this._currentTurn = true
        this._x = 0
        this._y = 0
        this._turns = 0
    }

    get board() {
        return this._x | this._y
    }

    get currentTurn() {
        return this._currentTurn ? this.playerX : this.playerY
    }

    get enemyTurn() {
        return this._currentTurn ? this.playerY : this.playerX
    }

    static check(state) {
        for (let combo of [7, 56, 73, 84, 146, 273, 292, 448])
            if ((state & combo) === combo)
                return true
        return false
    }

    /**
     * ```js
     * TicTacToe.toBinary(1, 2) // 0b001000000
     * ```
     */
    static toBinary(x = 0, y = 0) {
        if (x < 0 || x > 2 || y < 0 || y > 2) throw new Error('invalid position')
        // Corregido el orden de precedencia: 1 << (x + 3*y)
        return 1 << (x + (3 * y))
    }

    /**
     * @param player `0` is `X`, `1` is `Y`
     * 
     * - `-3` `Game Ended`
     * - `-2` `Invalid (not player's turn)`
     * - `-1` `Invalid Position`
     * - ` 0` `Position Occupied`
     * - ` 1` `Success`
     * @returns {-3|-2|-1|0|1}
     */
    turn(player = 0, x = 0, y) {
        // tablero lleno: 9 bits -> 0b111111111 = 511
        if (this.board === 511) return -3
        let pos = 0
        if (y == null) {
            if (x < 0 || x > 8) return -1
            pos = 1 << x
        } else {
            if (x < 0 || x > 2 || y < 0 || y > 2) return -1
            pos = TicTacToe.toBinary(x, y)
        }
        // Si _currentTurn true => X turn (player 0)
        if ((this._currentTurn ? 0 : 1) !== player) return -2
        if (this.board & pos) return 0
        if (this._currentTurn) this._x |= pos
        else this._y |= pos
        this._currentTurn = !this._currentTurn
        this._turns++
        return 1
    }

    /**
     * @returns {('X'|'Y'|1|2|3|4|5|6|7|8|9)[]}
     */
    static render(boardX = 0, boardY = 0) {
        // Representación limpia del tablero
        const cells = []
        for (let i = 0; i < 9; i++) {
            const mask = 1 << i
            if (boardX & mask) cells.push('X')
            else if (boardY & mask) cells.push('Y')
            else cells.push(i + 1)
        }
        return cells
    }
    
    /**
     * @returns {('X'|'Y'|1|2|3|4|5|6|7|8|9)[]}
     */
    render() {
        return TicTacToe.render(this._x, this._y)
    }

    get winner() {
        const x = TicTacToe.check(this._x)
        const y = TicTacToe.check(this._y)
        return x ? this.playerX : y ? this.playerY : false
    }
}

export default TicTacToe
