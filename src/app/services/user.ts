import axios from "axios";
import { prismaClient } from "../../clients/db";
import { JWTService } from "./jwt";

interface GoogleAuthTokenResult {
	iss: string;
	azp: string;
	aud: string;
	sub: string;
	email: string;
	email_verified: string;
	nbf: string;
	name: string;
	picture: string;
	given_name: string;
	family_name: string;
	locale: string;
	iat: string;
	exp: string;
	jti: string;
	alg: string;
	kid: string;
	typ: string;
}

export class UserService {
	public static async verifyGoogleAuthToken(token: string) {
		const googleOauthURL = new URL("https://oauth2.googleapis.com/tokeninfo");
		googleOauthURL.searchParams.set("id_token", token);

		const { data } = await axios.get<GoogleAuthTokenResult>(
			googleOauthURL.toString(),
			{
				responseType: "json",
			}
		);
		const user = await prismaClient.user.findUnique({
			where: { email: data.email },
		});
		if (!user) {
			await prismaClient.user.create({
				data: {
					email: data.email,
					firstName: data.given_name,
					lastName: data.family_name,
					profileImgUrl: data.picture,
				},
			});
		}
		const userInDb = await prismaClient.user.findUnique({
			where: { email: data.email },
		});
		if (!userInDb)
			throw new Error("User with this email was not found in database");

		const userToken = JWTService.generateTokenForUser(userInDb);
		return userToken;
	}
	public static getUserById(id: string) {
		return prismaClient.user.findUnique({
			where: { id },
		});
	}
	public static followUser(from: string, to: string) {
		return prismaClient.follows.create({
			data: {
				follower: { connect: { id: from } },
				following: { connect: { id: to } },
			},
		});
	}
	public static unfollowUser(from: string, to: string) {
		return prismaClient.follows.delete({
			where: { followerId_followingId: { followerId: from, followingId: to } },
		});
	}
}
