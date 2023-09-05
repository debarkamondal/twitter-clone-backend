import { prismaClient } from "../../clients/db";

export interface CreateTweetData {
	content: string;
	imgUrl?: string;
	userId: string;
}
export class TweetService {
	public static createTweet(data: CreateTweetData) {
		return prismaClient.tweet.create({
			data: {
				content: data.content,
				imgUrl: data.imgUrl,
				author: { connect: { id: data.userId } },
			},
		});
	}
	public static getAllTweets() {
		return prismaClient.tweet.findMany({ orderBy: { createdAt: "desc" } });
	}
	public static allTweetsByUser(id: string) {
		return prismaClient.tweet.findMany({ where: { author: { id } } });
	}
}
