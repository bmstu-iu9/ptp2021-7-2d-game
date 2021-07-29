import { ServerScene } from './serverScene.js';

export function makeConfig(io, roomID) {
    const gravity = {x: 0, y: 1000000};
    const fps = 60;
    const config = {
        width: 1920,
        height: 1080,
        scenes: [new ServerScene(io, roomID, gravity, fps)],
        fps: 60
    };
    return config;
}