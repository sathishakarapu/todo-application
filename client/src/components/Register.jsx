import React, { useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
const url = "https://todo-project-application-be8d5c62bc5a.herokuapp.com";
const Container = styled.div`
  height: 500px;
  width: 400px;
  background-color: green;
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
const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      setError("Please enter all the required fields !");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords Do Not Match");
      return;
    }

    try {
      const response = await axios.post(`${url}/register`, {
        email,
        password,
        confirmPassword,
      });
      if (response.status >= 200 && response.status < 300) {
        console.log("Signup Successfully");
        setError("");
        navigate("/");
      } else {
        throw new Error("Signup Failed with status code" + response.status);
      }
    } catch (error) {
      console.log("Error:", error.message);

      setError(`${error.message}`);
      if (
        error.response &&
        error.response.response.data &&
        error.response.data.message === "User already exists"
      ) {
        setError("User name is already Taken");
      }
    }
  };

  return (
    <>
      <Div>
        <Container>
          <Form>
            <h1 style={{ alignSelf: "center" }}>Register</h1>
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
              <Input
                placeholder="Confirm Password"
                type="password"
                value={confirmPassword}
                name="confirm password"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="submit"
                value="register"
                style={{
                  background: "blue",
                  color: "white",
                  border: "none",
                  padding: "10px",
                  cursor: "pointer",
                }}
              >
                Register
              </button>
            </form>
            <button
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "blue",
              }}
            >
              <Link to="/">Member Login</Link>
            </button>
            <div style={{ color: "red", marginLeft: "15px" }}>{error}</div>
          </Form>
        </Container>
      </Div>
    </>
  );
};

export default Register;
