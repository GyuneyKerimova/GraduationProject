const Router = require("express");
const router = new Router();
const usersController = require('../controllers/usersController')
const checkRole = require("../middleware/checkRoleMiddleware");
const {body} = require('express-validator')

router.post("/registration", body('email').isEmail(), body("password").isLength({min: 3, max: 32}), usersController.registration);
router.post("/login", usersController.login);
router.post("/logout", usersController.logout);
router.post("/profile:id", usersController.getProfile);
router.put("/level", usersController.updateLevel);
router.put("/score", usersController.updateScore);
router.put("/setting", checkRole('ADMIN'), usersController.updateSetting);
router.get("/activate/:link", usersController.activate);
router.get("/refresh", usersController.refresh);
router.get("/setting", usersController.getSetting);

module.exports = router;
