import React, { useEffect, useState } from 'react';
import useStore from '../../store';
import StatCard from './StatCard';
import ProductsTable from './ProductsTable';
import ProvidersTable from './ProvidersTable';
import ClientsTable from './ClientsTable';

export default function Statistics() {
  const store = useStore();
  const { fetchTopProducts, fetchTopProviders, fetchTopClients, fetchClientProducts } = store;
  const [topProducts, setTopProducts] = useState([]);
  const [topProviders, setTopProviders] = useState([]);
  const [topClients, setTopClients] = useState([]);
  const [expandedClient, setExpandedClient] = useState(null);
  const [clientProducts, setClientProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState({});

  useEffect(() => {
    loadStatistics();
  }, []); // Solo se ejecuta al montar el componente

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const [products, providers, clients] = await Promise.all([
        fetchTopProducts ? fetchTopProducts() : Promise.resolve([]),
        fetchTopProviders ? fetchTopProviders() : Promise.resolve([]),
        fetchTopClients ? fetchTopClients() : Promise.resolve([])
      ]);
      setTopProducts(products || []);
      setTopProviders(providers || []);
      setTopClients(clients || []);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleClientProducts = async (clientId) => {
    if (expandedClient === clientId) {
      setExpandedClient(null);
      return;
    }

    if (!clientProducts[clientId]) {
      setLoadingProducts({ ...loadingProducts, [clientId]: true });
      try {
        const products = await fetchClientProducts(clientId);
        setClientProducts({ ...clientProducts, [clientId]: products });
      } catch (error) {
        console.error('Error loading client products:', error);
      } finally {
        setLoadingProducts({ ...loadingProducts, [clientId]: false });
      }
    }
    
    setExpandedClient(clientId);
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <h2>📊 Estadísticas</h2>
        <div className="text-center mt-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2>📊 Estadísticas - Últimos 30 días</h2>

      {/* Productos más vendidos */}
      <StatCard 
        title="🏆 Productos Más Vendidos"
        bgColor="bg-primary"
        isEmpty={topProducts.length === 0}
        emptyMessage="No hay datos de ventas en los últimos 30 días"
      >
        <ProductsTable products={topProducts} />
      </StatCard>

      {/* Proveedores que más compraron */}
      <StatCard 
        title="🚚 Proveedores - Mayores Compras"
        bgColor="bg-success"
        isEmpty={topProviders.length === 0}
        emptyMessage="No hay datos de compras en los últimos 30 días"
      >
        <ProvidersTable providers={topProviders} />
      </StatCard>

      {/* Clientes que más compraron */}
      <div className="mb-4">
        <StatCard 
          title="👥 Clientes - Mayores Compras"
          bgColor="bg-info"
          isEmpty={topClients.length === 0}
          emptyMessage="No hay datos de clientes en los últimos 30 días"
        >
          <ClientsTable 
            clients={topClients}
            expandedClient={expandedClient}
            onToggleClient={toggleClientProducts}
            clientProducts={clientProducts}
            loadingProducts={loadingProducts}
          />
        </StatCard>
      </div>

      <div className="text-center mb-4">
        <button className="btn btn-primary" onClick={loadStatistics}>
          🔄 Actualizar Estadísticas
        </button>
      </div>
    </div>
  );
}
