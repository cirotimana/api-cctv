const router = require('express').Router();

const incidentTypeRoutes = require('./incidentTypeRoutes');
const conclusionRoutes = require('./conclusionRoutes');
const permissionRoutes = require('./permissionRoutes');
const dvrStatusRoutes = require('./dvrStatusRoutes');
const priorityRoutes = require('./priorityRoutes');
const companyRoutes = require('./companyRoutes');
const statusRoutes = require('./statusRoutes');
const ticketRoutes = require('./ticketRoutes');
const moduleRoutes = require('./moduleRoutes');
const storeRoutes = require('./storeRoutes');
const eventRoutes = require('./eventRoutes');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const roleRoutes = require('./roleRoutes');
const attachmentRoutes = require('./attachmentRoutes');

router.use(incidentTypeRoutes);
router.use(conclusionRoutes);
router.use(permissionRoutes);
router.use(dvrStatusRoutes);
router.use(priorityRoutes);
router.use(companyRoutes);
router.use(statusRoutes);
router.use(moduleRoutes);
router.use(ticketRoutes);
router.use(storeRoutes);
router.use(eventRoutes);
router.use(authRoutes);
router.use(userRoutes);
router.use(roleRoutes);
router.use(attachmentRoutes);

module.exports = router;
