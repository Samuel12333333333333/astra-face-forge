
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { Link } from "react-router-dom";

export const MobileMenu: React.FC = () => {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: "How It Works", href: "#how-it-works" },
    { name: "Examples", href: "#examples" },
    { name: "Pricing", href: "/pricing" },
  ];

  if (user) {
    navigation.push({ name: "Dashboard", href: "/dashboard" });
  }

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px]">
          <div className="flex flex-col space-y-4 mt-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-lg font-medium hover:text-brand-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
