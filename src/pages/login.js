import React, { useState, useEffect } from "react";

import Form from "../components/Form";
import Loading from "../components/Loading";
import Layout from "../components/Layout";
import Message from "../components/Message";
import useInput from "../hooks/useInput";
import { login, tryLoginWithLocalStorage } from "../hoc/withAuth";
import withDBMode from "../hoc/withDBMode";
import apiFetch from "../fetch";

function Login() {
  const usernameField = useInput();
  const passwordField = useInput();

  const [errorMessage, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    tryLoginWithLocalStorage();
  }, []);

  const doLogin = (username, password) => {
    setLoading(true);
    setError(null);

    return apiFetch("token", {
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify({ username, password })
    })
      .then(response => {
        setLoading(false);
        return response.token;
      })
      .catch(error => {
        setLoading(false);
        setError("Invalid username or password");
        return null;
      });
  };

  const handleSubmit = event => {
    event.preventDefault();

    doLogin(usernameField.value, passwordField.value).then(token => {
      if (token) {
        login(token);
      }
    });
  };

  return (
    <Layout current={{ name: "Login" }}>
      <form action="/api/pleroma">
          <button type="submit" className="Button Button--big">Login with pleroma</button>
      </form>
    </Layout>
  );
}

export default withDBMode(Login);
