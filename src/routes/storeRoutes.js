const storeController = require("../app/controllers/storeController");
const router = require("express").Router();

// Middlewares
const authRequired = require("../app/middleware/validateToken");

router.get("/store/counts", authRequired, storeController.getStoreStatusCounts);
router.delete("/stores/:id", authRequired, storeController.deleteStore);
router.post("/store/upload", authRequired, storeController.uploadFile);
router.get("/stores/:id", authRequired, storeController.getStoreById);
router.put("/stores/:id", authRequired, storeController.updateStore);
router.post("/stores", authRequired, storeController.createStore);
router.get("/stores", authRequired, storeController.getStores);

module.exports = router;
