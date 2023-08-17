import { initServer } from "./app/index";

const init = async () => {
	const app = await initServer();
	app.listen(8000, () => console.log("server started on port 8000"));
};

init();
