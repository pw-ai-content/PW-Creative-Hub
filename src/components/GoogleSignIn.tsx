// src/components/GoogleSignIn.tsx
import React, { useEffect, useRef } from "react";
import { api } from "../api";

type User = { email: string; name: string; role: "admin" | "sme" | "user" };

const GoogleSignIn: React.FC<{ onAuthed: (u: User) => void }> = ({
  onAuthed,
}) => {
  const divRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
    if (!clientId || !(window as any).google) return;

    const google = (window as any).google;
    google.accounts.id.initialize({
      client_id: clientId,
      callback: async (resp: any) => {
        try {
          const { data } = await api.post("/auth/google", {
            credential: resp.credential,
          });
          onAuthed(data.user);
        } catch (e) {
          console.error("Auth failed", e);
          alert("Sign-in failed.");
        }
      },
    });

    // Render the button
    if (divRef.current) {
      google.accounts.id.renderButton(divRef.current, {
        theme: "outline",
        size: "large",
      });
    }
  }, []);

  return <div ref={divRef} />;
};

export default GoogleSignIn;
