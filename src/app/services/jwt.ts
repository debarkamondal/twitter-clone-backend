import { User } from "@prisma/client";
import JWT from "jsonwebtoken";
import { JWTUser } from "../../interfaces";

const JWTSercret = "AV/2wUATkH/oLCNynL2XgQ==";
export class JWTService {
	public static async generateTokenForUser(user: User) {
		const payload: JWTUser = {
			id: user?.id,
			email: user?.email,
		};
		const token = JWT.sign(payload, JWTSercret);
		return token;
	}
	public static async decodeToken(token: string) {
		try {
			return JWT.verify(token, JWTSercret) as JWTUser;
		} catch (error) {
			return null;
		}
	}
}
