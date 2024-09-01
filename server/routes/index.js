const Router = require("express");
const router = new Router()
const usersRouter = require('./usersRouter')
const resourcesRouter = require('./resourcesRouter')
const sectionsRouter = require('./sectionsRouter')

router.use('/users', usersRouter)
router.use('/sections', sectionsRouter)
router.use('/resources', resourcesRouter)



module.exports = router