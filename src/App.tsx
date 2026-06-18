import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { Toaster } from "@/components/ui/sonner";

import Login from "@/pages/Login";
import Products from "@/pages/Products";
import ProductForm from "@/pages/ProductForm";
import ProductDetails from "@/pages/ProductDetails";
import Trips from "@/pages/Trips";
import TripDetails from "@/pages/TripDetails";
import Dashboard from "@/pages/Dashboard";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Products />} />
              <Route path="/podsumowanie" element={<Dashboard />} />
              <Route path="/produkt/nowy" element={<ProductForm />} />
              <Route path="/produkt/:id" element={<ProductDetails />} />
              <Route path="/produkt/:id/edytuj" element={<ProductForm />} />
              <Route path="/wyjazdy" element={<Trips />} />
              <Route path="/wyjazd/:id" element={<TripDetails />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-center" richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
}
