export type ID = number;
export type ISODateString = string;
export type DecimalValue = number | string;

export enum OrderStatus {
  PLACED = 0,
  CANCELLED = 1,
  DELIVERED = 2,
}

export interface RefreshToken {
  id: ID;
  token: string;
  user: User;
  createdAt: ISODateString;
}

export interface ProductType {
  id: ID;
  name: string;
  categories?: Category[];
  products?: Product[];
}

export interface Category {
  id: ID;
  name: string;
  type: ProductType;
  subCategories?: SubCategory[];
  products?: Product[];
}

export interface SubCategory {
  id: ID;
  name: string;
  category: Category;
  products?: Product[];
}

export interface User {
  id: ID;
  name: string;
  email: string;
  password?: string;
  role: string;
  phoneNumber: string | null;
  isActive: boolean;
  location?: string | null;
  orders?: Order[];
  cart?: Cart | null;
  refreshTokens?: RefreshToken[];
  products?: Product[];
  reviews?: Review[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface Product {
  id: ID;
  name: string;
  description: string;
  image: string;
  brandName: string;
  purchaseCount: number | null;
  category: Category;
  subCategory: SubCategory;
  type: ProductType;
  price: number;
  originalPrice: number | null;
  stock: number;
  avgRating: DecimalValue;
  offer: number | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  deleteAt: ISODateString | null;
  orderItems?: OrderItem[];
  cartItems?: CartItem[];
  user?: User;
  reviews?: Review[];
}

export interface Cart {
  id: ID;
  cartItems?: CartItem[];
  user: User;
}

export interface CartItem {
  id: ID;
  cart: Cart;
  product: Product;
  quantity: number;
}

export interface Order {
  id: ID;
  totalAmount: DecimalValue;
  status: OrderStatus | string;
  paymentMethod: string;
  location?: string | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  orderItems?: OrderItem[];
  user: User;
}

export interface OrderItem {
  id: ID;
  order: Order;
  product: Product;
  quantity: number;
  subTotal: DecimalValue;
}

export interface Review {
  id: ID;
  rating: number;
  comment: string | null;
  createdAt: ISODateString;
  user: User;
  product: Product;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
}

export interface ProductResponse {
  product: Product;
  message?: string;
}

export interface CartResponse {
  message: string;
  cart: Cart;
}

export interface OrdersResponse {
  message: string;
  orders: Order[];
}

export interface TaxonomyResponse {
  message: string;
  taxonomy: ProductType[];
}

export interface StatsResponse {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  users: User[];
}

export interface LocalCartItem{
   productId : number;
   quantity : number
}

export interface ProductFIlterData{
   type?: string;
   category?: string;
   subCategory?: string;
   searchTerm?: string;
   minPrice?: number;
   maxPrice?: number
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface QuickStatCard {
  label: string;
  value: string;
  detail: string;
}

export interface ProductDetailsViewModel {
  id?: number;
  name?: string;
  description?: string;
  brandName?: string;
  category?: string;
  subCategory?: string;
  type?: string;
  image?: string;
  price?: number;
  originalPrice?: number | null;
  offer?: number | string | null;
  stock?: number | string;
  rating?: number;
  sold?: number | string;
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
  reviews?: Review[];
}

export interface ProductReviewView {
  rating: number;
  comment: string;
  user: string;
}

export interface EditableProductModel {
  id?: number;
  name?: string;
  description?: string;
  brandName?: string;
  type?: string;
  category?: string;
  subCategory?: string;
  image?: string;
  price?: number;
  originalPrice?: number | null;
  offer?: number | string | null;
  stock?: number;
}

export interface StatsPageUser extends User {
  status?: string;
  blocked?: boolean;
}
