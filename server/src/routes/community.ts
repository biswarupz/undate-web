import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign, verify } from "hono/jwt";
import { date, string, z } from "zod";
export const communityRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    CLOUDFLARE_IMGAES_ACCOUNT_ID: string;
    CLOUDFLARE_IMGAES_API_TOKEN: string;
    CLOUDFLARE_IMGAES_POST_URL: string;
  };
}>();
communityRouter.post("/check-name", async (c) => {
  try {
    const body = await c.req.json();
    const name = body.name;
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const checkName = await prisma.community.findFirst({
      where: {
        name: name,
      },
    });
    if (checkName) {
      return c.json({ status: 101 });
    } else {
      return c.json({ status: 102 });
    }
  } catch (error) {
    console.log(error);
  }
});

communityRouter.post("/create", async (c) => {
  try {
    const body = await c.req.json();
    const { token, name, catagory, description } = body;
    if (!token || !name || !catagory || !description) {
      return c.json({ status: 400, message: "Invalid data" });
    }
    const userId = await verify(token, c.env.JWT_SECRET);
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    console.log(name, catagory, description);
    const findUser = await prisma.user.findUnique({
      where: {
        id: userId.id,
      },
    });
    if (!findUser) {
      return c.json({ status: 400, message: "Authentication error" });
    }

    const checkName = await prisma.community.findFirst({
      where: {
        name: name,
      },
    });
    if (checkName) {
      return c.json({
        status: 400,
        message: "Community name is already taken",
      });
    }
    const createCommunity = await prisma.community.create({
      data: {
        creator: { connect: { id: findUser.id } },
        name: name,
        description: description,
        category: catagory,
      },
    });

    if (!createCommunity) {
      return c.json({
        status: 400,
        message: "Failed to create a new community",
      });
    }
    return c.json({
      status: 200,
      message: "Successfully created a new community",
    });
  } catch (error) {
    console.log(error);
  }
});

communityRouter.post("/all/communities", async (c) => {
  try {
    const body = await c.req.json();
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const token = body.token;
    const userId = await verify(token, c.env.JWT_SECRET);
    const findUser = await prisma.user.findUnique({ where: { id: userId.id } });
    if (!findUser) {
      return c.json({ status: 401, message: "Unauthorized" });
    }
    const cursor = body.cursor || null;
    const take = 15;
    const allCommunities = await prisma.community.findMany({
      select: {
        id: true,
        image: true,
        name: true,
        category: true,
        description: true,
        membersCount: true,
      },
      orderBy: {
        membersCount: "asc",
      },
      cursor: cursor ? { id: cursor } : undefined,
      take: take + 1,
    });

    const hasMore = allCommunities.length > take;
    const communities = hasMore ? allCommunities.slice(0, -1) : allCommunities;
    const nextCursor = hasMore
      ? allCommunities[allCommunities.length - 1].id
      : null;

    return c.json({ status: 200, data: communities, nextCursor });
  } catch (error) {
    console.log(error);
    return c.json({ status: 400 });
  }
});
communityRouter.post("/community-data", async (c) => {
  const body = await c.req.json();
  const token = body.token;
  const name = body.name;

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const userId = await verify(token, c.env.JWT_SECRET);
  const findUser = await prisma.user.findUnique({
    where: {
      id: userId.id,
    },
  });

  if (!findUser) {
    return c.json({ status: 401, message: "User not authenticated" });
  }

  const findCommunityData = await prisma.community.findFirst({
    where: {
      name: name,
    },
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      image: true,
      membersCount: true,
      postsCount: true,
    },
  });

  if (!findCommunityData) {
    return c.json({ status: 404, message: "No community found" });
  }

  const checkJoinedStatus = await prisma.communityMembership.findUnique({
    where: {
      userId_communityId: {
        userId: findUser.id,
        communityId: findCommunityData.id,
      },
    },
  });

  if (!checkJoinedStatus) {
    return c.json({
      status: 200,
      data: findCommunityData,
      joined: false,
      currentUser: findUser.username,
    });
  }

  return c.json({
    status: 200,
    data: findCommunityData,
    joined: true,
    currentUser: findUser.username,
  });
});
communityRouter.post("/join-leave-community", async (c) => {
  try {
    const body = await c.req.json();
    const token = body.token;
    const communityName = body.name;

    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const userId = await verify(token, c.env.JWT_SECRET);
    const currentUser = await prisma.user.findUnique({
      where: {
        id: userId.id,
      },
    });

    const community = await prisma.community.findFirst({
      where: {
        name: communityName,
      },
    });

    if (!community) {
      return c.json({ status: 404, error: "Community not found" });
    }

    const isMember = await prisma.communityMembership.findUnique({
      where: {
        userId_communityId: {
          userId: currentUser!.id,
          communityId: community.id,
        },
      },
    });
    console.log(isMember);

    if (!isMember) {
      await prisma.communityMembership.create({
        data: {
          user: { connect: { id: currentUser!.id } },
          community: { connect: { id: community.id } },
        },
      });
      await prisma.community.update({
        where: { id: community.id },
        data: { membersCount: { increment: 1 } },
      });

      return c.json({ status: 200, message: "Joined community successfully" });
    } else {
      await prisma.communityMembership.delete({
        where: {
          userId_communityId: {
            userId: currentUser!.id,
            communityId: community.id,
          },
        },
      });

      await prisma.community.update({
        where: { id: community.id },
        data: { membersCount: { decrement: 1 } },
      });

      return c.json({ status: 200, message: "Left community successfully" });
    }
  } catch (error) {
    console.error(error);
    return c.json({ status: 500, error: "Something went wrong" });
  }
});
