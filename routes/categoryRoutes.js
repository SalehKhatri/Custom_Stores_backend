// routes/categoryRoutes.js
const express = require("express");
const {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
} = require("../controllers/categoryController");
const { protect, admin } = require("../middlewares/authMiddleware");
const upload = require("../config/multerConfig");

const router = express.Router();

router.post("/",protect, admin, upload.single("image"), createCategory);
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.put("/:id", protect, admin, upload.single("image"), updateCategory);
router.delete("/:id", protect, admin, deleteCategory);

module.exports = router;
