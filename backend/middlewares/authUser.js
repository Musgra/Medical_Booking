import jwt from "jsonwebtoken";

//user authentication middleware

// Lấy token từ header request
// Giải mã token
// Lấy userId từ token
// Lấy user từ database
// Lưu user vào request
// Gọi next()

const authUser = async (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token) {
      return res.json({
        success: false,
        message: "Not Authorized, Login Again",
      });
    }
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);

    req.body.userId = token_decode.id;

    next();
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export default authUser;
