import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import NotFoundPage from "@/pages/NotFoundPage/NotFoundPage";
import CustomersPage from "@/pages/CustomersPage/CustomersPage";
import CustomerFormPage from "@/pages/CustomerFormPage/CustomerFormPage";
import GroupsPage from "@/pages/GroupsPage/GroupsPage";
import RemindersPage from "@/pages/RemindersPage/RemindersPage";
import CustomerDetailPage from "@/pages/CustomerDetailPage/CustomerDetailPage";
import CustomerEditPage from "@/pages/CustomerEditPage/CustomerEditPage";
import SalesPage from "@/pages/SalesPage/SalesPage";
import ProductFormPage from "@/pages/ProductFormPage/ProductFormPage";
import ProductEditPage from "@/pages/ProductEditPage/ProductEditPage";
import ProductDetailPage from "@/pages/ProductDetailPage/ProductDetailPage";
import ProductGroupsPage from "@/pages/ProductGroupsPage/ProductGroupsPage";
import ProductsPage from "@/pages/ProductsPage/ProductsPage";
import InventoryPage from "@/pages/InventoryPage/InventoryPage";
import SalesOrderFormPage from "@/pages/SalesOrderFormPage/SalesOrderFormPage";
import SalesOrderDetailPage from "@/pages/SalesOrderDetailPage/SalesOrderDetailPage";
import DownloadPage from "@/pages/DownloadPage/DownloadPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<CustomersPage />} />
        <Route path="customers/new" element={<CustomerFormPage />} />
        <Route path="customers/:id" element={<CustomerDetailPage />} />
        <Route path="customers/:id/edit" element={<CustomerEditPage />} />
        <Route path="groups" element={<GroupsPage />} />
        <Route path="reminders" element={<RemindersPage />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="products/new" element={<ProductFormPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="products/:id/edit" element={<ProductEditPage />} />
        <Route path="product-groups" element={<ProductGroupsPage />} />
        <Route path="sales-orders/new" element={<SalesOrderFormPage />} />
        <Route path="sales-orders/:id" element={<SalesOrderDetailPage />} />
      </Route>
      <Route path="download" element={<DownloadPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
