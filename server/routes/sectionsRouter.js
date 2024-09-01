const Router = require("express");
const router = new Router();
const sectionsController = require('../controllers/sectionsController');
const checkRole = require("../middleware/checkRoleMiddleware");

router.get("/", sectionsController.getAll);
router.get("/:id", sectionsController.getOne);
router.post("/", checkRole('ADMIN'), sectionsController.create);
router.put("/", checkRole('ADMIN'), sectionsController.update);
router.delete("/:id", checkRole('ADMIN'), sectionsController.delete);
router.put("/order", checkRole('ADMIN'), sectionsController.updateOrder);
router.put("/data", checkRole('ADMIN'), sectionsController.updateData);
router.post("/data", checkRole('ADMIN'), sectionsController.createData);
router.delete("/data/:id", checkRole('ADMIN'), sectionsController.deleteData);

module.exports = router;