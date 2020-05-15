mod utils;

use wasm_bindgen::prelude::*;
use nphysics3d;
use ncollide3d;
use nalgebra as na;
use na::RealField;
use ncollide3d::transformation::ToTriMesh;
use nphysics3d::object::BodyPart;
// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub enum Parts{
    BASE = 0,
    LEFT_WHEEL = 1,
    RIGHT_WHEEL = 2,
}

#[wasm_bindgen(raw_module = "../../../three.module.js")]
extern "C" {
    #[wasm_bindgen(js_namespace = THREE)]
    pub type Vector3;

    #[wasm_bindgen(constructor)]
    fn new(x: f64, y: f64, z: f64) -> Vector3;

    #[wasm_bindgen(js_namespace = THREE)]
    pub type Quaternion;

    #[wasm_bindgen(constructor)]
    fn new(x: f64, y: f64, z: f64, w: f64) -> Quaternion;
}

struct SegwayParts {
    segway_handle : nphysics3d::object::DefaultBodyHandle,
}


#[wasm_bindgen]
pub struct PhysicsWorld {
    mechanical_world : nphysics3d::world::DefaultMechanicalWorld<f64>,
    geometric_world : nphysics3d::world::DefaultGeometricalWorld<f64>,
    
    bodies : nphysics3d::object::DefaultBodySet<f64>,
    colliders : nphysics3d::object::DefaultColliderSet<f64>,
    joint_constraints : nphysics3d::joint::DefaultJointConstraintSet<f64>,
    force_generators : nphysics3d::force_generator::DefaultForceGeneratorSet<f64>,

    segway : SegwayParts,
}

#[wasm_bindgen]
impl PhysicsWorld {
    #[wasm_bindgen(constructor)]
    pub fn new() -> PhysicsWorld {
        utils::set_panic_hook();
        let mechanical_world = nphysics3d::world::MechanicalWorld::new(na::Vector3::new(0.0, -9.81, 0.0));
        let geometric_world = nphysics3d::world::GeometricalWorld::new();
        let mut bodies = nphysics3d::object::DefaultBodySet::new();
        let mut colliders = nphysics3d::object::DefaultColliderSet::new();
        let joint_constraints = nphysics3d::joint::DefaultJointConstraintSet::new();
        let force_generators = nphysics3d::force_generator::DefaultForceGeneratorSet::new();

        let ground_body = nphysics3d::object::RigidBodyDesc::new()
            .status(nphysics3d::object::BodyStatus::Static)
            .build();
        let ground = bodies.insert(ground_body);
        let ground_shape = ncollide3d::shape::ShapeHandle::new(ncollide3d::shape::Plane::new(na::Vector3::y_axis()));
        let ground_collider = nphysics3d::object::ColliderDesc::new(ground_shape)
            .build(nphysics3d::object::BodyPartHandle(ground, 0));
        colliders.insert(ground_collider);

        let free_joint = nphysics3d::joint::FreeJoint::new(na::Isometry3::new(na::Vector3::y()*4.0, na::zero()));
        let mut segway_desc = nphysics3d::object::MultibodyDesc::new(free_joint)
            //.parent_shift(na::Vector3::y()*0.9)
            .name("BodyBase".to_owned());
            //.body_shift(na::Vector3::y()*0.9);
        
        let mut left_axis = nphysics3d::joint::RevoluteJoint::new(na::Vector3::x_axis(), 0.0);
        left_axis.enable_angular_motor();
        left_axis.disable_max_angle();
        left_axis.disable_min_angle();
        let left_wheel_desc = segway_desc.add_child(left_axis);
        left_wheel_desc.set_name("LeftWheel".to_owned());
        left_wheel_desc.set_body_shift(na::Vector3::x()*(-0.5));
        left_wheel_desc.set_parent_shift(na::Vector3::y()*-0.6);
        
        let mut right_axis = nphysics3d::joint::RevoluteJoint::new(na::Vector3::x_axis(), 0.0);
        right_axis.enable_angular_motor();
        right_axis.disable_max_angle();
        right_axis.disable_min_angle();
        let right_wheel_desc = segway_desc.add_child(right_axis);
        right_wheel_desc.set_name("RightWheel".to_owned());
        right_wheel_desc.set_body_shift(na::Vector3::x()*(0.5));
        right_wheel_desc.set_parent_shift(na::Vector3::y()*-0.6);

        let segway_handle = bodies.insert(segway_desc.build());
        let base = nphysics3d::object::BodyPartHandle(segway_handle, Parts::BASE as usize);
        let left_wheel = nphysics3d::object::BodyPartHandle(segway_handle, Parts::LEFT_WHEEL as usize);
        let right_wheel = nphysics3d::object::BodyPartHandle(segway_handle, Parts::RIGHT_WHEEL as usize);
        
        let body_base_shape =ncollide3d::shape::ShapeHandle::new(
            ncollide3d::shape::ConvexHull::try_from_points(
                &ncollide3d::shape::Cone::new(0.6, 0.4).to_trimesh(16).coords
            ).unwrap()
        );
        let body_head_shape = ncollide3d::shape::ShapeHandle::new(ncollide3d::shape::Ball::new(0.3));

        let body_shape = ncollide3d::shape::ShapeHandle::new(
            ncollide3d::shape::Compound::new(vec![
                (na::Isometry3::new(na::zero(), na::zero()), body_base_shape),
                (na::Isometry3::new(na::Vector3::y()*0.6, na::zero()), body_head_shape),
            ])
        );
        let body_collider = nphysics3d::object::ColliderDesc::new(body_shape)
            //.translation(na::Vector3::y()*0.6)
            .density(1.0)
            .build(base);
        colliders.insert(body_collider);
        //let body_handle_shape = ncollide3d::shape::ShapeHandle::new(ncollide3d::shape::Cuboid::new(na::Vector3::new(0.08, 1.18, 0.08)/2.0));
        //let body_handle_collider = nphysics3d::object::ColliderDesc::new(body_handle_shape)
        //    .density(1.0)
        //    //.translation(na::Vector3::new(0.0, 0.6, 0.2))
        //    .build(handle);
        //colliders.insert(body_handle_collider);
        let wheel_shape = ncollide3d::shape::ShapeHandle::new(
            ncollide3d::shape::ConvexHull::try_from_points(
                &ncollide3d::shape::Cylinder::new(0.09, 0.29).to_trimesh(128).coords
            ).unwrap()
        );
        let wheel_collider_desc = nphysics3d::object::ColliderDesc::new(wheel_shape)
            .density(1.0)
            .rotation(na::Vector3::z() * f64::frac_pi_2());

        let left_wheel_collider = wheel_collider_desc.build(left_wheel);
        colliders.insert(left_wheel_collider);

        let right_wheel_collider = wheel_collider_desc.build(right_wheel);
        colliders.insert(right_wheel_collider);

        let segway = SegwayParts {
            segway_handle,
        };

        PhysicsWorld {
            mechanical_world,
            geometric_world,
            bodies,
            colliders,
            joint_constraints,
            force_generators,
            segway,
        }
    }

