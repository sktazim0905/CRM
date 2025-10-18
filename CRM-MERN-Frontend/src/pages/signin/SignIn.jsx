import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { toast } from "react-toastify";
import AxiosService from "../../components/utils/ApiService";
import { useNavigate, Link } from "react-router-dom";
import signincss from "./signin.module.css";
import Spinner from "../../components/utils/Sipnners";
import { FiEye, FiEyeOff } from "react-icons/fi";
// ✅ Import Logo
import logo from "../../public/logo.jfif"; // <-- ADD YOUR LOGO PATH HERE

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const res = await AxiosService.post(`/user/login`, { email, password });

      if (res.status === 200) {
        sessionStorage.setItem("token", res.data.token);
        sessionStorage.setItem("userData", JSON.stringify(res.data.userData));

        if (res.data.userData.status === "InActive") {
          navigate("/");
          toast.error("You are not Allow to login");
        } else if (res.data.userData.role === "admin") {
          toast.success(res.data.message);
          navigate("/dashboard");
        } else {
          toast.success(res.data.message);
          navigate("/userdash");
        }
      }
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ✅ Watermark Background */}
      <div
        style={{
          backgroundImage: `url(${logo})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "300px",
          opacity: "0.1",
          position: "fixed",
          top: 0,
          left: 0,
          height: "100%",
          width: "100%",
          zIndex: -1,
        }}
      ></div>

      <div className={signincss.Signin}>
        <div className={signincss.circles}>
          <div className={signincss.circle1}></div>
          <div className={signincss.circle2}></div>
        </div>

        <div className={signincss.wrapper}>
          {/* ✅ Logo at Top */}
          <div style={{ textAlign: "center", marginBottom: "10px" }}>
            <img src={logo} alt="Logo" width="100" />
          </div>

          <form className={signincss.loginform} onSubmit={handleLogin}>
            <h2 className={signincss.heading}>Login</h2>
            <div className={signincss.inputfield}>
              <input
                type="email"
                required
                onChange={(e) => setEmail(e.target.value)}
              />
              <label>Enter your email</label>
            </div>
            <div className={signincss.inputfield}>
              <div className="d-flex ">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                />
                <label>Enter your password</label>
                {showPassword ? (
                  <FiEyeOff
                    className={signincss.passwordIcon}
                    onClick={() => setShowPassword(!showPassword)}
                  />
                ) : (
                  <FiEye
                    className={signincss.passwordIcon}
                    onClick={() => setShowPassword(!showPassword)}
                  />
                )}
              </div>
            </div>
            <div className={signincss.forget}>
              <label>
                <input type="checkbox" className={signincss.remember} />
                <p>Remember me</p>
              </label>
              <Link to="/Forgotpassword">Forgot password?</Link>
            </div>
            <button
              className={signincss.login}
              type="submit"
              disabled={loading}
            >
              {loading ? <Spinner /> : "Log In"}
            </button>
            <div className={signincss.register}>
              <p></p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default SignIn;
