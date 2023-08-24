import axios from "axios";
import { prismaClient } from "../../clients/db";
import { JWTService } from "../services/jwt";
import { GraphQLContext } from "../../interfaces";
import { User } from "@prisma/client";

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

const queries = {
	verifyGoogleToken: async (parent: any, { token }: { token: string }) => {
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
	},
	getCurrentUser: async (parent: any, args: any, context: GraphQLContext) => {
		if (!context.user?.id) return null;
		return await prismaClient.user.findUnique({
			where: { id: context.user?.id },
		});
	},
};

const extraResolvers = {
	User: {
		tweets: (parent: User) =>
			prismaClient.tweet.findMany({ where: { author: { id: parent.id } } }),
	},
};

export const resolvers = { queries, extraResolvers };
