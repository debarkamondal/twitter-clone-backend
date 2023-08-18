import { User } from "@prisma/client";
import JWT from "jsonwebtoken";

const JWTSercret = "AV/2wUATkH/oLCNynL2XgQ==";
export class JWTService {
	public static async generateTokenForUser(user: User) {
		const payload = {
			id: user?.id,
			email: user?.email,
		};
		const token = JWT.sign(payload, JWTSercret);
		return token;
	}
}