    pub fn get_part_position(&self, part: Parts) -> Vector3 {
        let segway = self.bodies.multibody(self.segway.segway_handle).unwrap();
        let translation = segway.link(part as usize).unwrap().position().translation.vector;

        Vector3::new(translation.x, translation.y, translation.z)
    }

    pub fn get_part_rotation(&self, part: Parts) -> Quaternion {
        let segway = self.bodies.multibody(self.segway.segway_handle).unwrap();
        let rotation = segway.link(part as usize).unwrap().position().rotation;

        Quaternion::new(rotation.vector().x, rotation.vector().y, rotation.vector().z, rotation.w)
    }

    pub fn step(&mut self) {
        self.mechanical_world.step(&mut self.geometric_world, &mut self.bodies, &mut self.colliders, &mut self.joint_constraints, &mut self.force_generators);
    }

    pub fn set_timestep(&mut self, timestep: f64) {
        self.mechanical_world.set_timestep(timestep);
    }

    pub fn set_max_left_motor_torque(&mut self, torque: f64) {
        let segway = self.bodies.multibody_mut(self.segway.segway_handle).unwrap();
        let left_axis = segway.link_mut(Parts::LEFT_WHEEL as usize).unwrap().joint_mut();
        match (left_axis).downcast_mut::< nphysics3d::joint::RevoluteJoint<f64>>() {
            Some(as_revolute) => {
                as_revolute.set_max_angular_motor_torque(torque);
            }
            None => {
                panic!("not a valid joint");
            }
        }
    }

    pub fn set_max_right_motor_torque(&mut self, torque: f64) {
        let segway = self.bodies.multibody_mut(self.segway.segway_handle).unwrap();
        let right_axis = segway.link_mut(Parts::RIGHT_WHEEL as usize).unwrap().joint_mut();
        match (right_axis).downcast_mut::< nphysics3d::joint::RevoluteJoint<f64>>() {
            Some(as_revolute) => {
                as_revolute.set_max_angular_motor_torque(torque);
            }
            None => {
                panic!("not a valid joint");
            }
        }
    }

    pub fn set_left_motor_target_speed(&mut self, speed: f64) {
        let segway = self.bodies.multibody_mut(self.segway.segway_handle).unwrap();
        let left_axis = segway.link_mut(Parts::LEFT_WHEEL as usize).unwrap().joint_mut();
        match (left_axis).downcast_mut::< nphysics3d::joint::RevoluteJoint<f64>>() {
            Some(as_revolute) => {
                as_revolute.set_desired_angular_motor_velocity(speed);
            }
            None => {
                panic!("not a valid joint");
            }
        }
    }

    pub fn set_right_motor_target_speed(&mut self, speed: f64) {
        let segway = self.bodies.multibody_mut(self.segway.segway_handle).unwrap();
        let right_axis = segway.link_mut(Parts::RIGHT_WHEEL as usize).unwrap().joint_mut();
        match (right_axis).downcast_mut::< nphysics3d::joint::RevoluteJoint<f64>>() {
            Some(as_revolute) => {
                as_revolute.set_desired_angular_motor_velocity(speed);
            }
            None => {
                panic!("not a valid joint");
            }
        }
    }
}
