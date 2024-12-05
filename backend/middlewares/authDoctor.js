import jwt from "jsonwebtoken";

//doctor authentication middleware

// Lấy token từ header request
// Giải mã token
// Lấy doctorId từ token
// Lấy doctor từ database
// Lưu doctor vào request
// Gọi next()

const authDoctor = async (req, res, next) => {
  try {
    const { dtoken } = req.headers;
    if (!dtoken) {
      return res.json({
        success: false,
        message: "Not Authorized, Login Again",
      });
    }
    const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET);

    req.body.docId = token_decode.id;

    next();
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export default authDoctor;
