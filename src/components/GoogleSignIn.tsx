// src/components/GoogleSignIn.tsx
import React, { useEffect, useRef } from "react";
import { api } from "../api";

type User = { email: string; name: string; role: "admin" | "sme" | "user" };

declare global {
  interface Window {
    google?: any;
  }
}

const GoogleSignIn: React.FC<{ onAuthed: (u: User) => void }> = ({
  onAuthed,
}) => {
  const divRef = useRef<HTMLDivElement | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as
      | string
      | undefined;
    if (!clientId) {
      console.warn("VITE_GOOGLE_CLIENT_ID is missing");
      return;
    }

    const init = () => {
      if (initialized.current || !window.google || !divRef.current) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        ux_mode: "popup",
        auto_select: false,
        callback: async (resp: { credential?: string }) => {
          try {
            if (!resp?.credential) throw new Error("No credential from GIS");
            const { data } = await api.post("/auth/google", {
              credential: resp.credential,
            });
            onAuthed(data.user);
          } catch (e) {
            console.error("Auth failed", e);
            alert("Sign-in failed. Please try again.");
          }
        },
      });

      window.google.accounts.id.renderButton(divRef.current, {
        theme: "outline",
        size: "large",
        type: "standard",
        shape: "pill",
        text: "continue_with",
        logo_alignment: "left",
      });

      initialized.current = true;
    };

    // If GIS script is already loaded, init immediately
    if (window.google?.accounts?.id) {
      init();
      return;
    }

    // Otherwise wait for the script to load (poll a few times)
    let tries = 0;
    const t = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(t);
        init();
      } else if (++tries > 50) {
        clearInterval(t);
        console.warn("GIS script did not load");
      }
    }, 100);

    return () => clearInterval(t);
  }, [onAuthed]);

  return <div ref={divRef} />;
};

export default GoogleSignIn;
