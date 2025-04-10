import { Button } from "@/components/ui/button";
import Lumon from "../../../public/lumon.png";
import { NavigationSheet } from "./navigation-sheet";

export default function Navbar () {
  return (
    <div className="  backdrop-blur-sm text-white">
      <nav className="fixed top-6 inset-x-4 h-16 bg-transparent border border-[#302f31] max-w-screen-xl mx-auto rounded-full">
        <div className="h-full flex items-center justify-between mx-auto px-4">
          <img src={Lumon} alt="Logo" className="h-10 w-10 border rounded-full" />


          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="hidden sm:inline-flex text-black rounded-full"
              onClick={() => window.open("https://lumon.app", "_blank")}
            >
              Get Started
            </Button>
          

            {/* Mobile Menu */}
            <div className="md:hidden">
              <NavigationSheet />
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};
