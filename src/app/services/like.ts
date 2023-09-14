import { prismaClient } from "../../clients/db";

export interface likeTweetData {
	likerId: string;
	tweetId: string;
}

export class likeService {
	public static async likeTweet(data: likeTweetData) {
		const { tweet } = await prismaClient.likes.create({
			data: {
				liker: { connect: { id: data.likerId } },
				tweet: { connect: { id: data.tweetId } },
			},
			include: { tweet: true },
		});
		return tweet;
	}
	public static async unlikeTweet(data: likeTweetData) {
		// const likes = await prismaClient.likes.create({
		// 	data: {
		// 		liker: { connect: { id: data.likerId } },
		// 		tweet: { connect: { id: data.tweetId } },
		// 	},
		// 	include: { tweet: true },
		// });
		// console.log(likes);
		const { tweet } = await prismaClient.likes.delete({
			where: {
				tweetId_likerId: { tweetId: data.tweetId, likerId: data.likerId },
			},
			include: { tweet: true },
		});
		return tweet;
	}
	public static async getLikesOfTweet(tweetId: string) {
		const likes = await prismaClient.likes.findMany({
			where: { tweetId },
			include: { liker: true },
		});
		return likes;
	}
}
