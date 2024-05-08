import './App.css';
import Register from './components/Register';
import Login from './components/Login';
import {Routes,Route} from "react-router-dom";
import Home from './components/Home';

function App() {
  return (
    <>
    <Routes>
    <Route path='/' element={<Login />}/>
    <Route path='/register' element={<Register />}/>
    <Route path='/home' element={<Home />}/>
    </Routes>
    </>
  );
}

export default App;
