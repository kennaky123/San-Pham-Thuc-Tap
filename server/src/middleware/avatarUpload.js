import { upload } from "../config/upload.js";

export function uploadAvatarMiddleware(request, response, next) {
  upload.single("avatar")(request, response, (error) => {
    if (error) {
      return next(error);
    }
    next();
  });
}
