import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { startOfWeek, startOfMonth } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "alltime";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;
    const skip = (page - 1) * limit;

    let users = [];

    if (period === "alltime") {
      users = await db.user.findMany({
        where: { role: "USER" },
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          xp: true,
          level: true,
          currentStreak: true,
        },
        orderBy: { xp: "desc" },
        skip,
        take: limit,
      });
    } else {
      const startDate = period === "weekly" ? startOfWeek(new Date()) : startOfMonth(new Date());

      const activities = await db.userActivity.groupBy({
        by: ["userId"],
        where: {
          createdAt: { gte: startDate },
        },
        _sum: {
          xpEarned: true,
        },
        orderBy: {
          _sum: { xpEarned: "desc" },
        },
        skip,
        take: limit,
      });

      const userIds = activities.map((a) => a.userId);
      
      const usersData = await db.user.findMany({
        where: { id: { in: userIds }, role: "USER" },
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          level: true,
          currentStreak: true,
        }
      });

      // Map back to ordered and structured array
      users = activities.map((activity) => {
        const user = usersData.find((u) => u.id === activity.userId);
        return {
          id: user?.id,
          name: user?.name,
          username: user?.username,
          image: user?.image,
          xp: activity._sum.xpEarned || 0,
          level: user?.level || 1,
          currentStreak: user?.currentStreak || 0,
        };
      }).filter((u) => u.id); // remove nulls if any
    }

    return NextResponse.json({
      success: true,
      data: users,
      meta: {
        page,
        period,
      }
    });

  } catch (error) {
    console.error("Leaderboard API Error:", error);
    return NextResponse.json(
      { success: false, error: "Sunucu hatası oluştu" },
      { status: 500 }
    );
  }
}
