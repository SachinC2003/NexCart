import { Router } from "express";
import { addReview, getProductReviews, removeReview } from "../controllers/review.controller";

const reviewRouter = Router()

reviewRouter.post('/', addReview)
reviewRouter.delete('/:id', removeReview)
reviewRouter.get('/:productId', getProductReviews)

export default reviewRouter;