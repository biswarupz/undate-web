import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { verify } from "hono/jwt";

export const userFeedRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    CLOUDFLARE_IMGAES_ACCOUNT_ID: string;
    CLOUDFLARE_IMGAES_API_TOKEN: string;
    CLOUDFLARE_IMGAES_POST_URL: string;
  };
}>();
userFeedRouter.post("/posts", async (c) => {
  try {
    const body = await c.req.json();
    const token = body.token;
    const userId = await verify(token, c.env.JWT_SECRET);

    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const findUser = await prisma.user.findUnique({ where: { id: userId.id } });

    if (!findUser) {
      return c.json({ status: 401, message: "Unauthorized Main User" });
    }

    const cursor = body.cursor || null;
    const take = 10;

    const followingCount = await prisma.following.count({
      where: {
        followerId: findUser.id,
      },
    });

    const UserFeedPosts = await prisma.post.findMany({
      where: {
        OR: [
          {
            creator: {
              followers: {
                some: {
                  followerId: findUser.id,
                },
              },
            },
            anonymity: false,
          },
          {
            community: {
              members: {
                some: {
                  userId: findUser.id,
                },
              },
            },
          },
          {
            creatorId: findUser.id,
          },
          {
            community: {
              posts: {
                some: {
                  anonymity: true,
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        image: true,
        content: true,
        likesCount: true,
        anonymity: true,
        creator: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },
        community: {
          select: {
            name: true,
            image: true,
          },
        },
        createdAt: true,
        commentsCount: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      cursor: cursor ? { id: cursor } : undefined,
      take: take + 1,
    });

    const randomPosts =
      followingCount < 10
        ? await prisma.post.findMany({
            where: {
              NOT: {
                id: {
                  in: UserFeedPosts.map((post) => post.id),
                },
              },
            },
            select: {
              id: true,
              image: true,
              content: true,
              likesCount: true,
              anonymity: true,
              creator: {
                select: {
                  id: true,
                  username: true,
                  image: true,
                },
              },
              community: {
                select: {
                  name: true,
                  image: true,
                },
              },
              createdAt: true,
              commentsCount: true,
            },
            take: 10,
            orderBy: {
              createdAt: "desc",
            },
          })
        : [];
    const allPosts = [...UserFeedPosts, ...randomPosts];

    const hasMore = allPosts.length > take;
    const feedPosts = hasMore ? allPosts.slice(0, -1) : allPosts;
    const nextCursor = hasMore ? allPosts[allPosts.length - 1].id : null;

    const postsWithLikedState = await Promise.all(
      feedPosts.map(async (post) => {
        const isLiked = await prisma.like.findUnique({
          where: {
            userId_postId: {
              userId: findUser.id,
              postId: post.id,
            },
          },
        });

        const creatorDetails = post.anonymity
          ? {
              username: "unknown",
              image: null,
            }
          : {
              username: post.creator.username,
              image: post.creator.image,
            };

        return {
          ...post,
          creator: {
            ...post.creator,
            ...creatorDetails,
          },
          isLiked: isLiked ? true : false,
        };
      })
    );

    const suggestedPosts = [
      ...postsWithLikedState.filter((post) => post.likesCount > 10).slice(0, 1),
      ...postsWithLikedState
        .filter((post) => post.commentsCount > 10)
        .slice(0, 1),
      ...postsWithLikedState.slice(0, 10),
    ];

    const sortedSuggestedPosts = suggestedPosts.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ status: 200, data: sortedSuggestedPosts, nextCursor });
  } catch (error) {
    console.log(error);
    return c.json({ status: 400 });
  }
});
