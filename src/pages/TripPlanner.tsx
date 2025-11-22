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
import { CalendarIcon, Plane, Train } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  logSearch,
  generateItinerary,
  modifyItinerary,
  finalizePackages,
  getCampaign, // <-- new import
} from "../lib/api";

// Component to render itinerary with rich HTML
const ItineraryDisplay = ({ content }: { content: string }) => {
  return (
    <div
      className="prose prose-slate max-w-none"
      dangerouslySetInnerHTML={{ __html: content }}
      style={{
        lineHeight: '1.8',
      }}
    />
  );
};

const TripPlanner = () => {
  const [departureCity, setDepartureCity] = useState("BOM");
  const [destination, setDestination] = useState("DEL");
  const [departureDate, setDepartureDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [duration, setDuration] = useState([3]);
  const [theme, setTheme] = useState("");
  const [activities, setActivities] = useState("");
  const [loading, setLoading] = useState(false);

  // new: campaign state to hold fetched campaign for selected theme
  const [campaign, setCampaign] = useState<any | null>(null);

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
        if (gen.campaign) setCampaign(gen.campaign);
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
        context: {
          departure_city: departureCity,   // 🔥 REQUIRED FIX
          destination,
          num_days: duration[0],
          theme,
          cheapest_flights: cheapestFlights
        },
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
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 transition-transform duration-300 hover:scale-105">Plan Your Adventure</h1>
            <p className="text-muted-foreground text-lg">Enter travel details and let us create your itinerary.</p>
          </div>

          <Card className="p-8 mb-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label className="text-lg font-semibold mb-2 block">Departure City (IATA or City)</Label>
                <Input placeholder="BOM" value={departureCity} onChange={(e) => setDepartureCity(e.target.value)} required className="transition-all duration-300 hover:shadow-md focus:scale-105" />
              </div>

              <div>
                <Label className="text-lg font-semibold mb-2 block">Destination (IATA or City)</Label>
                <Input placeholder="DEL" value={destination} onChange={(e) => setDestination(e.target.value)} required className="transition-all duration-300 hover:shadow-md focus:scale-105" />
              </div>

              <div>
                <Label className="text-lg font-semibold mb-2 block">Trip Duration (days)</Label>
                <Slider value={duration} onValueChange={setDuration} max={30} min={1} step={1} className="transition-all duration-300 hover:scale-105" />
                <div className="text-center text-2xl font-bold mt-4">{duration[0]} {duration[0] === 1 ? "Day" : "Days"}</div>
              </div>

              <div>
                <Label className="text-lg font-semibold mb-2 block">Select Your Travel Theme</Label>
                {/* NOTE: SelectItem 'value' now uses backend theme keys (family, couple, adventure, solo) while display text stays the same */}
                <Select
                  value={theme}
                  onValueChange={async (val) => {
                    setTheme(val);
                    try {
                      // fetch campaign for selected theme (backend expects lowercase theme key)
                      const res = await getCampaign(val);
                      setCampaign(res?.campaign || null);
                    } catch (e) {
                      setCampaign(null);
                    }
                  }}
                >
                  <SelectTrigger className="transition-all duration-300 hover:shadow-md hover:scale-105"><SelectValue placeholder="Choose Theme..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="family">Family</SelectItem>
                    <SelectItem value="couple">Couple</SelectItem>
                    <SelectItem value="adventure">Adventure</SelectItem>
                    <SelectItem value="luxury">Luxury</SelectItem>
                    <SelectItem value="budget">Budget</SelectItem>
                    <SelectItem value="solo">Solo</SelectItem>
                    <SelectItem value="group">Group</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Campaign discount banner (if any) */}
              {campaign && (
                <Card className="p-4 bg-green-50 border border-green-200">
                  <div className="flex flex-col">
                    <div className="text-green-800 font-semibold text-lg">
                      🎉 {campaign.discount_percent}% off for {campaign.theme} trips!
                    </div>
                    {campaign.description && <div className="text-green-700 text-sm mt-1">{campaign.description}</div>}
                  </div>
                </Card>
              )}

              <div>
                <Label className="text-lg font-semibold mb-2 block">What activities do you enjoy?</Label>
                <Textarea placeholder="Exploring historical sites, trying local food..." value={activities} onChange={(e) => setActivities(e.target.value)} rows={3} className="transition-all duration-300 hover:shadow-md focus:scale-105" />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-lg font-semibold mb-2 block">Departure Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal transition-all duration-300 hover:shadow-md hover:scale-105", !departureDate && "text-muted-foreground")}>
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
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal transition-all duration-300 hover:shadow-md hover:scale-105", !returnDate && "text-muted-foreground")}>
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

              <Button type="submit" disabled={loading} className="w-full text-lg py-6 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl">{loading ? "Working..." : "Generate My Trip"}</Button>
            </form>
          </Card>
          {/* Discount Card After Generate */}
          {campaign && itinerary && (
            <Card className="p-6 mb-8 bg-green-50 border border-green-300 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-bold text-green-800 flex items-center gap-2">
                  🎉 Special Offer For {campaign.theme.charAt(0).toUpperCase() + campaign.theme.slice(1)} Trips!
                </h3>

                <div className="text-green-700 text-lg font-semibold">
                  Get <span className="text-green-900">{campaign.discount_percent}% OFF</span> on all travel packages.
                </div>

                {campaign.description && (
                  <p className="text-green-800 text-sm mt-1">
                    {campaign.description}
                  </p>
                )}
              </div>
            </Card>
          )}

          {/* Flights Section - Enhanced Display */}
          {cheapestFlights.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Plane className="w-8 h-8 text-primary transition-transform duration-300 hover:scale-125" />
                <h2 className="text-3xl font-bold transition-transform duration-300 hover:scale-105">Flight Options</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cheapestFlights.map((f, idx) => (
                  <Card key={idx} className="p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl cursor-pointer">
                    <div className="flex items-center gap-3 mb-4">
                      {f.provider_logo && (
                        <img src={f.provider_logo} alt="airline logo" className="w-12 h-12 object-contain transition-transform duration-300 hover:scale-110" />
                      )}
                      <h3 className="text-xl font-bold">{f.provider || "Unknown Airline"}</h3>
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Departure:</span>
                        <span className="font-medium">{f.departure_time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Arrival:</span>
                        <span className="font-medium">{f.arrival_time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-medium">{f.duration_minutes} min</span>
                      </div>
                    </div>

                    <div className="border-t pt-4 mt-4">
                      <div className="text-3xl font-bold text-primary mb-3">
                        ₹{f.price?.toLocaleString() ?? "N/A"}
                      </div>
                      <Button
                        className="w-full transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        onClick={() => window.open(f.booking_link || "#", "_blank")}
                      >
                        Book Now
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Trains Section */}
          {cheapestTrains.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Train className="w-8 h-8 text-primary transition-transform duration-300 hover:scale-125" />
                <h2 className="text-3xl font-bold transition-transform duration-300 hover:scale-105">Train Options</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cheapestTrains.map((t, idx) => (
                  <Card key={idx} className="p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl cursor-pointer">
                    <h3 className="text-xl font-bold mb-4">{t.provider}</h3>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Departure:</span>
                        <span className="font-medium">{t.departure_time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Arrival:</span>
                        <span className="font-medium">{t.arrival_time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-medium">{t.duration_minutes}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-3 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                      onClick={() => window.open(t.booking_link || "#", "_blank")}
                    >
                      Book Now
                    </Button>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Hotels Section */}
          {hotelContent && (
            <section className="mb-8">
              <h2 className="text-3xl font-bold mb-6 transition-transform duration-300 hover:scale-105">Hotels & Restaurants</h2>
              <Card className="p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                <div className="whitespace-pre-wrap text-base leading-relaxed">{hotelContent}</div>
              </Card>
            </section>
          )}

          {/* Enhanced Itinerary Display */}
          {itinerary && (
            <section className="mb-8">
              <h2 className="text-3xl font-bold mb-6 transition-transform duration-300 hover:scale-105">Your Personalized Itinerary</h2>
              <Card className="p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                <ItineraryDisplay content={itinerary} />
              </Card>
            </section>
          )}

          {/* Chat modification UI */}
          {itinerary && (
            <section className="mb-8">
              <h3 className="text-2xl font-bold mb-4 transition-transform duration-300 hover:scale-105" style={{ color: '#f97316' }}>🤖 Chat with RoamGenie to modify your plan</h3>
              <div className="space-y-4">
                {modificationChat.map((m, i) => (
                  <div key={i} className={`p-4 rounded transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${m.role === "assistant" ? "bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200" : "bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200"}`}>
                    <div className="text-sm font-semibold mb-2" style={{ color: '#f97316' }}>{m.role.toUpperCase()}</div>
                    <div className="text-slate-800">{m.content}</div>
                  </div>
                ))}
                <div className="flex gap-3">
                  <Input id="modifyInput" placeholder="e.g., 'Can you add a museum to Day 2?'" className="flex-1 transition-all duration-300 hover:shadow-md focus:scale-105" />
                  <Button onClick={() => {
                    const el: any = document.getElementById("modifyInput") as HTMLInputElement;
                    if (el && el.value) {
                      handleModify(el.value);
                      el.value = "";
                    }
                  }} style={{ background: '#f97316' }} className="hover:bg-orange-600 transition-all duration-300 hover:scale-105 hover:shadow-lg">Send</Button>
                </div>
              </div>
            </section>
          )}

          {/* Finalize & packages */}
{itinerary && (
  <section className="mb-12">
    <h3 className="text-2xl font-bold mb-4 transition-transform duration-300 hover:scale-105">
      Ready to Book?
    </h3>

    <div className="mb-4">
      <Button
        onClick={handleFinalizePackages}
        disabled={loading}
        className="transition-all duration-300 hover:scale-105 hover:shadow-lg"
      >
        Finalize Plan & Get Packages
      </Button>
    </div>

    {/* PACKAGES SECTION */}
    {packages && (
      <>
        <h4 className="text-xl font-semibold mb-6 transition-transform duration-300 hover:scale-105">
          Your Travel Packages
        </h4>

        {/* NO PACKAGES → SHOW CONTACT CARD */}
        {packages.length === 0 && (
          <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-red-50 border-2 border-orange-100 rounded-2xl shadow-lg">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF7B7B]/5 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-200/10 rounded-full translate-y-24 -translate-x-24"></div>
            
            <div className="relative p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#FF7B7B] to-orange-400 rounded-full mb-6 shadow-lg">
                <span className="text-4xl">✈️</span>
              </div>
              
              <h4 className="text-3xl font-bold text-slate-800 mb-4">
                No Packages Available
              </h4>
              
              <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                We currently don't have pre-made packages for this route, but don't worry! 
                Our travel experts will create a <span className="font-semibold text-[#FF7B7B]">personalized itinerary</span> tailored just for you.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  className="px-8 py-6 text-lg bg-[#FF7B7B] hover:bg-[#FF6B6B] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  onClick={() => window.location.href = '/contact'}
                >
                  <span className="mr-2">📞</span>
                  Contact Us
                </Button>
                
                <div className="text-sm text-slate-500">
                  or call us at <span className="font-semibold text-slate-700">+91-XXXX-XXXXXX</span>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-slate-200">
                <p className="text-sm text-slate-500 mb-4">What you'll get:</p>
                <div className="flex flex-wrap justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-slate-600">Custom Itinerary</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-slate-600">Best Prices</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-slate-600">24/7 Support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-slate-600">Flexible Booking</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* PACKAGES GRID - IMPROVED DESIGN */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {packages.map((pkg, i) => (
            <Card
              key={i}
              className="relative overflow-hidden bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
            >
              {/* DISCOUNT BADGE */}
              {pkg.discounted_total && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-green-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-md">
                    {pkg.discount_percent}% OFF
                  </div>
                </div>
              )}

              {/* HEADER SECTION */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 border-b border-orange-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <span className="inline-block px-3 py-1 bg-white text-[#FF7B7B] text-xs font-semibold rounded-full mb-3 uppercase tracking-wide">
                      {pkg.level}
                    </span>
                    <h5 className="text-xl font-bold text-slate-800 leading-tight">
                      {pkg.title}
                    </h5>
                  </div>
                </div>
              </div>

              {/* BODY SECTION */}
              <div className="p-6 flex-1 flex flex-col">
                {/* DESCRIPTION */}
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  {pkg.inclusions || "This plan includes curated travel services for your trip."}
                </p>

                {/* PRICE SECTION */}
                <div className="mb-6 pb-6 border-b border-slate-100">
                  {pkg.discounted_total ? (
                    <div>
                      <div className="flex items-baseline gap-3 mb-1">
                        <span className="text-3xl font-bold text-slate-800">
                          ₹{pkg.discounted_total?.toLocaleString()}
                        </span>
                        <span className="text-lg text-slate-400 line-through">
                          ₹{pkg.price?.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-green-600 font-medium">
                        You save ₹{(pkg.price - pkg.discounted_total)?.toLocaleString()}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-slate-800">
                        ₹{pkg.price?.toLocaleString()}
                      </span>
                      <span className="text-sm text-slate-500">per person</span>
                    </div>
                  )}
                </div>

                {/* DETAILS LIST */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <span className="text-[#FF7B7B] text-lg flex-shrink-0">✈️</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">Flight</p>
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {pkg.flight_details || "Included"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-[#FF7B7B] text-lg flex-shrink-0">🚕</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">Transport</p>
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {pkg.cab_details || "Included"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-[#FF7B7B] text-lg flex-shrink-0">🏨</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">Hotel</p>
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {pkg.hotel_details || "Included"}
                      </p>
                    </div>
                  </div>

                  {pkg.exclusions && (
                    <div className="flex items-start gap-3 pt-3 border-t border-slate-100">
                      <span className="text-slate-400 text-lg flex-shrink-0">❌</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">Not Included</p>
                        <p className="text-sm font-medium text-slate-600">
                          {pkg.exclusions}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* CTA BUTTON */}
                <div className="mt-auto">
                  <Button
                    className="w-full bg-[#FF7B7B] hover:bg-[#FF6B6B] text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:shadow-lg"
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    Select {pkg.level} Plan
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </>
    )}

    {/* SELECTED PACKAGE */}
    {selectedPackage && (
      <Card className="p-6 mt-8 border-2 border-[#FF7B7B] bg-orange-50/50 rounded-xl shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h4 className="text-2xl font-bold text-slate-800 mb-2">
              {selectedPackage.level} Plan Selected
            </h4>
            <p className="text-slate-600">
              Great choice! You've selected the {selectedPackage.level} plan.
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => setSelectedPackage(null)}
            className="text-slate-500 hover:text-slate-700"
          >
            ✕
          </Button>
        </div>

        <div className="bg-white rounded-lg p-4 mb-4 border border-orange-200">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-sm text-slate-600">Total Price:</span>
            <span className="text-2xl font-bold text-[#FF7B7B]">
              ₹{(selectedPackage.discounted_total ?? selectedPackage.price)?.toLocaleString()}
            </span>
          </div>
          {selectedPackage.discounted_total && (
            <p className="text-xs text-green-600">
              Campaign discount applied!
            </p>
          )}
        </div>

        <div className="flex gap-3">
          {cheapestFlights && cheapestFlights.length > 0 ? (
            <Button
              onClick={() =>
                window.open(cheapestFlights[0].booking_link || "#", "_blank")
              }
              className="flex-1 bg-[#FF7B7B] hover:bg-[#FF6B6B] text-white font-semibold py-3"
            >
              Book Flight Now
            </Button>
          ) : (
            <div className="flex-1 bg-slate-100 text-slate-500 rounded-lg py-3 px-4 text-center text-sm">
              No flight links available
            </div>
          )}
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
