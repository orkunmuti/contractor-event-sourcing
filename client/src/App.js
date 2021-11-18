import logo from "./logo.svg";
import "./App.css";
import ContractList from "./components/Contract/ContractList";
import AppBar from "./components/AppBar";

function App() {
  return (
    <div>
      <AppBar />
      <ContractList />
    </div>
  );
}

export default App;
