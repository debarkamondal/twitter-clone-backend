import { initServer } from "./app/index";
import * as dotenv from "dotenv";

const env = dotenv.config();

const init = async () => {
	const app = await initServer();
	app.listen(8000, () => console.log("server started on port 8000"));
};

init();
