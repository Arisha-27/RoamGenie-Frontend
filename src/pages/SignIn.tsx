import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { signIn } from "@/lib/api";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";

const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      toast.error("Enter both email and password");
      return;
    }

    setLoading(true);

    try {
      const res = await signIn(email, password);

      // Save session
      localStorage.setItem("access_token", res.access_token);
      localStorage.setItem("user", JSON.stringify(res.user));

      toast.success("Signed in successfully!");

      navigate("/trip-planner"); // redirect
    } catch (err) {
      toast.error("Invalid email or password");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-12 px-4">
        <div className="max-w-md mx-auto">
          <Card className="p-8 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
            <h1 className="text-3xl font-bold mb-6 text-center transition-transform duration-300 hover:scale-105">
              Sign In
            </h1>

            <div className="space-y-4">
              <div>
                <Label className="transition-transform duration-300 hover:scale-105 inline-block">Email</Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="transition-all duration-300 hover:shadow-md focus:scale-105"
                />
              </div>

              <div>
                <Label className="transition-transform duration-300 hover:scale-105 inline-block">Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="transition-all duration-300 hover:shadow-md focus:scale-105"
                />
              </div>

              <Button
                className="w-full mt-4 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                onClick={handleSignIn}
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SignIn;
