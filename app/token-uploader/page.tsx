'use client';

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function TokenUploader() {
  const [tokenInput, setTokenInput] = useState("");
  const [status, setStatus] = useState("");
  const [savedTokens, setSavedTokens] = useState<string[]>([]);

  const handleSave = async () => {
    if (!tokenInput.trim()) {
      setStatus("Please enter a token.");
      return;
    }

    try {
      const res = await fetch("/api/tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: tokenInput }),
      });

      if (res.ok) {
        setStatus("Token saved successfully.");
        setSavedTokens((prev) => [...prev, tokenInput]);
        setTokenInput("");
      } else {
        const err = await res.text();
        setStatus(`Failed to save token: ${err}`);
      }
    } catch (e) {
      setStatus(`Error: ${e}`);
    }
  };

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <Card className="mb-6">
        <CardContent className="space-y-4">
          <h1 className="text-xl font-semibold">Add Kubernetes Token</h1>
          <Textarea
            placeholder="Paste your JWT token here"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            rows={5}
          />
          <Button onClick={handleSave}>Save Token</Button>
          {status && <p className="text-sm text-muted-foreground">{status}</p>}
        </CardContent>
      </Card>

      {savedTokens.length > 0 && (
        <Card>
          <CardContent className="space-y-2">
            <h2 className="text-lg font-semibold">Saved Tokens</h2>
            <ul className="list-disc pl-6 text-sm break-all">
              {savedTokens.map((token, i) => (
                <li key={i}>{token}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
