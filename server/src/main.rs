use rocket;
use rocket_contrib;

fn main() {
    rocket::ignite().mount("/", rocket_contrib::serve::StaticFiles::from("../client")).launch();
}
