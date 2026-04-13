import { Router } from "express";
import { getProducts } from "../controllers/geast.controller";
import { getProduct } from "../controllers/product.controller";

const geastRouter = Router()

geastRouter.get('/products', getProducts);
geastRouter.get('/:id', getProduct)
export default geastRouter;
