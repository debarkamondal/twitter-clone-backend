import { Tweet } from "@prisma/client";
import { prismaClient } from "../../clients/db";
import { GraphQLContext } from "../../interfaces";

interface CreateTweetData {
	content: string;
	imgUrl?: string;
}

const queries = {
	getAllTweets: () =>
		prismaClient.tweet.findMany({ orderBy: { createdAt: "desc" } }),
};

const mutations = {
	createTweet: async (
		parent: any,
		{ payload }: { payload: CreateTweetData },
		ctx: GraphQLContext
	) => {
		if (!ctx.user?.id) throw new Error("Unauthorized action");
		const tweet = await prismaClient.tweet.create({
			data: {
				content: payload.content,
				imgUrl: payload.imgUrl,
				author: { connect: { id: ctx.user?.id } },
			},
		});
		return tweet;
	},
};

const extraResolvers = {
	Tweet: {
		author: (parent: Tweet) =>
			prismaClient.user.findUnique({ where: { id: parent.authorId } }),
	},
};

export const resolvers = { mutations, extraResolvers, queries };
