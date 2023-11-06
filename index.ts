// https://flatredball.com/documentation/tutorials/math/circle-collision/#:~:text=Remember%20from%20the%20previous%20example,the%20image%20on%20the%20right.

const GRAVITY = 20
const DRAG = 0
const TICK_RATE = 60

interface Position {
    x: number
    y: number
}

interface Bounds {
    width: number
    height: number
}

interface Vector {
    x: number,
    y: number
}

class Ball implements Position {
    radius = 10
    vector: Vector = { x: 0, y: 0 }

    constructor(public x: number, public y: number, private bounds: Bounds) { }

    move(...players: Player[]) {
        this.vector.y -= -GRAVITY / TICK_RATE

        this.x += this.vector.x
        this.y += this.vector.y

        // Check for collision with players
        for (const player of players) {
            const collision = player.collision(this)

            if (collision) {
                const [vector, position] = collision

                this.vector = vector

                // this.x += vector.x
                // this.y += vector.y

                this.x -= position.x
                this.y -= position.y
            }

        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = 'green'
        ctx.fill()
        ctx.closePath()
    }
}

class Player implements Position {
    MOVE_SPEED = 10
    JUMP_SPEED = 300

    x = 0
    y = 0
    radius = 40
    vector: Vector = { x: 0, y: 0 }

    constructor(nth: number, private bounds: Bounds) {
        this.x = (this.bounds.width / 2 * nth) + this.bounds.width / 4
        this.y = this.bounds.height - this.radius
    }

    left() {
        const x = this.MOVE_SPEED

        this.x -= x
    }

    right() {
        const x = this.MOVE_SPEED

        this.x += x
    }

    jump() {
        if (this.vector.y === 0) {
            this.vector.y -= (this.JUMP_SPEED / TICK_RATE)
            this.y += this.vector.y
        }
    }

    move() {
        this.vector.y = this.vector.y + (GRAVITY / TICK_RATE)

        this.y += this.vector.y

        if (this.y >= this.bounds.height - this.radius) {
            this.y = this.bounds.height - this.radius
            this.vector.y = 0
        }
    }

    collision(ball: Ball): undefined | [Vector, Position] {
        const distance = Math.sqrt((this.x - ball.x) ** 2 + (this.y - ball.y) ** 2)
        const collision = distance < (this.radius + ball.radius)

        if (collision) {
            const angle = Math.atan2(this.y - ball.y, this.x - ball.x)

            const velocity = ball.vector.x + ball.vector.y

            const vector = {
                x: Math.cos(angle) * -velocity,
                y: Math.sin(angle) * -velocity
            }

            const position = {
                x: Math.cos(angle) * (ball.radius + this.radius),
                y: Math.sin(angle) * (ball.radius + this.radius),
            }

            return [vector, position]
        }

        return undefined
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI, true)
        ctx.lineTo(this.x - this.radius, this.y)
        ctx.fillStyle = 'red'
        ctx.fill()
        ctx.closePath()
    }
}

export const game = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')

    if (!ctx) {
        throw new Error('No context')
    }

    const width = 800
    const height = 600

    const ball = new Ball(200, 200, { width, height })

    const playerA = new Player(0, { width, height })
    const playerB = new Player(1, { width, height })

    const draw = () => {
        ctx.clearRect(0, 0, width, height)

        playerA.move()
        playerB.move()
        ball.move(playerA, playerB)
        ball.draw(ctx)
        playerA.draw(ctx)
        playerB.draw(ctx)
    }

    const loop = () => {
        draw()
        setTimeout(loop, 1000 / TICK_RATE)
    }

    const left = () => playerA.left()
    const right = () => playerA.right()
    const jump = () => playerA.jump()

    loop()

    return {
        left, right, jump
    }
}