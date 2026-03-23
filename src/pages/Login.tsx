
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createAuthClient as createAuthClientNode } from "better-auth/client";
import { emailOTPClient } from "better-auth/client/plugins"

export const authClient = createAuthClientNode({
  baseURL: "http://localhost:3005",
  plugins: [emailOTPClient()],
});

// {
//     "token": "QDspWPwpkoJsTT8OPbHoHumDkQx5Hnzc",
//     "user": {
//         "name": "",
//         "email": "manusinghal84@gmail.com",
//         "emailVerified": true,
//         "image": null,
//         "createdAt": "2026-02-21T03:08:25.708Z",
//         "updatedAt": "2026-02-21T03:08:25.708Z",
//         "id": "uyySerdhTKxXDun7hY5KMnAWJPurPjQ5"
//     }
// }

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");

  // STEP 1 — Send OTP
  const sendOtp = async () => {
      const { data, error } = await authClient.emailOtp.sendVerificationOtp({
          email: email, // required
          type: "sign-in", // required
      });

      if (error) {
        console.error("Send OTP Error:", error);
        return;
      }

      console.log("Send OTP Response:", data);
      setStep("otp");
    } 

  // STEP 2 — Verify OTP
  const signInWithOTP = async () => {
      const { data, error } = await authClient.signIn.emailOtp({
        email: email, // required
        otp: otp, // required
      });

      if (error) {
        console.error("Sign in with OTP Error:", error);
        return;
      }

      console.log("Sign in with OTP Response:", data);

      if (data.token) {
        chrome.storage.local.set({ token: data.token }, () => {
          console.log("Token stored successfully");
        });
      } else {
        console.error("No token found in the response");
      }
  };

  return (
    <div className="flex flex-col gap-6 justify-center items-center">
      <h1 className="text-4xl font-bold">Login with Email OTP</h1>

      <Card className="border-dashed border-2 p-6 w-96">
        <CardContent className="flex flex-col gap-4">
          {step === "email" && (
            <>
              <input
                type="email"
                placeholder="Enter your email"
                className="border p-2 rounded"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button onClick={sendOtp}>Send OTP</Button>
            </>
          )}

          {step === "otp" && (
            <>
              <input
                type="text"
                placeholder="Enter OTP"
                className="border p-2 rounded"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <Button onClick={signInWithOTP}>Sign in with OTP</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}