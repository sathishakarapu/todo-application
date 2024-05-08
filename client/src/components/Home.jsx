import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  height: 550px;
  width: 1100px;
  border: 2px solid black;
  overflow: hidden;
  margin: 10px;
`;

const Navbar = styled.div`
  top: 30px;
  left: 10px;
  height: 100px;
  width: 1050px;
  margin-left: 20px;
  position: absolute;
  border: 2px solid blue;
`;

const Sidebar = styled.div`
  position: absolute;
  top: 140px;
  left: 30px;
  height: 400px;
  width: 150px;
  border: 2px solid green;
`;
const Body = styled.div`
  position: absolute;
  top: 140px;
  left: 200px;
  height: 400px;
  width: 850px;
  border: 2px solid gray;
`;

const Todo = styled.div`
  position: absolute;
  top: 10px;
  left: 40px;
  padding: 5px;
  font-weight: bold;
  color: goldenrod;
`;

const History = styled.div`
  position: absolute;
  top: 50px;
  left: 40px;
  padding: 5px;
  font-weight: bold;
`;

const Logout = styled.button`
  position: absolute;
  top: 350px;
  left: 40px;
  background: transparent;
  border: 1px solid black;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
`;

const New = styled.div`
  position: absolute;
  top: 20px;
  left: 700px;
  font-size: medium;
  border: 1px solid black;
  padding: 5px;
  cursor: pointer;
  font-weight: bold;
`;

const User = styled.div`
  position: absolute;
  left: 900px;
  top: 40px;
  font-size: medium;
  font-weight: bold;
  text-decoration: underline;
`;

const Table = styled.div`
  position: absolute;
  top: 100px;
  left: 100px;
  width: 700px;
  height: 250px;
  border: 1px solid black;
`;
const Home = () => {
  const [user, setUser] = useState("");
  const [newActivity, setNewActivity] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = getCookie("token");

    if (!token) {
      navigate("/");
    } else {
      axios
        .get("http://localhost:8080/verify", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          const userEmail = response.data?.user?.email || "";
          const userName = userEmail.split("@")[0];
          setUser(userName);
        })
        .catch((error) => {
          console.error("Error verifying user:", error.message);
          if (
            error.response.status === 401 ||
            error.response.data.message === "jwt"
          ) {
            navigate("/");
          }
        });
    }
  }, [navigate]);

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  const handleLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
    setUser(null);
    navigate("/");
  };

  const handleNewActivityChange = (e) => {
    setNewActivity(e.target.value);
  };

  const handleActivity = async () => {
    try {
      if (newActivity.trim() !== "") {
        await axios.post("http://localhost:8080/create", {
          name: newActivity,
        });
        setNewActivity("");
      }
    } catch (error) {
      console.error("Error adding activity");
    }
  };

  return (
    <>
      <Container>
        <Navbar>
          <User>{user}</User>
        </Navbar>
        <Sidebar>
          <Todo>TodoList</Todo>
          <History>History</History>
          <Logout onClick={handleLogout}>Logout</Logout>
        </Sidebar>
        <Body>
          <New onClick={handleActivity}>NewActivity</New>
          <Table>
            <input
              type="text"
              value={newActivity}
              onChange={handleNewActivityChange}
            />
          </Table>
        </Body>
      </Container>
    </>
  );
};

export default Home;
