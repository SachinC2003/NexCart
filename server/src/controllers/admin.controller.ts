import { AppDataSource } from "../configs/data-sourse";
import { Order } from "../entities/Order.entity";
import { Product } from "../entities/Product.entity";
import { User } from "../entities/User.entity";
import { RefreshToken } from "../entities/RefreshToken.entity";
import { findUserByEmail } from "../repositories/user.Repository";
import { AppError } from "../utils/error";
import { asyncHandler } from "../utils/try_catch";
import { revokeUserSessionStoreEntries } from "../utils/session";

const userRepo = AppDataSource.getRepository(User);
const productRepo = AppDataSource.getRepository(Product);
const orderRepo = AppDataSource.getRepository(Order)

export const getStats = asyncHandler(async (req, res) => {
    const totalusers = await userRepo.count();
    const totalorders = await orderRepo.count();
    const totalrevenue = await orderRepo.createQueryBuilder("order")
                             .select("SUM(order.totalAmount)", "sum")
                             .getRawOne();
    const totalProducts = await productRepo.count();
    const user = await userRepo.find();
    const users = user.filter((u) => u.role === "user");

    const stats = {
        totalUsers: totalusers,
        totalOrders: totalorders,
        totalRevenue: totalrevenue.sum || 0,
        totalProducts: totalProducts,
        users: users
    };
    return res.status(200).json({ message: "Stats retrieved successfully", stats });   
});

export const updateStatus = asyncHandler(async (req, res) => {
    const email = req.body.email

    const user = await findUserByEmail(email);
    if(!user){
        throw new AppError("User not found", 404);
    }

    const nextIsActive = !user.isActive;

    await userRepo.update({ id: user.id }, { isActive: nextIsActive });

    const updatedUser = await findUserByEmail(email);

    if (!updatedUser) {
      throw new AppError("User not found after status update", 404);
    }

    if (!updatedUser.isActive) {
      const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);
      const activeSessions = await refreshTokenRepo.find({
        where: {
          user: { id: updatedUser.id },
          revokedAt: null,
        },
      });

      await Promise.all(
        activeSessions.map((session) => refreshTokenRepo.remove(session))
      );

      revokeUserSessionStoreEntries(updatedUser.id);
    }

    return res.status(200).json({ message: "User status updated successfully", user: updatedUser });
});
