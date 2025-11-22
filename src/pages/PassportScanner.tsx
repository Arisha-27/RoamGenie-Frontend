import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import passportIllustration from "@/assets/passport-illustration.jpg";
import { Upload, Globe } from "lucide-react";
import { toast } from "sonner";

const API_BASE = "http://127.0.0.1:8000";

// ----------------------------
// API HELPERS
// ----------------------------
const uploadPassport = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/scan_passport`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Failed to upload passport");
  return await res.json();
};

const fetchVisaFreeCountries = async (country: string) => {
  const res = await fetch(
    `${API_BASE}/api/visa_free/${encodeURIComponent(country)}`
  );
  if (!res.ok) throw new Error("Failed to fetch visa-free countries");
  const data = await res.json();
  return data.visa_free_countries || [];
};

// ----------------------------
// COMPONENT
// ----------------------------
const PassportScanner = () => {
  const [countries, setCountries] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [detectedCountry, setDetectedCountry] = useState("");
  const [visaFreeCountries, setVisaFreeCountries] = useState<string[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load full passport country list
  useEffect(() => {
    fetch(`${API_BASE}/api/passport_countries`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCountries(data.countries);
      })
      .catch((err) => console.error("Country list error:", err));
  }, []);

  // ----------------------------
  // Handle Passport Upload
  // ----------------------------
  const handleFileUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    toast.message("Uploading passport photo...");
    setLoading(true);

    try {
      const result = await uploadPassport(file);

      if (result.country_detected) {
        const country = result.country_detected;
        setDetectedCountry(country);
        toast.success(`Detected passport country: ${country}`);

        const list = await fetchVisaFreeCountries(country);
        setVisaFreeCountries(list);
        setShowResults(true);
      } else {
        toast.error("Could not detect passport country. Please select manually.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Passport upload failed.");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // Manual Country Selection
  // ----------------------------
  const handleCountrySelect = async (country: string) => {
    setSelectedCountry(country);
    toast.message(`Loading visa-free destinations for ${country}...`);
    setLoading(true);

    try {
      const list = await fetchVisaFreeCountries(country);
      setVisaFreeCountries(list);
      setShowResults(true);
    } catch (err) {
      console.error(err);
      toast.error("Could not load visa-free list.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* HEADER */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 transition-transform duration-300 hover:scale-105">
              Passport Scanner
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Upload your passport or select your country to discover visa-free
              destinations and visa-on-arrival options.
            </p>
          </div>

          {/* BEFORE RESULTS */}
          {!showResults ? (
            <div className="grid md:grid-cols-2 gap-8">
              {/* UPLOAD PASSPORT */}
              <Card className="p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl cursor-pointer group">
                <div className="flex flex-col items-center text-center">
                  <div className="w-32 h-32 mb-6 rounded-full bg-primary/10 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
                    <Upload className="w-16 h-16 text-primary transition-transform duration-500 group-hover:scale-110" />
                  </div>

                  <h2 className="text-2xl font-bold mb-4">Upload Passport Photo</h2>
                  <p className="text-muted-foreground mb-6">
                    Upload a clear photo of your passport's information page.
                  </p>

                  <Label htmlFor="passport-upload" className="cursor-pointer w-full">
                    <div className="border-2 border-dashed border-border rounded-lg p-8 hover:border-primary transition-all duration-300 hover:shadow-lg">
                      <p className="text-muted-foreground">Click to upload or drag & drop</p>
                      <p className="text-sm text-muted-foreground mt-2">JPG, PNG (MAX. 10MB)</p>
                    </div>
                    <Input
                      id="passport-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={loading}
                    />
                  </Label>

                  {uploadedFile && (
                    <p className="mt-4 text-sm text-primary">Uploaded: {uploadedFile.name}</p>
                  )}
                </div>
              </Card>

              {/* SELECT COUNTRY */}
              <Card className="p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl cursor-pointer group">
                <div className="flex flex-col items-center text-center">
                  <div className="w-32 h-32 mb-6 rounded-full bg-accent/20 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
                    <Globe className="w-16 h-16 text-accent transition-transform duration-500 group-hover:scale-110" />
                  </div>

                  <h2 className="text-2xl font-bold mb-4">Select Your Country</h2>
                  <p className="text-muted-foreground mb-6">
                    Choose your passport country manually.
                  </p>

                  <Select
                    value={selectedCountry}
                    onValueChange={handleCountrySelect}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-full text-lg transition-all duration-300 hover:shadow-lg hover:scale-105">
                      <SelectValue placeholder="Select your country..." />
                    </SelectTrigger>

                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </Card>
            </div>
          ) : (
            <>
              {/* RESULTS */}
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold mb-2 transition-transform duration-300 hover:scale-105">
                  Visa-Free Destinations for{" "}
                  {detectedCountry || selectedCountry} Passport Holders
                </h2>
                <p className="text-muted-foreground">
                  You can travel to {visaFreeCountries.length} countries visa-free!
                </p>
              </div>

              {/* VISA-FREE LIST */}
              {visaFreeCountries.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visaFreeCountries.map((country) => (
                    <Card key={country} className="p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl cursor-pointer group">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold">{country}</h3>
                        <span className="text-2xl transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12">🌍</span>
                      </div>
                      <p className="text-primary font-semibold">Visa-Free Entry</p>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">
                  No visa-free destinations found.
                </p>
              )}

              <div className="mt-8 text-center">
                <Button variant="outline" onClick={() => setShowResults(false)} className="transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  Scan Another Passport
                </Button>
              </div>
            </>
          )}

          {/* Illustration */}
          <div className="mt-16 text-center">
            <img
              src={passportIllustration}
              alt="Passport illustration"
              className="w-64 h-64 mx-auto object-contain transition-all duration-500 hover:scale-110 hover:rotate-3"
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PassportScanner;
