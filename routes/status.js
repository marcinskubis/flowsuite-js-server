const express = require("express");
const {
  createStatus,
  getStatuses,
  getStatusById,
  updateStatusById,
  deleteStatusById,
} = require("../controllers/statusController");
const verifyToken = require("../middleware/tokenAuth");

const { checkProjectAdminOrOwner } = require("../middleware/roleAuth");

const router = express.Router();

router.post("/", verifyToken, checkProjectAdminOrOwner, createStatus);

router.get("/", verifyToken, getStatuses);

router.get("/:id", verifyToken, getStatusById);

router.put("/:id", verifyToken, checkProjectAdminOrOwner, updateStatusById);

router.delete("/:id", verifyToken, checkProjectAdminOrOwner, deleteStatusById);

module.exports = router;
