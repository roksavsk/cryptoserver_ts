import { Router } from "express";
import currencies from "../controllers/currency.controller";

const router = Router();
// Create a new Currency
router.post("/", currencies.create);
// Retrieve all Currencies
router.get("/", currencies.findAll);
// Retrieve top Currencies
router.get("/recent", currencies.recent);
// Retrieve Currency by name
router.get("/:name", currencies.findOne);
// Retrieve info about Currency by name
router.get("/info/:name/:market/:date", currencies.getInfo);
// Update a Currency with id
router.put("/:id", currencies.update);
// Delete a Currency with id
router.delete("/:id", currencies.delete);
// Delete all Currencies
router.delete("/", currencies.deleteAll);

export default router;