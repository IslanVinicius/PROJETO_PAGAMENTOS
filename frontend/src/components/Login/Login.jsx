import React from "react";
import styles from "./Login.module.css";

function Login({ onLogin }) {
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.logo}>
                    💳
                    <span>SISTEMA DE PAGAMENTOS</span>
                </div>

                <input
                    type="text"
                    placeholder="USUÁRIO"
                    className={styles.input}
                />

                <input
                    type="password"
                    placeholder="SENHA"
                    className={styles.input}
                />

                <button
                    className={styles.button}
                    onClick={onLogin}
                >
                    ENTRAR
                </button>

                <p className={styles.footer}>2026 - Pagamentos App</p>
            </div>
        </div>
    );
}

export default Login;