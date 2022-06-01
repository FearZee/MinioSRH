import logo from './logo.svg';
import './App.css';
import {BrowserRouter, Routes, Route} from "react-router-dom";
import {Overview} from "./components/Overview";
import {Folder} from "./components/Folder";

function App() {
  return (
      <BrowserRouter>
          <Routes>
              <Route path={'/'} element={<Overview />}/>
              <Route path={'/dir/:dir'} element={<Folder dir={''} />}/>
          </Routes>
      </BrowserRouter>
  );
}

export default App;
