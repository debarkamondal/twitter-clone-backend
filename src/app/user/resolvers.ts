import { GraphQLContext } from "../../interfaces";
import { User } from "@prisma/client";
import { UserService } from "../services/user";
import { TweetService } from "../services/tweet";

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
	) => await UserService.getUserById(id),
};

const extraResolvers = {
	User: {
		tweets: (parent: User) => TweetService.allTweetsByUser(parent.id),
	},
};

export const resolvers = { queries, extraResolvers };
