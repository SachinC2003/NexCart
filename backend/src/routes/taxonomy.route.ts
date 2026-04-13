import express from "express";
import { createCategory, createSubCategory, createType, getTaxonomy } from "../controllers/taxonomy.controller";

const taxonomyRouter = express.Router();

taxonomyRouter.get("/", getTaxonomy);
taxonomyRouter.post("/category", createCategory);
taxonomyRouter.post("/sub-category", createSubCategory);
taxonomyRouter.post("/type", createType);

taxonomyRouter.get("/getTaxonomy", getTaxonomy);

export default taxonomyRouter;
