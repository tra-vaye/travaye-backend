import jwt from "jsonwebtoken";
// This is a middleware that verifies that any request is allowed on the server
// If you are not allowed It rejects your request
//When sending a request you need to add your token to the request authorization
// For Example `Authorization`: 'Bearer {Your token}'
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const isCustomAuth = token.length < 500;

    let decodedData;
    if (token && isCustomAuth) {
      decodedData = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decodedData?.id;
    } else {
      decodedData = jwt.decode(token);
      req.userId = decodedData?.sub;
    }
    next();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
export default auth;
