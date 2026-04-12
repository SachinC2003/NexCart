import { AppDataSource } from "../configs/data-sourse";
import { User } from "../entities/User.entity";

const userRepo = AppDataSource.getRepository(User);

export const findUserByEmail = async (email: string) => {
  return userRepo.findOne({
    where: { email }
  });
};

export const findUserById = async (id: number) => {
  return userRepo.findOne({
    where: { id }
  });
};

export const saveUser = async (user: User, password: string) => {
  user.password = password;
  return userRepo.save(user);
};

export const createUser = async (email: string, password: string, name: string, phoneNumber: string, role: string) => {
  const newUser = userRepo.create({
    email,
    password,
    name,
    phoneNumber,
    role
  });

  return userRepo.save(newUser);
};