const Router = require("express");
const router = new Router();
const resourcesController = require('../controllers/resourcesController')
const checkRole = require("../middleware/checkRoleMiddleware");

router.get("/", resourcesController.getAll);
router.get('/:id', resourcesController.getOne);
router.post("/", checkRole('ADMIN'), resourcesController.create);
router.put("/", checkRole('ADMIN'), resourcesController.update);
router.put("/img", checkRole('ADMIN'), resourcesController.updateImage);
router.put("/order", checkRole('ADMIN'), resourcesController.updateOrder);
router.delete("/:id", checkRole('ADMIN'), resourcesController.delete);
router.put("/data", checkRole('ADMIN'), resourcesController.updateData);


module.exports = router;
