import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) {
        navigate("/"); // al ingelogd
      }
    });
  }, []);

  const handleLogin = async () => {
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Login mislukt: " + error.message);
    } else {
      navigate("/");
    }
  };

  const handleRegister = async () => {
    setError("");
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError("Registratie mislukt: " + error.message);
    } else {
      alert("Bevestig je e-mail via de link die je ontvangen hebt.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">
        {isRegistering ? "Registreren" : "Inloggen"}
      </h1>
      <Input
        placeholder="E-mailadres"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        type="password"
        placeholder="Wachtwoord"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="text-red-600">{error}</p>}
      <Button onClick={isRegistering ? handleRegister : handleLogin}>
        {isRegistering ? "Registreer" : "Login"}
      </Button>
      <Button variant="ghost" onClick={() => setIsRegistering(!isRegistering)}>
        {isRegistering ? "Heb je al een account? Log in" : "Nog geen account? Registreer"}
      </Button>
    </div>
  );
}
