import * as three from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;

const width = window.innerWidth;
const height = window.innerHeight;

const renderer = new three.WebGLRenderer({
    canvas
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(width, height);

const scene = new three.Scene();

const camera = new three.PerspectiveCamera(45, width / height);

const orbit_controls = new OrbitControls(camera, canvas);

{
    const map_size = 256;
    const map_max_height = 600;
    const map = [...new Array(map_size)].map((_) => new Float64Array(map_size));

    camera.position.set(0, map_max_height / 2, 300);
    orbit_controls.target = new three.Vector3(0, map_max_height / 2, 0);

    const divide = (x: number, y: number, size: number, z: [number, number, number, number]) => {
        if (size === 1) {
            map[x][y] = (z[0] + z[1] + z[2] + z[3]) / 4;
        } else {
            const mid = (z[0] + z[1] + z[2] + z[3]) / 4 + ((Math.random() - 0.5) * size) / map_size;

            const top = (z[0] + z[1]) / 2;
            const bottom = (z[2] + z[3]) / 2;
            const left = (z[0] + z[2]) / 2;
            const right = (z[1] + z[3]) / 2;

            size /= 2;

            divide(x, y, size, [z[0], top, left, mid]);
            divide(x + size, y, size, [top, z[1], mid, right]);
            divide(x, y + size, size, [left, mid, z[2], bottom]);
            divide(x + size, y + size, size, [mid, right, bottom, z[3]]);
        }
    };

    divide(0, 0, map_size, [0.5, 0.5, 0.5, 0.5]);

    const material = new three.LineBasicMaterial({ color: 0x0000ff });

    for (let i = 0; i < map_size; i++) {
        const p1: three.Vector3[] = [];
        const p2: three.Vector3[] = [];
        for (let j = 0; j < map_size; j++) {
            p1.push(
                new three.Vector3(i - map_size / 2, map[i][j] * map_max_height, j - map_size / 2)
            );
            p2.push(
                new three.Vector3(j - map_size / 2, map[j][i] * map_max_height, i - map_size / 2)
            );
        }

        const g1 = new three.BufferGeometry().setFromPoints(p1);
        const g2 = new three.BufferGeometry().setFromPoints(p2);
        scene.add(new three.Line(g1, material), new three.Line(g2, material));
    }
}

const stats = Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0px';
document.body.appendChild(stats.domElement);

const tick = () => {
    renderer.render(scene, camera);
    stats.update();
    requestAnimationFrame(tick);
};

tick();
