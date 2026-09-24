import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import HomePage from "./pages/HomePage";
import BasePage from "./pages/BasePage";
import NouveauSchemaPage from "./pages/NouveauSchemaPage";
import SchemaDetailPage from "./pages/SchemaDetailPage";
import RecherchePage from "./pages/RecherchePage";
import ParametresPage from "./pages/ParametresPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/base" element={<BasePage />} />
          <Route path="/nouveau" element={<NouveauSchemaPage />} />
          <Route path="/schema/:id" element={<SchemaDetailPage />} />
          <Route path="/recherche" element={<RecherchePage />} />
          <Route path="/parametres" element={<ParametresPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}