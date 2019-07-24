import { cleanEnv, str, port } from 'envalid';

export default function validateEnv() {
	cleanEnv(process.env, {
		MONGO_PASS: str(),
		MONGO_PATH: str(),
		MONGO_USER: str(),
		PORT: port()
	});
}
