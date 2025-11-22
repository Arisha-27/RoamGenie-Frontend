// src/pages/TripPlanner.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  logSearch,
  generateItinerary,
  modifyItinerary,
  finalizePackages,
} from "../lib/api";

const TripPlanner = () => {
  const [departureCity, setDepartureCity] = useState("BOM");
  const [destination, setDestination] = useState("DEL");
  const [departureDate, setDepartureDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [duration, setDuration] = useState([3]);
  const [theme, setTheme] = useState("");
  const [activities, setActivities] = useState("");
  const [loading, setLoading] = useState(false);

  const [itinerary, setItinerary] = useState<string | null>(null);
  const [cheapestFlights, setCheapestFlights] = useState<any[]>([]);
  const [cheapestTrains, setCheapestTrains] = useState<any[]>([]);
  const [hotelContent, setHotelContent] = useState<string | null>(null);

  const [modificationChat, setModificationChat] = useState<{ role: string, content: string }[]>([]);
  const [packages, setPackages] = useState<any[] | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!departureCity || !destination || !departureDate || !returnDate || !theme) {
      toast.error("Please fill all required fields before submitting.");
      return;
    }

    setLoading(true);
    try {
      toast.message("Saving trip details...");
      await logSearch({
        departure_city: departureCity,
        destination,
        days: duration[0],
        theme,
        activities,
        departure_date: format(departureDate, "yyyy-MM-dd"),
        return_date: format(returnDate, "yyyy-MM-dd"),
        user_id: "guest",
      });
      toast.success("✅ Trip details saved successfully!");

      toast.message("Generating itinerary...");
      const gen = await generateItinerary({
        departure_city: departureCity,
        destination,
        days: duration[0],
        theme,
        activities,
        departure_date: format(departureDate, "yyyy-MM-dd"),
        return_date: format(returnDate, "yyyy-MM-dd"),
        user_id: "guest",
      });

      if (gen?.success) {
        if (gen.itinerary) setItinerary(gen.itinerary);
        if (gen.cheapest_flights) setCheapestFlights(gen.cheapest_flights);
        if (gen.cheapest_trains) setCheapestTrains(gen.cheapest_trains);
        if (gen.hotel_restaurant_content) setHotelContent(gen.hotel_restaurant_content);
        toast.success("✨ Itinerary ready!");
      } else {
        toast.error("Failed to generate itinerary. See console.");
        console.error("generateItinerary response:", gen);
      }
    } catch (err: any) {
      console.error("❌ generateItinerary failed:", err);
      toast.error("Failed to save or generate itinerary. Check backend logs.");
    } finally {
      setLoading(false);
    }
  };

  const handleModify = async (prompt: string) => {
    if (!itinerary) {
      toast.error("No itinerary available to modify.");
      return;
    }
    setLoading(true);
    try {
      setModificationChat((s) => [...s, { role: "user", content: prompt }]);
      const res = await modifyItinerary({
        user_id: "guest",
        current_itinerary: itinerary,
        modification_prompt: prompt,
        context: {
          destination,
          days: duration[0],
          theme,
        },
      });
      if (res?.success && res.updated_itinerary) {
        setItinerary(res.updated_itinerary);
        setModificationChat((s) => [...s, { role: "assistant", content: "I've updated your itinerary. See above." }]);
        toast.success("Itinerary updated.");
      } else {
        toast.error("Could not update itinerary.");
        console.error("modifyItinerary:", res);
      }
    } catch (err) {
      console.error("modify error:", err);
      toast.error("Failed to modify itinerary.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizePackages = async () => {
    if (!itinerary) {
      toast.error("No itinerary to finalize.");
      return;
    }
    setLoading(true);
    try {
      const res = await finalizePackages({
        user_id: "guest",
        itinerary,
        context: { destination, num_days: duration[0], theme, cheapest_flights: cheapestFlights },
      });
      if (res?.success && res.packages) {
        setPackages(res.packages);
        toast.success("Packages generated!");
      } else {
        toast.error("Could not generate packages.");
        console.error("finalizePackages:", res);
      }
    } catch (err) {
      console.error("finalize error:", err);
      toast.error("Failed to generate packages.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-24 pb-12 px-4 bg-soft-gradient">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Plan Your Adventure</h1>
            <p className="text-muted-foreground text-lg">Enter travel details and let us create your itinerary.</p>
          </div>

          <Card className="p-8 mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label className="text-lg font-semibold mb-2 block">Departure City (IATA or City)</Label>
                <Input placeholder="BOM" value={departureCity} onChange={(e) => setDepartureCity(e.target.value)} required />
              </div>

              <div>
                <Label className="text-lg font-semibold mb-2 block">Destination (IATA or City)</Label>
                <Input placeholder="DEL" value={destination} onChange={(e) => setDestination(e.target.value)} required />
              </div>

              <div>
                <Label className="text-lg font-semibold mb-2 block">Trip Duration (days)</Label>
                <Slider value={duration} onValueChange={setDuration} max={30} min={1} step={1} />
                <div className="text-center text-2xl font-bold mt-4">{duration[0]} {duration[0] === 1 ? "Day" : "Days"}</div>
              </div>

              <div>
                <Label className="text-lg font-semibold mb-2 block">Select Your Travel Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger><SelectValue placeholder="Choose Theme..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Couple Getaway">Couple Getaway</SelectItem>
                    <SelectItem value="Family Trip">Family Trip</SelectItem>
                    <SelectItem value="Solo Adventure">Solo Adventure</SelectItem>
                    <SelectItem value="Backpacking">Backpacking</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-lg font-semibold mb-2 block">What activities do you enjoy?</Label>
                <Textarea placeholder="Exploring historical sites, trying local food..." value={activities} onChange={(e) => setActivities(e.target.value)} rows={3} />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-lg font-semibold mb-2 block">Departure Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !departureDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {departureDate ? format(departureDate, "PPP") : "Select Date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={departureDate} onSelect={setDepartureDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-2 block">Return Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !returnDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {returnDate ? format(returnDate, "PPP") : "Select Date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={returnDate} onSelect={setReturnDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full text-lg py-6 rounded-full">{loading ? "Working..." : "Generate My Trip"}</Button>
            </form>
          </Card>

          {/* Results area */}
          {cheapestFlights.length > 0 && (
            <section className="mb-8">
              <h2 className="text-3xl font-bold mb-4">Cheapest Travel Options</h2>
              <h3 className="text-xl font-semibold mb-3">Flights</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {cheapestFlights.map((f, idx) => (
                  <Card key={idx} className="p-6">
                    {f.provider_logo && <img src={f.provider_logo} alt="logo" style={{ width: 60 }} />}
                    <h4 className="text-2xl font-bold mt-2">{f.provider || "Unknown Airline"}</h4>
                    <p><strong>Departure:</strong> {f.departure_time}</p>
                    <p><strong>Arrival:</strong> {f.arrival_time}</p>
                    <p><strong>Duration:</strong> {f.duration_minutes} min</p>
                    <div className="mt-4 text-2xl font-bold">₹ {f.price ?? "N/A"}</div>
                    <Button variant="outline" className="mt-3" onClick={() => window.open(f.booking_link || "#", "_blank")}>Book Now</Button>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {cheapestTrains.length > 0 && (
            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-3">Trains</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {cheapestTrains.map((t, idx) => (
                  <Card key={idx} className="p-6">
                    <h4 className="text-2xl font-bold">{t.provider}</h4>
                    <p><strong>Departure:</strong> {t.departure_time}</p>
                    <p><strong>Arrival:</strong> {t.arrival_time}</p>
                    <p><strong>Duration:</strong> {t.duration_minutes}</p>
                    <Button variant="outline" className="mt-3" onClick={() => window.open(t.booking_link || "#", "_blank")}>Book Now</Button>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {hotelContent && (
            <section className="mb-8">
              <h3 className="text-2xl font-bold mb-4">Hotels & Restaurants</h3>
              <Card className="p-6">
                <div style={{ whiteSpace: "pre-wrap" }}>{hotelContent}</div>
              </Card>
            </section>
          )}

          {itinerary && (
            <section className="mb-8">
              <h3 className="text-3xl font-bold mb-4">Your Itinerary</h3>
              <Card className="p-6">
                <pre className="whitespace-pre-wrap">{itinerary}</pre>
              </Card>
            </section>
          )}

          {/* Chat modification UI */}
          {itinerary && (
            <section className="mb-8">
              <h3 className="text-2xl font-bold mb-4">🤖 Chat with RoamGenie to modify your plan</h3>
              <div className="space-y-4">
                {modificationChat.map((m, i) => (
                  <div key={i} className={`p-4 rounded ${m.role === "assistant" ? "bg-slate-800" : "bg-slate-700"}`}>
                    <div className="text-sm text-muted-foreground">{m.role.toUpperCase()}</div>
                    <div>{m.content}</div>
                  </div>
                ))}
                <div className="flex gap-3">
                  <Input id="modifyInput" placeholder="e.g., 'Can you add a museum to Day 2?'" />
                  <Button onClick={() => {
                    const el: any = document.getElementById("modifyInput") as HTMLInputElement;
                    if (el && el.value) {
                      handleModify(el.value);
                      el.value = "";
                    }
                  }}>Send</Button>
                </div>
              </div>
            </section>
          )}

          {/* Finalize & packages */}
          {itinerary && (
            <section className="mb-12">
              <h3 className="text-2xl font-bold mb-4">Ready to Book?</h3>
              <div className="mb-4">
                <Button onClick={handleFinalizePackages} disabled={loading}>Finalize Plan & Get Packages</Button>
              </div>

              {packages && (
                <>
                  <h4 className="text-xl font-semibold mb-4">Your Travel Packages</h4>
                  <div className="grid md:grid-cols-3 gap-6">
                    {packages.map((pkg, i) => (
                      <Card key={i} className="p-6">
                        <h5 className="text-2xl font-bold">{pkg.package_name}</h5>
                        <p className="mt-2">{pkg.description}</p>
                        <div className="text-3xl font-bold mt-4">Total: ₹{pkg.total_cost?.toLocaleString?.() ?? pkg.total_cost}</div>
                        <ul className="mt-3">
                          <li>✈️ Flights / Trains: ₹{pkg.flight_cost ?? 0}</li>
                          <li>🏨 Hotels (Est.): ₹{pkg.estimated_hotel_cost}</li>
                          <li>🎟️ Activities (Est.): ₹{pkg.activity_cost}</li>
                          <li>🍔 Food (Est.): ₹{pkg.estimated_food_cost}</li>
                          <li>🚕 Local Transport (Est.): ₹{pkg.estimated_transport_cost}</li>
                        </ul>
                        <div className="mt-4">
                          <Button variant="outline" onClick={() => setSelectedPackage(pkg)}>Select {pkg.package_name} Plan</Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              )}

              {selectedPackage && (
                <Card className="p-6 mt-8">
                  <h4 className="text-2xl font-bold">Proceed to Book '{selectedPackage.package_name}' Plan</h4>
                  <div className="mt-3">
                    <div className="mb-2">Great choice! You've selected the {selectedPackage.package_name} plan.</div>
                    <div className="text-lg font-bold">Total Price: ₹{selectedPackage.total_cost}</div>
                    <div className="mt-3">
                      {cheapestFlights && cheapestFlights.length > 0 ? (
                        <Button onClick={() => window.open(cheapestFlights[0].booking_link || "#", "_blank")}>Book Flight</Button>
                      ) : <div>No flight links</div>}
                    </div>
                    <div className="mt-3">
                      <Button variant="ghost" onClick={() => setSelectedPackage(null)}>Clear Selection</Button>
                    </div>
                  </div>
                </Card>
              )}
            </section>
          )}

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TripPlanner;
