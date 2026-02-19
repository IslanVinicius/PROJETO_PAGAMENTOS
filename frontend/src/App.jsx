import React, { useState } from "react";
import Login from "./components/Login/Login";
import MainPage from "./components/MainPage/MainPage";
import "./styles/global.css";  // ✅ ÚNICO ARQUIVO CSS IMPORTADO AQUI

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    return (
        <div>
            {!isLoggedIn ? (
                <Login onLogin={() => setIsLoggedIn(true)} />
            ) : (
                <MainPage onLogout={() => setIsLoggedIn(false)} />
            )}
        </div>
    );
}

export default App;