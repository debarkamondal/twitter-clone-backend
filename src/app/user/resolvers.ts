import { GraphQLContext } from "../../interfaces";
import { User } from "@prisma/client";
import { UserService } from "../services/user";
import { TweetService } from "../services/tweet";
import { prismaClient } from "../../clients/db";
import { redisClient } from "../../clients/redis";

const queries = {
	verifyGoogleToken: async (parent: any, { token }: { token: string }) => {
		const newToken = UserService.verifyGoogleAuthToken(token);
		return newToken;
	},
	getCurrentUser: async (parent: any, args: any, context: GraphQLContext) => {
		if (!context.user?.id) return null;
		return await UserService.getUserById(context.user.id);
	},

	getUserById: async (
		parent: any,
		{ id }: { id: string },
		context: GraphQLContext
	) => {
		const cachedValue = await redisClient.get(`USER-${id}`);
		if (cachedValue) return JSON.parse(cachedValue);
		const user = await UserService.getUserById(id);
		await redisClient.set(`USER-${id}`, JSON.stringify(user));
	},
};

const mutations = {
	followUser: async (
		parent: any,
		{ to }: { to: string },
		ctx: GraphQLContext
	) => {
		if (!ctx.user || !ctx.user.id) throw new Error("Unauthenticated");
		await UserService.followUser(ctx.user.id, to);
		return true;
	},
	unfollowUser: async (
		parent: any,
		{ to }: { to: string },
		ctx: GraphQLContext
	) => {
		if (!ctx.user || !ctx.user.id) throw new Error("Unauthenticated");
		await UserService.unfollowUser(ctx.user.id, to);
		return true;
	},
};

const extraResolvers = {
	User: {
		tweets: (parent: User) => TweetService.allTweetsByUser(parent.id),
		followers: async (parent: User) => {
			const result = await prismaClient.follows.findMany({
				where: { following: { id: parent.id } },
				include: { follower: true },
			});
			return result.map((e) => e.follower);
		},
		following: async (parent: User) => {
			const result = await prismaClient.follows.findMany({
				where: { follower: { id: parent.id } },
				include: { following: true },
			});
			return result.map((e) => e.following);
		},
	},
};

export const resolvers = { queries, extraResolvers, mutations };
