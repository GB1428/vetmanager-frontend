import { HomeHero } from "@/components/shared/home-hero";
import { EmergencyForm } from "@/components/shared/emergency-form";
import { Footer } from "@/components/layout/footer";
import { PawPrint } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <HomeHero />

      <div className="flex flex-1 flex-col">
        <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-12">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
              <PawPrint className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-medium text-foreground">VetManager</span>
          </div>
          <EmergencyForm />
        </main>
        <Footer />
      </div>
    </div>
  );
}
