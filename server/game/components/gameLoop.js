// видоизменил код отсюда: https://github.com/tangmi/node-gameloop

function getNano() {
	var hrtime = process.hrtime();
	return (+hrtime[0]) * s2nano + (+hrtime[1]);
}

const s2nano = 1e9;
const nano2s = 1 / s2nano; // avoid a divide later, although maybe not nessecary
const ms2nano = 1e6;

let loopIsActive = false;

/**
 * Create a game loop that will attempt to update at some target `tickLengthMs`.
 *
 * `tickLengthMs` defaults to 30fps (~33.33ms).
 *
 * Internally, the `gameLoop` function created has two mechanisms to update itself.
 * One for coarse-grained updates (with `setTimeout`) and one for fine-grained
 * updates (with `setImmediate`).
 *
 * On each tick, we set a target time for the next tick. We attempt to use the coarse-
 * grained "long wait" to get most of the way to our target tick time, then use the
 * fine-grained wait to wait the remaining time.
 */
export function startGameLoop (update, tickLengthMs = 1000 / 30) {
	loopIsActive = true;

	// expected tick length
	const tickLengthNano = tickLengthMs * ms2nano;

	// We pick the floor of `tickLengthMs - 1` because the `setImmediate` below runs
	// around 16ms later and if our coarse-grained 'long wait' is too long, we tend
	// to miss our target framerate by a little bit
	const longwaitMs = Math.floor(tickLengthMs - 1);
	const longwaitNano = longwaitMs * ms2nano;

	let prev = getNano();
	let target = getNano();

	const gameLoop = function() {

		const now = getNano();

		if (now >= target) {
			const delta = now - prev;

			prev = now;
			target = now + tickLengthNano;

			update(delta * nano2s);
		}

		if (!loopIsActive) {
			return;
		}

		if (target - getNano() > longwaitNano) {
			setTimeout(gameLoop, Math.max(longwaitMs, 16));
		} else {
			setImmediate(gameLoop);
		}
	}

	gameLoop();
};

export function stopGameLoop() {
	loopIsActive = false;
};