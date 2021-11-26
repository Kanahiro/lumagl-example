import { AnimationLoop, Model } from '@luma.gl/engine';
import { Buffer, clear } from '@luma.gl/webgl';

const loop = new AnimationLoop({
    // @ts-ignore
    onInitialize: function ({ gl }) {
        const positions = [0.0, 0.6, 0.6, -0.6, -0.6, -0.6];
        const positionBuffer = new Buffer(gl, new Float32Array(positions));
        const model = new Model(gl, {
            vs: `
            uniform float time;
            attribute vec2 position;
            varying vec2 fPosition;

            mat2 rot(float r) {
                float cr = cos(r);
                float sr = sin(r);
                return mat2(
                    cr, sr,
                    -sr, cr
                );
            }
            void main() {
                fPosition = position;
                gl_Position = vec4(rot(time * 0.001) * position, 0.0, 1.0);
            }
            `,
            fs: `
            varying vec2 fPosition;
            void main() {
                gl_FragColor = vec4(fPosition, length(fPosition), 1.0);
            }
            `,
            attributes: {
                position: positionBuffer,
            },
            vertexCount: positions.length / 2,
        });
        return { model };
    },
    // @ts-ignore
    onRender({ gl, model }) {
        clear(gl, { color: [0, 0, 0, 1] });

        const time = performance.now();
        model.setUniforms({ time });

        model.draw();
    },
});

loop.start();
