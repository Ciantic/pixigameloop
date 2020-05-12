/**
 * @author Jari Otto Oskari Pennanen
 * @license I consider this work in public domain
 *
 * This is just demonstration how to use "Fix your timestep!" by Glenn Fiedler
 *
 * See https://gafferongames.com/post/fix_your_timestep/
 */

const app = new PIXI.Application({
    resizeTo: window,
    antialias: true,
    forceFXAA: true,
    autoDensity: true,
    resolution: window.devicePixelRatio,
    sharedTicker: true,
    sharedLoader: true,
    transparent: true,
});

// The application will create a canvas element for you that you
// can then insert into the DOM.
document.body.appendChild(app.view);

const debugTextElement = new PIXI.Text("", { fill: 0xff0000 });

const ballGraphic = new PIXI.Graphics();
ballGraphic.beginFill(0x000000);
ballGraphic.drawCircle(0, 0, 20);
ballGraphic.endFill();

type State = {
    ball: { x: number; y: number };
};

let currentState: State = {
    ball: {
        x: 0,
        y: 150,
    },
};

function integrate(state: State, t: number, dt: number): State {
    // This function updates the game state, and produces a new state
    //
    // Name "integrate" most likely comes from the fact that you will need some
    // form of numeric integration when things start to get interesting (but not
    // in this example).

    if (state.ball.x > app.screen.width) {
        // This sometimes causes the blending function to make the ball jump
        // from right to left in multiple steps, if you want to fix this it's up
        // to you.
        return {
            ball: {
                x: 0,
                y: state.ball.y,
            },
        };
    }
    let velocity = 500; // pixels per second
    return {
        ball: {
            x: state.ball.x + velocity * (dt / 1000),
            y: state.ball.y,
        },
    };
}

function render(state: State) {
    ballGraphic.position.set(state.ball.x, state.ball.y);
}

// Fix your timestep
let previousState = currentState;
let totalTime = 0; // Total time
const DELTA_TIME = 8; // 8 ms = 125 fps, physics loop
let currentTime = performance.now();
let accumulator = 0.0; // Remaining "frame time" accumulates here
const MAX_FRAME_TIME = 250; // 250 ms = 4 fps
app.ticker.add(() => {
    const newTime = performance.now();
    let frameTime = newTime - currentTime;
    if (frameTime > MAX_FRAME_TIME) frameTime = MAX_FRAME_TIME;
    currentTime = newTime;
    accumulator += frameTime;
    while (accumulator >= DELTA_TIME) {
        previousState = currentState;
        currentState = integrate(currentState, totalTime, DELTA_TIME);
        totalTime += DELTA_TIME;
        accumulator -= DELTA_TIME;
    }

    const alpha = accumulator / DELTA_TIME;

    // Here we blend the states for smoother motion when frames and physics steps don't match
    const renderState: State = {
        ball: {
            x: currentState.ball.x * alpha + previousState.ball.x * (1.0 - alpha),
            y: currentState.ball.y,
        },
    };

    render(renderState); // Try putting "currentState" here and see how the motion becomes jerky

    debugTextElement.text = `
        Demonstration of "Fix your timestep!" by Glenn Fiedler
        FPS: ${Math.round(app.ticker.FPS)}
        accumulator: ${accumulator}
        frame time: ${frameTime}
        time: ${totalTime}
        alpha: ${alpha}`;
});

app.stage.addChild(ballGraphic);
app.stage.addChild(debugTextElement);
