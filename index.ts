const GRAVITY = 30
const DRAG = 0
const TICK_RATE = 30

interface Bounds {
    width: number
    height: number
}


class Ball {
    radius = 10
    direction = 0
    speed = { x: 0, y: 0 }

    constructor(public x, public y, private bounds: Bounds) { }

    move(...players: Player[]) {
        this.speed.y -= -GRAVITY / TICK_RATE

        this.x += this.speed.x
        this.y += this.speed.y

        // Check for collision with players
        for (const player of players) {
            if (player.colliding(this)) {
                // console.log(this.x, this.y)
                this.speed.y = -this.speed.y
                this.x += this.speed.x
                this.y += this.speed.y
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = 'green'
        ctx.fill()
        // ctx.stroke()
        ctx.closePath()
    }
}

class Player {
    MOVE_SPEED = 20
    JUMP_SPEED = 200

    x = 0
    y = 0
    radius = 40
    speed = { x: 0, y: 0 }

    constructor(private nth: number, private bounds: Bounds) {
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
        if (this.speed.y === 0) {
            this.speed.y -= (this.JUMP_SPEED / TICK_RATE)
            this.y += this.speed.y
        }
    }

    move() {
        this.speed.y = this.speed.y + (GRAVITY / TICK_RATE)

        this.y += this.speed.y

        if (this.y >= this.bounds.height - this.radius) {
            this.y = this.bounds.height - this.radius
            this.speed.y = 0
        }
    }

    colliding(ball: Ball) {
        const angle = Math.atan2(this.y - ball.y, this.x - ball.x)
        const distance = Math.sqrt((this.x - ball.x) * 2 + (this.y - ball.y) * 2)

        const collision = distance < this.radius + ball.radius

        if (collision) {
            // console.log(distance)
            // console.log(angle)
        }

        return collision

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