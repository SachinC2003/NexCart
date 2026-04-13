import { Router } from "express";
import { addToCart, clearCart, getCart, removeFromCart, updateQuantity } from "../controllers/cart.controller";

const cartRouter = Router();
// addToCart, removeFromCart, updateQuantity, clearCart

cartRouter.post('/addToCart', addToCart)
cartRouter.put('/updateQuantity', updateQuantity)

cartRouter.delete('/removeFromCart', removeFromCart)
cartRouter.delete('/clearCart', clearCart)

cartRouter.get('/', getCart);

export default cartRouter;