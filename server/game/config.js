import { ServerScene } from './serverScene.js';

export function makeConfig(io, room) {
    const gravity = {x: 0, y: 1000000};
    const fps = 60;
    const config = {
        width: 1920,
        height: 1080,
        scenes: [new ServerScene(io, room, gravity, fps)],
        fps: 60
    };
    return config;
}