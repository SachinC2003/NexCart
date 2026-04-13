import express from 'express';
import { addProduct, bulkDeleteProducts, deleteProduct, editProduct, getFilteredProducts, getProducts, getProduct, updateStock } from '../controllers/product.controller';
import taxonomyRouter from './taxonomy.route';
import { upload } from '../middleware/upload.middleware';
import { getStats, updateStatus } from '../controllers/admin.controller';
import { adminOrders } from '../controllers/order.controller';
import { validate } from '../middleware/validate.middleware';
import { updateUserStatusSchema } from '../validation/admin.validation';

const adminRouter = express.Router();

adminRouter.post('/addProduct', upload.single('image'), addProduct);
adminRouter.put('/:id', upload.single('image'), editProduct);
adminRouter.patch('/updateStock/:id', updateStock);
adminRouter.delete('/:id', deleteProduct);
adminRouter.delete('/bulkDelete', bulkDeleteProducts);
adminRouter.use('/taxonomy', taxonomyRouter);

adminRouter.get('/filter', getFilteredProducts);
adminRouter.get('/stats', getStats);
adminRouter.get('/orders', adminOrders)
adminRouter.get('/', getProducts);
adminRouter.get('/:id', getProduct)

adminRouter.post('/update-status', validate(updateUserStatusSchema), updateStatus);
export default adminRouter;
