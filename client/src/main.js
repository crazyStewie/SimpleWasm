import init, * as wasmlib from './lib/wasm/wasmlib/pkg/wasmlib.js'
import * as THREE from './lib/three.module.js'

async function run() {
    await init();
    //await init();
    main();
}

class Simulation {
    constructor() {
        this.scene = new THREE.Scene();
        this.physics = new wasmlib.PhysicsWorld();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;
        this.camera.position.x = 5;
        this.camera.lookAt(new THREE.Vector3(0,0,0));
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        let geometry = new THREE.CubeGeometry(0.5, 0.3, 0.4);
        let material = new THREE.MeshBasicMaterial({color: 0xeeeeee});

        this.segway_base = new THREE.Mesh(geometry, material);
        this.segway_base.matrixAutoUpdate = false;
        this.scene.add(this.segway_base);

        geometry = new THREE.CubeGeometry(0.1, 1.2, 0.1);
        material = new THREE.MeshBasicMaterial({color: 0xee2222});
        this.segway_handle = new THREE.Mesh(geometry, material);
        this.segway_handle.matrixAutoUpdate = false;
        this.scene.add(this.segway_handle);

        this.left_wheel = new THREE.Object3D();
        this.left_wheel.matrixAutoUpdate = false;
        this.scene.add(this.left_wheel);

        geometry = new THREE.CylinderGeometry(0.25, 0.25, 0.2);
        material = new THREE.MeshBasicMaterial({color: 0x22ee22});
        let left_wheel_mesh = new THREE.Mesh(geometry, material);
        left_wheel_mesh.rotation.z = Math.PI/2
        this.left_wheel.add(left_wheel_mesh);

        this.right_wheel = new THREE.Object3D();
        this.right_wheel.matrixAutoUpdate = false;
        this.scene.add(this.right_wheel);

        geometry = new THREE.CylinderGeometry(0.25, 0.25, 0.2);
        let right_wheel_mesh = new THREE.Mesh(geometry, material);
        right_wheel_mesh.rotation.z = Math.PI/2
        this.right_wheel.add(right_wheel_mesh);

        this.physics.set_max_left_motor_torque(10000);
        this.physics.set_max_right_motor_torque(10000);
    }

    update() {
        this.physics.step();
        let position = this.physics.get_part_position(wasmlib.Parts.BASE);
        let rotation = this.physics.get_part_rotation(wasmlib.Parts.BASE);
        this.segway_base.matrix.compose(position, rotation, new THREE.Vector3(1,1,1));

        position = this.physics.get_part_position(wasmlib.Parts.HANDLE);
        rotation = this.physics.get_part_rotation(wasmlib.Parts.HANDLE);
        this.segway_handle.matrix.compose(position, rotation, new THREE.Vector3(1,1,1));

        position = this.physics.get_part_position(wasmlib.Parts.LEFT_WHEEL);
        rotation = this.physics.get_part_rotation(wasmlib.Parts.LEFT_WHEEL);
        this.left_wheel.matrix.compose(position, rotation, new THREE.Vector3(1,1,1));
        
        position = this.physics.get_part_position(wasmlib.Parts.RIGHT_WHEEL);
        rotation = this.physics.get_part_rotation(wasmlib.Parts.RIGHT_WHEEL);
        this.right_wheel.matrix.compose(position, rotation, new THREE.Vector3(1,1,1));

        position = this.physics.get_part_position(wasmlib.Parts.HANDLE);
        rotation = this.physics.get_part_rotation(wasmlib.Parts.HANDLE);

        let matrix = new THREE.Matrix4().compose(position, rotation, new THREE.Vector3(1,1,1));
        let basis_x = new THREE.Vector3();
        let basis_y = new THREE.Vector3();
        let basis_z = new THREE.Vector3();
        matrix.extractBasis(basis_x, basis_y, basis_z);
        let inclination = - Math.asin(basis_z.y);

        this.physics.set_right_motor_target_speed(100*inclination + 2)
        this.physics.set_left_motor_target_speed(100*inclination)
    }
}



function main() {
    console.log("Main started");
    let simulation = new Simulation();

    function animate () {
        simulation.update();
        simulation.renderer.render(simulation.scene, simulation.camera);
        requestAnimationFrame(animate);
    }

    animate();
}



run();
