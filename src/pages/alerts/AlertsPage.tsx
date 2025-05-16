// src/pages/alerts/AlertsPage.tsx
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Plus, Minus, Package, ArrowRight, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StockMovementModal from './StockMovementModal';

const AlertsPage: React.FC = () => {
  const { state } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch alerts from backend
  const fetchAlerts = async () => {
    if (!state.isAuthenticated) {
      setError('Vous devez être connecté pour voir les alertes.');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Token d\'authentification manquant. Veuillez vous reconnecter.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching alerts with token:', token); // Debug log
      const response = await axios.get('http://localhost:5000/alerts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Alerts response data:', response.data); // Debug log
      if (Array.isArray(response.data)) {
        setAlerts(response.data);
      } else {
        setAlerts([]);
        console.warn('Unexpected response format, expected array:', response.data);
        setError('Format de réponse inattendu du serveur.');
      }
    } catch (err: any) {
      console.error('Fetch alerts error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Erreur lors du chargement des alertes');
      setAlerts([]); // Ensure alerts is empty on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [state.isAuthenticated]);

  const handleOpenModal = (product: any) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleAddMovement = async (productId: string, quantity: number, type: 'entry' | 'exit') => {
    try {
      const alert = alerts.find(a => a.productId._id === productId);
      if (!alert) {
        setError('Alerte introuvable pour ce produit.');
        return;
      }

      const currentQuantity = alert.productId.quantity;
      const newQuantity = type === 'entry' ? currentQuantity + quantity : currentQuantity - quantity;

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token d\'authentification manquant. Veuillez vous reconnecter.');
        return;
      }

      const updateResponse = await axios.put(
        `http://localhost:5000/products/${productId}`,
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Product update response:', updateResponse.data);

      await axios.post(
        'http://localhost:5000/movements',
        {
          productId,
          quantity,
          type,
          userId: state.user?._id || '1',
          userName: state.user?.username || 'Current User',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh alerts immediately after update
      await fetchAlerts();
      setIsModalOpen(false);
      setError(null);
    } catch (err: any) {
      console.error('Add movement error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du stock');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" color="purple" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="mb-6 flex items-center p-4 bg-red-50 text-red-700 rounded-lg animate-shake">
          <AlertTriangle size={18} className="mr-2 flex-shrink-0" />
          <p className="text-sm">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchAlerts();
            }}
            className="ml-4 text-purple-600 hover:text-purple-800"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="bg-green-50 inline-flex rounded-full p-4 mb-4">
          <Package size={24} className="text-success-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Aucune alerte de stock</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Tous vos produits ont des niveaux de stock suffisants. Il n'y a aucun produit en dessous du seuil minimum.
        </p>
        <button
          onClick={fetchAlerts}
          className="mt-4 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <RefreshCw size={16} className="mr-2" />
          Rafraîchir les alertes
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <AlertTriangle size={24} className="text-warning-500 mr-2" />
          Alertes de Stock
          <span className="ml-2 bg-warning-100 text-warning-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
            {alerts.length}
          </span>
        </h1>
        <button
          onClick={fetchAlerts}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <RefreshCw size={16} className="mr-2" />
          Rafraîchir
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {alerts.map(alert => (
          <div key={alert._id} className="card hover:border-warning-300 group">
            <div className="border-l-4 border-warning-500 h-full flex flex-col">
              <div className="p-4 flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-900 mb-1">{alert.productId.name}</h3>
                  <span className="badge-warning">Stock bas</span>
                </div>
                <p className="text-sm text-gray-500 mb-4">{alert.productId.description || 'N/A'}</p>
                <div className="flex items-center space-x-1 mt-2">
                  <span className="text-lg font-bold text-danger-600">{alert.productId.quantity}</span>
                  <ArrowRight size={14} className="text-gray-400" />
                  <span className="text-success-700">{alert.productId.minStockAlert}</span>
                  <span className="text-sm text-gray-500 ml-1">unités minimum</span>
                </div>
              </div>
              <div className="bg-gray-50 p-3 flex space-x-2 border-t">
                <button
                  onClick={() => handleOpenModal(alert.productId)}
                  className="btn-primary flex-1 flex items-center justify-center py-1"
                >
                  <Plus size={16} className="mr-1" />
                  Réapprovisionner
                </button>
                <button
                  onClick={() => handleOpenModal(alert.productId)}
                  className="btn-outline flex-1 flex items-center justify-center py-1"
                >
                  <Minus size={16} className="mr-1" />
                  Sortie
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {isModalOpen && selectedProduct && (
        <StockMovementModal
          product={selectedProduct}
          onAddMovement={handleAddMovement}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default AlertsPage;