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
        this.camera.position.z = 2;
        this.camera.position.x = 2;
        this.camera.position.y = 4;
        this.camera.lookAt(new THREE.Vector3(0,0,0));
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        let geometry = new THREE.ConeGeometry(0.4, 1.2, 16);
        let material = new THREE.MeshBasicMaterial({color: 0xeeeeee});

        this.segway_base = new THREE.Mesh(geometry, material);
        this.segway_base.matrixAutoUpdate = false;
        this.scene.add(this.segway_base);

        geometry = new THREE.SphereGeometry(0.3, 16, 8);
        material = new THREE.MeshBasicMaterial({color: 0x2222ee});
        let head = new THREE.Mesh(geometry, material);
        head.position.y = 0.6;
        this.segway_base.add(head);

        this.left_wheel = new THREE.Object3D();
        this.left_wheel.matrixAutoUpdate = false;
        this.scene.add(this.left_wheel);

        geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 64);
        material = new THREE.MeshBasicMaterial({color: 0x22ee22});
        let left_wheel_mesh = new THREE.Mesh(geometry, material);
        left_wheel_mesh.rotation.z = Math.PI/2
        this.left_wheel.add(left_wheel_mesh);

        this.right_wheel = new THREE.Object3D();
        this.right_wheel.matrixAutoUpdate = false;
        this.scene.add(this.right_wheel);

        geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 64);
        let right_wheel_mesh = new THREE.Mesh(geometry, material);
        right_wheel_mesh.rotation.z = Math.PI/2
        this.right_wheel.add(right_wheel_mesh);

        material = new THREE.MeshBasicMaterial({color : 0xeeeeee})
        geometry = new THREE.CubeGeometry(0.3, 0.1, 0.1);
        let wheel_decoration_left = new THREE.Mesh(geometry, material);
        wheel_decoration_left.position.y = -0.15
        left_wheel_mesh.add(wheel_decoration_left);

        let wheel_decoration_right = new THREE.Mesh(geometry, material);
        wheel_decoration_right.position.y = 0.15
        right_wheel_mesh.add(wheel_decoration_right);
        
        this.physics.set_max_left_motor_torque(50);
        this.physics.set_max_right_motor_torque(50);

        this.scene.add(new THREE.GridHelper(100,100));
    }

    update() {
        this.physics.step();
        let position = this.physics.get_part_position(wasmlib.Parts.BASE);
        let rotation = this.physics.get_part_rotation(wasmlib.Parts.BASE);
        this.segway_base.matrix.compose(position, rotation, new THREE.Vector3(1,1,1));

        this.camera.lookAt(position);

        position = this.physics.get_part_position(wasmlib.Parts.LEFT_WHEEL);
        rotation = this.physics.get_part_rotation(wasmlib.Parts.LEFT_WHEEL);
        this.left_wheel.matrix.compose(position, rotation, new THREE.Vector3(1,1,1));
        
        position = this.physics.get_part_position(wasmlib.Parts.RIGHT_WHEEL);
        rotation = this.physics.get_part_rotation(wasmlib.Parts.RIGHT_WHEEL);
        this.right_wheel.matrix.compose(position, rotation, new THREE.Vector3(1,1,1));

        this.physics.set_left_motor_target_speed(2);
        this.physics.set_right_motor_target_speed(1);
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
