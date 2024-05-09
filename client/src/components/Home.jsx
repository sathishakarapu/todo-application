import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import "../../src/App.css";
const url = "https://todo-project-application-be8d5c62bc5a.herokuapp.com";

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
  left: 0;
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
  left: 50px;
  width: 750px;
  height: 250px;
`;

const Home = () => {
  const [user, setUser] = useState("");
  const navigate = useNavigate();
  const [taskName, setTaskName] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [userId, setUserId] = useState(null);
  const [timeIntervals, setTimeIntervals] = useState([]);
  const [ongoingTasks, setOngoingTasks] = useState([]);

  const handleNewButtonClick = () => {
    setShowInput(true);
  };

  const handleCloseButtonClick = () => {
    setShowInput(false);
  };

  const handleInputChange = (e) => {
    setTaskName(e.target.value);
  };

  const handleAddButtonClick = async () => {
    if (taskName.trim() === "") {
      alert("Please enter something before adding a task.");
      return;
    }

    await axios.post(`${url}/create`, {
      name: taskName,
      user: userId,
    });
    setTaskName("");
    setShowInput(false);
  };

  useEffect(() => {
    const token = getCookie("token");

    if (!token) {
      navigate("/");
    } else {
      axios
        .get(`${url}/verify`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          const userEmail = response.data?.user?.email || "";
          const userName = userEmail.split("@")[0];
          setUser(userName);
          setUserId(response.data?.user?._id);
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

  useEffect(() => {
    fetchTasks();
  }, [taskName, userId]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${url}/tasks?userId=${userId}`);
      setTasks(response.data);
      const ongoing = response.data.filter((task) => task.status === "ongoing");
      setOngoingTasks(ongoing);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleActionPause = async (taskId) => {
    try {
      stopTimer(taskId);
      const completedTask = tasks.find((task) => task._id === taskId);
      await axios.post(`${url}/tasks/updateTimeForPause`, {
        taskId: taskId,
        timeTaken: completedTask.timeTaken,
      });
      fetchTasks();
    } catch (error) {}
  };

  const handleActionEnd = async (taskId) => {
    try {
      stopTimer(taskId);
      const completedTask = tasks.find((task) => task._id === taskId);
      await axios.post(`${url}/tasks/updateTimeForEnd`, {
        taskId: taskId,
        timeTaken: completedTask.timeTaken,
      });
      fetchTasks();
    } catch (error) {}
  };

  const handleActionResume = async (taskId) => {
    if (ongoingTasks.length === 0) {
      try {
        startTimer(taskId);
        await axios.post(`${url}/tasks/${taskId}/${"resume"}`);
        fetchTasks();
      } catch (error) {
        console.error("Error resuming task:", error);
      }
    } else {
      alert(
        "Please complete or pause the ongoing task before starting a new one."
      );
    }
  };

  const handleActionStart = async (taskId) => {
    if (ongoingTasks.length === 0) {
      try {
        startTimer(taskId);
        await axios.post(`${url}/tasks/${taskId}/${"start"}`);
        fetchTasks();
      } catch (error) {
        console.error("Error starting task:", error);
      }
    } else {
      alert(
        "Please complete or pause the ongoing task before starting a new one."
      );
    }
  };

  const startTimer = (taskId) => {
    const intervalId = setInterval(async () => {
      try {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === taskId && !task.isPaused
              ? { ...task, timeTaken: task.timeTaken + 1 }
              : task
          )
        );
      } catch (error) {
        console.error("Error updating timeTaken:", error);
      }
    }, 1000);

    setTimeIntervals((prevIntervals) => [
      ...prevIntervals,
      { taskId, intervalId },
    ]);
  };

  const stopTimer = (taskId) => {
    const intervalData = timeIntervals.find(
      (interval) => interval.taskId === taskId
    );
    clearInterval(intervalData.intervalId);

    setTimeIntervals((prevIntervals) =>
      prevIntervals.filter((data) => data.taskId !== taskId)
    );
  };

  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;

    const formattedTime = `${padZero(hours)}:${padZero(minutes)}:${padZero(
      seconds
    )}`;
    return formattedTime;
  };

  const padZero = (value) => {
    return value < 10 ? `0${value}` : value;
  };

  return (
    <>
      <Container>
        <Navbar>
          <User>{user}</User>
        </Navbar>
        <Sidebar>
          <Todo>TodoList</Todo>
          <History style={{ color: "blue" }}>
            History
            <table>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task._id}>
                    <td
                      style={{
                        paddingRight: "20px",
                        paddingLeft: "5px",
                        fontSize: "12px",
                      }}
                    >
                      {task.status === "completed" && task.name}
                    </td>
                    <td style={{ fontSize: "12px" }}>
                      {task.status === "completed" &&
                        formatTime(task.timeTaken)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </History>
          <Logout onClick={handleLogout}>Logout</Logout>
        </Sidebar>
        <Body>
          <New onClick={handleNewButtonClick}>Add New Activity</New>
          {showInput && (
            <div
              style={{
                position: "absolute",
                top: "15px",
                left: "300px",
                border: "1px solid black",
                padding: "3px",
                background: "gold",
              }}
            >
              <input
                placeholder="Enter Your Task Here"
                type="text"
                value={taskName}
                onChange={handleInputChange}
                style={{ margin: "10px", paddingLeft: "5px" }}
              />
              <button
                onClick={handleAddButtonClick}
                style={{
                  margin: "10px",
                  background: "white",
                  color: "black",
                  padding: "3px",
                  border: "1px solid black",
                  cursor: "pointer",
                }}
              >
                Add Task
              </button>
              <button
                onClick={handleCloseButtonClick}
                style={{
                  margin: "10px",
                  background: "white",
                  padding: "3px",
                  border: "1px solid black",
                  cursor: "pointer",
                  color: "black",
                }}
              >
                close
              </button>
            </div>
          )}
          <Table>
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Activity</th>
                  <th>Status</th>
                  <th>Time Taken</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task._id}>
                    <td>{task.name}</td>
                    <td>{task.status}</td>
                    <td style={{ paddingLeft: "10px" }}>
                      {task.status === "completed" &&
                        formatTime(task.timeTaken)}
                      {task.status === "pause" && formatTime(task.timeTaken)}
                      {task.status === "ongoing" && formatTime(task.timeTaken)}
                    </td>
                    <td>
                      {task.status === "pending" && (
                        <button
                          onClick={() => handleActionStart(task._id)}
                          style={{
                            margin: "10px",
                            background: "white",
                            padding: "3px",
                            border: "1px solid black",
                            cursor: "pointer",
                            color: "black",
                          }}
                        >
                          Start
                        </button>
                      )}
                      {task.status === "ongoing" && (
                        <button
                          onClick={() => handleActionPause(task._id)}
                          style={{
                            margin: "10px",
                            background: "white",
                            padding: "3px",
                            border: "1px solid black",
                            cursor: "pointer",
                            color: "black",
                          }}
                        >
                          Pause
                        </button>
                      )}
                      {task.status === "pause" && (
                        <button
                          onClick={() => handleActionResume(task._id)}
                          style={{
                            margin: "10px",
                            background: "white",
                            padding: "3px",
                            border: "1px solid black",
                            cursor: "pointer",
                            color: "black",
                          }}
                        >
                          Resume
                        </button>
                      )}
                      {task.status === "ongoing" && (
                        <button
                          onClick={() => handleActionEnd(task._id)}
                          style={{
                            margin: "10px",
                            background: "white",
                            padding: "3px",
                            border: "1px solid black",
                            cursor: "pointer",
                            color: "black",
                          }}
                        >
                          End
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Table>
        </Body>
      </Container>
    </>
  );
};

export default Home;
