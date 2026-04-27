import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "./pages/NotFound.tsx";
import SelectService from "./pages/laundry/SelectService";
import WashAndFoldInfo from "./pages/laundry/WashAndFoldInfo";
import OrderDetails from "./pages/laundry/OrderDetails";
import OrderInstructions from "./pages/laundry/OrderInstructions";
import LastStep from "./pages/laundry/LastStep";
import QuickCheckout from "./pages/quick-checkout/QuickCheckout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/laundry/select-service" replace />} />
          <Route path="/laundry/select-service" element={<SelectService />} />
          <Route path="/laundry/wash-and-fold-info" element={<WashAndFoldInfo />} />
          <Route path="/laundry/order-details" element={<OrderDetails />} />
          <Route path="/laundry/order-instructions" element={<OrderInstructions />} />
          <Route path="/laundry/last-step" element={<LastStep />} />
          <Route path="/quick-checkout" element={<QuickCheckout />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
