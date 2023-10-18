import { useCallback, useState, useRef } from 'react';
import axios from 'axios';
import './App.css';
import GuacamoleConsole from './VncConsole/GuacamoleConsole';

function App() {

  const [user, setUser] = useState();
  const emailInputRef = useRef();
  const passwordInputRef = useRef();

  const [serverData, setServerData] = useState();
  console.log("serverData", serverData);
  const serverInstanceIdInputRef = useRef();
  const serverIpInputRef = useRef();
  const datacenterNameInputRef = useRef();

  const [submitError, setSubmitError] = useState();
  const [isLoading, setIsLoading] = useState(false);
  console.log("user", user);
  const authUser = useCallback(async (email, password) => {
    const apiUrl = process.env.REACT_APP_BACKEND_URL;
    const { data } = await axios.post(
      `${apiUrl}/api/authUser`,
      {
        email,
        password,
      },
      {
        withCredentials: true,
      }
      );
    setUser(data);
  }, []);

  const onSubmitUserAuth = async (e) => {
    try {
      setIsLoading(true);
      setSubmitError(null);
      e.preventDefault();
      const email = emailInputRef.current.value;
      const password = passwordInputRef.current.value;
      await authUser(email, password);
    } catch (e) {
      if (e.response && e.response.data) {
        setSubmitError(e.response.data.error);
      } else {
        setSubmitError("Something went wrong");
      }
    } finally {
      setIsLoading(false);
    }
  }

  const onSubmitServerData = async (e) => {
    e.preventDefault();
    setServerData({
      instance_id: serverInstanceIdInputRef.current.value,
      server_ip: serverIpInputRef.current.value,
      datacenter_name: datacenterNameInputRef.current.value,
    });
  };

  return (
    <div className="App">
      {submitError && <div>{submitError}</div>}
      {!user && <form onSubmit={onSubmitUserAuth}>
        <label id='email'>
          Email:
          <input ref={emailInputRef} type="text" name="email" />
        </label>
        <label id='password'>
          Password:
          <input ref={passwordInputRef} type="password" name="password" />
        </label>
        <button disabled={isLoading} type="submit">Submit</button>
      </form>}
      {user && !serverData &&  <form onSubmit={onSubmitServerData}>
        <label id='instance_id'>
          Server Instance ID:
          <input ref={serverInstanceIdInputRef} type="text" name="instance_id" defaultValue={11824} />
        </label>
        <label id='server_id'>
          Server IP:
          <input ref={serverIpInputRef} type="text" name="server_id" defaultValue={900} />
        </label>
        <label id='datacenter_name'>
          Datacenter Name:
          <input ref={datacenterNameInputRef} type="text" name="datacenter_name" defaultValue={"dc-eveng-qa03"} />
        </label>
        <button disabled={isLoading} type="submit">Submit</button>
      </form>}
      {serverData && <GuacamoleConsole serverData={serverData} userData={user} />}
    </div>
  );
}

export default App;
