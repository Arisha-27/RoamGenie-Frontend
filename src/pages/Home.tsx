import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import heroImage from "@/assets/hero-travel.jpg";
import roamgenieLogo from "@/assets/roamgenie.png";
import itineraryPreview from "@/assets/itinerary-preview.jpg";
import { Plane, MapPin, Globe, Download } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-soft-gradient">
        <div className="container mx-auto max-w-5xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight transition-transform duration-300 hover:scale-105">
            Craft Unforgettable<br />Itineraries with<br />
            <span className="text-primary">AI Trip Planner</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Your personal trip planner and travel curator, creating custom itineraries tailored to your interests and budget.
          </p>
          <Link to="/trip-planner">
            <Button size="lg" className="text-lg px-8 py-6 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              Get started—it's free
            </Button>
          </Link>

          <div className="mt-16 rounded-2xl overflow-hidden shadow-2xl border border-border transition-all duration-500 hover:shadow-3xl hover:-translate-y-2 cursor-pointer group">
            <img
              src={heroImage}
              alt="Travel destinations"
              className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-16 transition-transform duration-300 hover:scale-105">
            Everything you need for planning your trip
          </h2>

          <div className="grid md:grid-cols-2 gap-12 items-start mb-16">
            <div className="bg-secondary rounded-3xl p-12 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl cursor-pointer">
              <h3 className="text-3xl font-bold mb-4">
                Adjust your itinerary as needed
              </h3>
              <p className="text-muted-foreground text-lg">
                Seamlessly manage your itinerary all in one page with RoamGenie - from reconfiguring the order of your plans, introducing new destinations to your itinerary, or even discarding plans as needed.
              </p>
            </div>

            <div className="rounded-2xl overflow-hidden border border-border transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer group">
              <img
                src={itineraryPreview}
                alt="Itinerary preview"
                className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <Card className="p-6 bg-muted/30 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl cursor-pointer group">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12">
                <Plane className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">AI Travel</h3>
              <p className="text-muted-foreground">
                Generate personalized accommodation recommendations based on your unique preferences and budget.
              </p>
            </Card>

            <Card className="p-6 bg-muted/30 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl cursor-pointer group">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Everything in one space</h3>
              <p className="text-muted-foreground">
                Find all your personalized trips and bookmarked plans organized on a single page.
              </p>
            </Card>

            <Card className="p-6 bg-muted/30 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl cursor-pointer group">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12">
                <Download className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Flexible Itineraries</h3>
              <p className="text-muted-foreground">
                Adjust your itinerary easily with our AI chatbot - reorder, add, or remove activities as needed.
              </p>
            </Card>

            <Card className="p-6 bg-muted/30 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl cursor-pointer group">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Visa Information</h3>
              <p className="text-muted-foreground">
                Scan your passport to instantly discover visa-free destinations and entry requirements.
              </p>
            </Card>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-foreground text-background">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Skip the manual trip planning and start your effortless journey with Trip Planner AI today, at no cost.
          </h2>
          <Link to="/trip-planner">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 py-6 rounded-full mt-4 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              Try Now
            </Button>
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold mb-12 transition-transform duration-300 hover:scale-105">FAQs</h2>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="transition-transform duration-300 hover:translate-x-2">
              <AccordionTrigger className="text-lg font-semibold">
                What is RoamGenie?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                RoamGenie is an AI-powered travel planning platform that creates personalized itineraries based on your preferences, budget, and travel style. It simplifies trip planning by providing smart recommendations and organizing everything in one place.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="transition-transform duration-300 hover:translate-x-2">
              <AccordionTrigger className="text-lg font-semibold">
                Is RoamGenie free to use?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes! RoamGenie is completely free to use. You can create unlimited itineraries, access AI recommendations, and download your plans without any cost.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="transition-transform duration-300 hover:translate-x-2">
              <AccordionTrigger className="text-lg font-semibold">
                How does RoamGenie create personalized recommendations?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Our AI analyzes your travel preferences, budget, destination choices, and activity interests to generate customized itineraries that match your unique travel style.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="transition-transform duration-300 hover:translate-x-2">
              <AccordionTrigger className="text-lg font-semibold">
                How do I adjust my RoamGenie itinerary?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                You can easily modify your itinerary through our chatbot interface. Simply tell the AI what changes you'd like to make, such as adding destinations, removing activities, or reordering your plans.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="transition-transform duration-300 hover:translate-x-2">
              <AccordionTrigger className="text-lg font-semibold">
                Where can I receive support for using RoamGenie?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                You can contact our support team through the Contact page, or reach out via email. We're here to help make your travel planning experience seamless!
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
