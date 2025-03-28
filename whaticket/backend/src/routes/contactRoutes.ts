import express from "express";

import * as ContactController from "../controllers/ContactController";
import * as ImportPhoneContactsController
  from "../controllers/ImportPhoneContactsController";
import isAuth from "../middleware/isAuth";
import routes from "./contactListRoutes";
import uploadConfig from "../config/upload";
import multer from "multer";

const contactRoutes = express.Router();
const upload = multer(uploadConfig);

contactRoutes.post(
  "/contacts/import",
  isAuth,
  ImportPhoneContactsController.store
);

routes.post(
  "/contacts/upload",
  isAuth,
  upload.array("file"),
  ContactController.upload
);

contactRoutes.get("/contacts", isAuth, ContactController.index);

contactRoutes.get("/contacts/list", isAuth, ContactController.list);

contactRoutes.get("/contacts/:contactId", isAuth, ContactController.show);

contactRoutes.post("/contacts/findOrCreate", isAuth, ContactController.findOrCreate);

contactRoutes.post("/contacts", isAuth, ContactController.store);

contactRoutes.put("/contacts/:contactId", isAuth, ContactController.update);

contactRoutes.delete("/contacts/:contactId", isAuth, ContactController.remove);

contactRoutes.delete("/contacts", isAuth, ContactController.removeAll);

contactRoutes.get("/contact", isAuth, ContactController.getContactVcard);

export default contactRoutes;
