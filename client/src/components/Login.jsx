import React, { useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
const url = "https://todo-project-application-be8d5c62bc5a.herokuapp.com";
const Container = styled.div`
  height: 500px;
  width: 400px;
  background-color: orange;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Div = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const Input = styled.input`
  padding-left: 15px;
  height: 40px;
  width: 150px;
  background: transparent;
  border: 1px solid black;
  border-radius: 10px;
`;
const Form = styled.div`
  background: white;
  height: 400px;
  width: 300px;
  display: flex;
  flex-direction: column;
`;
const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter all the required fields !");
      return;
    }

    try {
      const response = await axios.post(`${url}/login`, {
        email,
        password,
      });

      if (response.status >= 200 && response.status < 300) {
        console.log("Login Successfully");
        document.cookie = `token=${response.data.token}; path=/;`;

        setError("");
        navigate("/home");
      }
    } catch (error) {
      console.error("Error:", error.message);
      setError("Username or Password doesnot matched !");
    }
  };

  return (
    <>
      <Div>
        <Container>
          <Form>
            <h1 style={{ alignSelf: "center" }}>Member Login</h1>
            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                margin: "50px auto",
              }}
            >
              <Input
                placeholder="Username"
                type="email"
                value={email}
                name="email"
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                placeholder="Password"
                type="password"
                value={password}
                name="password"
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="submit"
                value="login"
                style={{
                  background: "blue",
                  color: "white",
                  border: "none",
                  padding: "10px",
                  cursor: "pointer",
                }}
              >
                Login
              </button>
            </form>
            <div style={{ color: "red", marginLeft: "15px" }}>{error}</div>
            <button
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                marginTop: "20px",
              }}
            >
              Don't have an account ? <Link to="/register">Register</Link>
            </button>
          </Form>
        </Container>
      </Div>
    </>
  );
};

export default Login;
