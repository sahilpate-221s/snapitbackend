import jwt from 'jsonwebtoken';

const generateToken = (id,res) => {
  try {
    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: "2d",
    });

    res.cookie("token",token,
      {
          maxAge:3*60*60*24*1000,
          httpOnly:true,
          sameSite:"Strict",
      }
  )
  } catch (error) {
    console.error("Error generating token:", error);
    throw new Error("Token generation failed");
  }
};

export default generateToken;
